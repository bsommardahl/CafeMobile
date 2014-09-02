define(["dataContext", "dialog", "vm/createNewHook", "hookPoster", "cafeEvents"], function(dc, dialog, createNewHook, hookPoster, cafeEvents) {

	var viewModel = function() {

		var hooks = ko.observableArray();

		var getHooks = function() {
			dc.Hooks.GetAll().done(function(list) {
				hooks(list);
			});
		};
		getHooks();

		return {
			Hooks : hooks,
			Delete : function(hook) {
				if (confirm("Estas seguro?")) {
					dc.Hooks.Delete(hook._id).done(function() {
						hooks.remove(hook);
					});
				}
			},
			Create : function() {
				dialog.Open("createNewHook", createNewHook.NewInstance(), {
					title : "Creating New Hook"
				}, getHooks);
			},
			Init : function() {		
				console.log("Initializing hooks...");
				dc.Hooks.GetAll().done(function(list) {
					$.each(list, function() {
						var hook = this;
						cafeEvents.addListener(hook.EventName, function(obj) {							
							if (obj){								
								hookPoster.Post(hook.PostUrl, obj);
							}							
						});
						console.log("Added event hook for " + hook.EventName + " to " + hook.PostUrl + ".");
					});					
				});
			}
		};
	};

	return {
		NewInstance : function() {
			return new viewModel();
		}
	};
});
