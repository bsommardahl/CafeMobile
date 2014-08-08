define(["localStore", "dialog"], function(localStore, dialog) {

	var viewModel = function() {

		var pendingWorkItems = ko.observableArray();

		var getPendingWorkItems = function() {
			localStore.GetPendingQueue().done(function(list) {
				pendingWorkItems.removeAll();
				$.each(list, function() {
					pendingWorkItems.push({
						Type : this.Type,
						Collection : this.Collection,
						Item : JSON.stringify(this.Item),
						Created : moment(this.Created)._d,
						Attempts : this.Pops,
						Errors : this.errors || []
					});
				});
			});
		};
		getPendingWorkItems();

		localStore.OnPendingWorkItemsChange = getPendingWorkItems;

		var workingWorkItems = ko.observableArray();

		var getWorkingWorkItems = function() {
			localStore.GetWorkingQueue().done(function(list) {
				workingWorkItems.removeAll();
				$.each(list, function() {
					workingWorkItems.push({
						Type : this.Type,
						Collection : this.Collection,
						Item : JSON.stringify(this.Item),
						Created : moment(this.Created)._d,
						Attempts : this.Pops
					});
				});
			});
		};
		getWorkingWorkItems();

		localStore.SetOnQueueChange(function() {
			getPendingWorkItems();
			getWorkingWorkItems();
		});

		var isPolling = localStore.IsPolling;

		var status = ko.computed(function() {
			var con = "Disconnected";
			if (localStore.IsConnected()) {
				con = "Connected";
			}
			var pol = ", Not Polling";
			if (isPolling()) {
				pol = ", Polling";
			}
			return con + pol;
		});

		return {
			PendingWorkItems : pendingWorkItems,
			WorkingWorkItems : workingWorkItems,
			Push : function() {
				localStore.PushSync();
			},
			Pull : function() {
				localStore.PullSync();
			},
			Stop : function() {
				localStore.StopPolling();
			},
			Start : function() {
				localStore.StartPolling();
			},
			ClearQueue : function() {
				localStore.ClearQueue();
			},
			IsConnected : localStore.IsConnected,
			IsPolling : localStore.IsPolling,
			Status : status,
			viewErrors : function(workItem) {
				console.log(workItem);
				dialog.Open("viewWorkItemErrors", workItem, {
					title : "Work Item Errors"
				});
			},
			Backup : function() {
				var title = "Cafe Backup " + moment()._d;
				localStore.GetAllData().done(function(data) {
					dialog.OpenContent("<textarea style='width: 90%; height: 200px'>" + JSON.stringify(data) + "</textarea>", {
						title : title
					});
				});

			},
			Restore : function() {
				var data = ko.observable();
				var onSuccess = function() {
				};
				var restoreVM = {
					Data : data,
					Restore : function() {
						var json = JSON.parse(data());
						localStore.Restore(json);
						onSuccess();
					},
					OnSuccess : function(cb) {
						onSuccess = cb;
					}
				};
				dialog.Open("restore", restoreVM, {
					title : "Restore Local Data"
				});

			},
			HardPush : function() {
				localStore.ClearRemoteDatabase();
				localStore.PushSync();
			}
		};
	};

	return {
		NewInstance : function() {
			return new viewModel();
		}
	};
});
