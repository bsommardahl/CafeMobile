﻿define(["dataContext", "dialog", "cafeEvents"], function(dc, dialog, cafeEvents) {

	var viewModel = function(orderId) {

		var customerName = ko.observable();
		var items = ko.observableArray();
		var amountPaid = ko.observable();
		var taxPaid = ko.observable();
		var paid = ko.observable();
		var created = ko.observable();

		var total = ko.computed(function() {
			var t = 0;
			$.each(items(), function() {
				t = t + parseFloat(this.Price);
			});
			return t;
		});

		var rawOrder = null;
		
		var printReceipt = function(){
			if(rawOrder){
				toastr.info("Recibo ha sido enviado a la impresora.", "Exito")
				cafeEvents.trigger('ReprintReceipt', [rawOrder]);
			}			
		};

		var formattedPaidDate = ko.computed(function() {
			return moment(paid()).format("MM/DD/YYYY hh:mm A");
		});

		var formattedCreatedDate = ko.computed(function() {
			return moment(created()).format("MM/DD/YYYY hh:mm A");
		});

		var getOrder = function() {
			dc.GetOrderById(orderId).done(function(order) {
				rawOrder = order;
				customerName(order.CustomerName);
				paid(moment(order.Paid).format("MM/DD/YYYY hh:mm A"));
				created(moment(order.Created)._d);
				amountPaid(order.AmountPaid);
				taxPaid(order.TaxPaid);
				items.removeAll();
				$.each(order.Items, function() {
					items.push(this);
				});
			});
		};
		getOrder();

		var deleteOrder = function() {
			if (confirm("Estas seguro?")) {
				console.log("Deleting order " + orderId);
				dc.Orders.Delete(orderId).done(function() {
					console.log("done deleting order " + orderId);
					if (callback)
						callback();
				});
			}
		};

		var callback;

		var isChangingPaidDate = ko.observable(false);
        var isChangingCreatedDate = ko.observable(false);
        
		return {
			Id : orderId,
			CustomerName : customerName,
			PaidDate: formattedPaidDate,
			CreatedDate: formattedCreatedDate,
			Items : items,
			Total : total,
			AmountPaid : amountPaid,
			TaxPaid: taxPaid,
			
			DeleteOrder : deleteOrder,
			OnSuccess : function(callbackFromOutside) {
				callback = callbackFromOutside;
			},
			IsChangingPaidDate : isChangingPaidDate,
            IsChangingCreatedDate: isChangingCreatedDate,
			SavePaidDateChange : function() {
				dc.Orders.ChangePaidDate(orderId, paid()).done(function() {					
					isChangingPaidDate(false);
				});
			},
			SaveCreatedDateChange : function() {
				dc.Orders.ChangeCreatedDate(orderId, created()).done(function() {					
					isChangingCreatedDate(false);
				});
			},
			CancelPaidDateChange : function() {
				isChangingPaidDate(false);
			},
			CancelCreatedDateChange : function() {
				isChangingCreatedDate(false);
			},
			Paid : paid,
			Created : created,
			ChangePaidDate : function() {
				isChangingPaidDate(true);
			},
            ChangeCreatedDate : function() {
				isChangingCreatedDate(true);
			},
			ReprintReceipt: printReceipt
		};
	};

	return {
		NewInstance : function(orderId) {
			return new viewModel(orderId);
		}
	};
});
