define(["dataContext", "vm/order"], function(dc, order) {

	var viewModel = function() {
		var orders = ko.observableArray();
		var products = ko.observableArray();
		var ordersOfProduct = ko.observableArray();
		var view = ko.observable("orders");
		var selectedProduct = ko.observable();
		var selectedProductTag = ko.observable();

		var showProductsView = function() {
			view("products");
			products.removeAll();
			dc.GetOpenOrders().done(function(listOfOrders) {
				var items = new Array();
				$.each(listOfOrders, function() {
					var productOrder = this;
					$.each(productOrder.Items, function() {
						var item = this;
						if (!items[item.Name]) {
							items[item.Name] = {
								Item : item,
								Delivered : 0,
								Pending : 0,
								Orders : new Array()
							};
						}
						if (item.Delivered == "true") {
							items[item.Name].Delivered++;
						} else {
							items[item.Name].Pending++;
						}

						//add order to list of orders IF not already there
						var found = $.grep(items[item.Name].Orders, function(e) {
							return e._id() == productOrder._id;
						});
						if (found.length==0) {
							items[item.Name].Orders.push(order.ExistingOrderObject(productOrder));
						}
					});
				});
				var itemsArray = []
				for (var key in items) {
					itemsArray.push(items[key]);
				}
				products(itemsArray);
			});
		};

		var showOrdersView = function() {
			view("orders");
			orders.removeAll();
			dc.GetOpenOrders().done(function(listOfOrders) {
				$.each(listOfOrders, function() {
					if(this.Created)
                        orders.push(order.ExistingOrderObject(this));
				});
			});
		};
		showOrdersView();

		var view = ko.observable("orders");
		var switchView = function() {
			if (view() == "orders") {
				showProductsView();
			} else {
				showOrdersView();
			}
		};

		return {
			SwitchView : switchView,
			CurrentView : view,
			Products : products,
			Orders : orders,
			SelectedProduct : selectedProduct,
			SelectedProductTag: selectedProductTag,
			SelectProduct : function(product) {
				selectedProduct(product.Item.Name);
				selectedProductTag(product.Item.Tag);
				ordersOfProduct.removeAll();
				ordersOfProduct(product.Orders.slice(0));
			},
			OrdersOfProduct : ordersOfProduct,
			Select : function(orderInList) {
				require("router").GoToView.OrderById(orderInList._id());
			},
			AddOrder : function(o) {
				orders.push(order.ExistingOrder(o._id));
			},
			RemoveOrder : function(orderId) {
				$.each(orders(), function() {
					if (this._id() == orderId) {
						orders.remove(this);
					}
				});
			},
			UpdateOrder : function(o) {
				$.each(orders(), function() {
					if (this._id() == o._id) {
						orders.replace(this, order.ExistingOrder(o._id));
					}
				});
			}
		};
	};
	var vm;

	return {
		NewInstance : function() {
			vm = new viewModel();
			return vm;
		},
		Change : function(changeNotification) {
			if (vm) {
				if (changeNotification.Action == "Update") {
					vm.UpdateOrder(changeNotification.Data);
				} else if (changeNotification.Action == "Create") {
					vm.AddOrder(changeNotification.Data);
				} else if (changeNotification.Action == "Delete") {
					vm.RemoveOrder(changeNotification.Data._id);
				}
			}
		}
	};
});
