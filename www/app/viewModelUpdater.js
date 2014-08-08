define(["vm/orders", "vm/order"], function(orders, order) {

	var controllers = [{
		Type : "orders",
		Controller : orders
	}, {
		Type : "orders",
		Controller : order
	}];

	return {
		Update : function(changeNotification) {
			$.each(controllers, function() {
				if (changeNotification.CollectionKey == this.Type) {
					console.log("found controller: " + this.Type);
					this.Controller.Change(changeNotification);
				}
			});
		}
	};
});
