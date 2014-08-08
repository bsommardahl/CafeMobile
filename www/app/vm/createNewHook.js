define(["dataContext"], function(dc) {

	var viewModel = function() {

		var eventName = ko.observable();
		var postUrl = ko.observable();
		
		var save = function() {
			var hook = {
				EventName: eventName(),
				PostUrl: postUrl()
			};
			dc.Hooks.Create(hook).done(function() {
				if (callback)
					callback(hook);
			});
		};

		var callback = null;

		return {
			EventName : eventName,
			PostUrl : postUrl,
			Create: save,
			OnSuccess : function(cb) {
				callback = cb;
			}
		};
	};

	return {
		NewInstance : function() {
			return new viewModel();
		}
	};
});
