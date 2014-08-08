define(["dataContext"], function(dc) {

	var viewModel = function(orderId, customerNameObservable) {
		var name = ko.observable(customerNameObservable());

		var callback;

		return {
			Name : name,
			Save : function() {
				customerNameObservable(name());
				if (callback) callback();
			},
			OnSuccess : function(callbackFromOutside) {
				callback = callbackFromOutside;				
			}
		};
	};

	return {
		NewInstance : function(orderId, customerNameObservable) {
			return new viewModel(orderId, customerNameObservable);
		}
	};
});
