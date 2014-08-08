define(["dataContext", "dialog", "vm/correctCustomerName", "cafeEvents"], function(dc, dialog, correctCustomerName, cafeEvents) {

	var order = function() {

		var paymentViewModel = function(orderTotal, paymentConfirmed) {

			var amount = ko.observable(orderTotal);

			var callback = null;

			var printReceipt = true;
			var dontPrintReceipt = false;

			return {
				AmountPaid : amount,
				SaveNoReceipt: function(){
					if (callback)
						callback();
					paymentConfirmed(amount(), dontPrintReceipt);
				},
				Save : function() {
					if (callback)
						callback();
					paymentConfirmed(amount(), printReceipt);
				},
				OnSuccess : function(cb) {
					callback = cb;
				}
			};
		};

		var itemViewModel = function(item) {

			var delivered = ko.observable(false);
			if (item.Delivered) {
				if (item.Delivered == "true" || item.Delivered == true) {
					delivered(true);
				} else {
					delivered(false);
				}
			}

			return {
				_id : item._id,
				Name : item.Name,
				ImageSrc : item.ImageSrc,
				TaxRate : item.TaxRate,
				Price : item.Price,
				Tag : item.Tag,
				Delivered : delivered
			};
		};

		var _id = ko.observable();
		var name = ko.observable();
		var paid = ko.observable();
		var created = ko.observable();
		var createdTime = ko.computed(function() {
			if (created()) {
				return moment(created()).format("M/D/YYYY");
			}
		});
		var createdDate = ko.computed(function() {
			if (created()) {
				return moment(created()).format("h:mm A");
			}
		});
		var items = ko.observableArray();

		var taxAmount = ko.computed(function() {
			var t = 0;
			$.each(items(), function() {
				var price = parseFloat(this.Price);
				var rate = parseFloat(this.TaxRate || "0");
				t = t + (price * rate);
			});
			return parseFloat(Math.round(t * 100) / 100).toFixed(2);
		});

		var subTotal = ko.computed(function() {
			var t = 0;
			$.each(items(), function() {
				t = t + parseFloat(this.Price);
			});
			return parseFloat(Math.round(t * 100) / 100).toFixed(2);
		});

		var total = ko.computed(function() {
			var tot = parseFloat(taxAmount()) + parseFloat(subTotal());
			if (tot == 0)
				return parseFloat("0").toFixed(2);
			return parseFloat(Math.round(tot * 100) / 100).toFixed(2);
		});

		var countOfItemsDelivered = ko.computed(function() {
			var count = 0;
			$.each(items(), function() {
				if (this.Delivered()) {
					count = count + 1;
				}
			});
			return count;
		});
		var hasUndeliveredItems = ko.computed(function() {
			return countOfItemsDelivered() !== items().length;
		});
		var hasDeliveredItems = ko.computed(function() {
			return countOfItemsDelivered() > 0;
		});
		var amountPaid = ko.observable();

		var printReceipt = function(){
			toastr.info("Recibo ha sido enviado a la impresora.", "Exito")
			cafeEvents.trigger('ReprintReceipt', [buildOrderToSave()]);			
		};

		var buildOrderToSave = function() {
			return {
				_id : _id(),
				CustomerName : name(),
				Items : ko.toJS(items()),
				AmountPaid : amountPaid(),
				Paid : paid(),
				TaxPaid : amountPaid() > 0 ? taxAmount() : 0,
				AllDelivered : !hasUndeliveredItems(),
			};
		};

		return {
			CustomerName : name,
			Items : items,
			Paid : paid,
			Created : created,
			CreatedDate : createdDate,
			CreatedTime : createdTime,
			_id : _id,
			AddItem : function(item) {
				var vm = new itemViewModel(item);
				items.push(vm);
			},
			RemoveItem : function(item) {
				if (confirm("Estas seguro?")) {
					items.remove(item);
				}
			},
			DeliverItem : function(item) {
				item.Delivered(true);
			},
			UndeliverItem : function(item) {
				item.Delivered(false);
			},
			HasUndeliveredItems : hasUndeliveredItems,
			HasDeliveredItems : hasDeliveredItems,
			CountOfItemsDelivered : countOfItemsDelivered,
			PrintReceipt : printReceipt,
			Save : function() {
				var orderToSave = buildOrderToSave();

				var whenFinished = function() {
					require("router").GoToView.Caja();
					toastr.info("Orden de " + name() + " Guardado.");
				};

				if (!_id()) {
					dc.CreateOrder(orderToSave).then(function() {
						cafeEvents.trigger('OrderCreated', [orderToSave]);
					}).done(whenFinished);

				} else {
					dc.UpdateOrder(orderToSave).then(function() {
						cafeEvents.trigger('OrderUpdated', [orderToSave]);
					}).done(whenFinished);

				}

			},
			AmountPaid : amountPaid,
			Pay : function() {
				var onPaymentConfirmed = function(amount, printReceipt) {

					amountPaid(amount);
					paid(new Date());

					var orderToPay = buildOrderToSave();

					var whenFinished = function() {
						require("router").GoToView.Caja();
						toastr.success("Orden de " + name() + " Pagado.");
					};

					if (!_id()) {
						console.log("Creating paid order.");
						dc.CreateOrder(orderToPay).then(function() {
							cafeEvents.trigger('OrderCreated', [orderToPay]);
							cafeEvents.trigger('OrderPaid', [orderToPay]);
							if(printReceipt){
								toastr.info("Recibo ha sido enviado a la impresora.", "Exito")	
								cafeEvents.trigger('PrintReceipt', [orderToPay]);
							}
						}).done(whenFinished);
					} else {
						console.log("Updating paid order.");
						dc.UpdateOrder(orderToPay).then(function() {
							cafeEvents.trigger('OrderUpdated', [orderToPay]);
							cafeEvents.trigger('OrderPaid', [orderToPay]);
							if(printReceipt){
								toastr.info("Recibo ha sido enviado a la impresora.", "Exito")		
								cafeEvents.trigger('PrintReceipt', [orderToPay]);
							}
						}).done(whenFinished);
					};					
				};

				dialog.Open("confirmPayment", new paymentViewModel(total(), onPaymentConfirmed), {
					modal : true,
					title : "Confirmation"
				});
			},
			DeleteOrder : function() {
				if (confirm("Estas seguro?")) {
					var whenFinished = function() {
						require("router").GoToView.Caja();
						toastr.warning("Orden de " + name() + " Borrado.");
					};
					if (_id()) {
						dc.Orders.Delete(_id()).then(function() {
							cafeEvents.trigger('OrderDeleted', [buildOrderToSave()]);							
						}).done(whenFinished);
					} else {
						whenFinished();
					}

				}
			},
			Total : total,
			SubTotal : subTotal,
			TaxAmount : taxAmount,
			LoadFromExisting : function(orderId) {
				dc.GetOrderById(orderId).done(function(existingOrder) {
					name(existingOrder.CustomerName);
					paid(existingOrder.Paid);
					created(existingOrder.Created);
					amountPaid(existingOrder.AmountPaid);
					_id(existingOrder._id);
					items.removeAll();
					$.each(existingOrder.Items, function() {
						items.push(new itemViewModel(this));
					});
				});
			},
			LoadFromExistingObject : function(orderObject) {
				name(orderObject.CustomerName);
				paid(orderObject.Paid);
				created(orderObject.Created);
				amountPaid(orderObject.AmountPaid);
				_id(orderObject._id);
				items.removeAll();
				$.each(orderObject.Items, function() {
					items.push(new itemViewModel(this));
				});
			},
			CreateFromCustomerName : function(customerName) {
				name(customerName);
			},
			CorrectCustomerName : function() {
				dialog.Open("correctCustomerName", correctCustomerName.NewInstance(_id(), name), {
					modal : true,
					title : "Correct Customer Name"
				});
			}			
		};
	};

	var vm;

	return {
		NewOrder : function(customerName) {
			vm = new order();
			vm.CreateFromCustomerName(customerName);
			return vm;
		},
		ExistingOrder : function(orderId) {
			vm = new order();
			vm.LoadFromExisting(orderId);
			return vm;
		},
		ExistingOrderObject : function(existingOrder) {
			vm = new order();
			vm.LoadFromExistingObject(existingOrder);
			return vm;
		},
		Change : function(changeNotification) {
			if (vm) {
				if (vm._id() == changeNotification.Data._id) {
					if (changeNotification.Action == "Update") {
						vm.LoadFromExisting(changeNotification.Data._id);
					}
					// else if (changeNotification.Action == "delete") {
					// vm.RemoveOrder(changeNotification.Data._id);
					// }
				}
			}
		}
	};
});
