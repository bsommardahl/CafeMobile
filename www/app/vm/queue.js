define(["localStore", "dialog"], function(localStore, dialog) {

	var viewModel = function() {

		var pendingWorkItems = ko.observableArray();

		var getPendingWorkItems = function() {
			localStore.GetPendingQueue().done(function(list) {
				pendingWorkItems.removeAll();
				$.each(list, function() {
					pendingWorkItems.push({
						_id : this._id,
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

		var forceWorkItem = function(workItem){
			if(!workItem) throw new Error("No work item was passed to the function 'forceWorkItem'.");

			console.log("Waiting for user input to force-process work item.");	
			if(confirm("Are you sure you want to force-process this work item? This action could corrupt your database.")){
				console.log("Received order to force-process work item " + workItem._id);
				console.log(workItem);
				localStore.ForceWorkItem(workItem._id);
				getPendingWorkItems();
			}
		};
		
		var deleteWorkItem = function(workItem){			
			console.log(workItem._id);				
			if(confirm("Are you sure you want to remove this work item? This action could corrupt your database.")){
				localStore.RemoveWorkItem(workItem._id);
				getPendingWorkItems();
			}
		};

		var getWorkingWorkItems = function() {
			localStore.GetWorkingQueue().done(function(list) {
				workingWorkItems.removeAll();
				$.each(list, function() {
					workingWorkItems.push({
						_id : this._id,
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
			forceWorkItem: forceWorkItem,
			deleteWorkItem: deleteWorkItem,
			IsConnected : localStore.IsConnected,
			IsPolling : localStore.IsPolling,
			Status : status,
			viewErrors : function(workItem) {
				console.log(workItem);
				workItem.Errors = _.map(workItem.Errors, function(e){
					e.error = e.error || { "status": "unknown", "responseText": "none"};
					return e;
				});
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
			SendBackup: function(){
				var domain = "appb4072e3f1d414f3f818f91c732703cee.mailgun.org";
				var key = "key-857a62aaed82f21ea1760e2ca20ac7ed";
				var toAddress = "sommardahl@gmail.com";

				function make_base_auth(user, password) {
				  var tok = user + ':' + password;
				  var hash = btoa(tok);
				  return "Basic " + hash;
				}

				localStore.GetAllData().done(function(data) {					

					var ajaxPayload = {
						url: 'http://emailer-3.apphb.com/mail',
					    type: 'POST',
					    dataType: 'json',
					    data: {
					    	Name: 'Cafe',					    	
					    	Email: 'cafe@no-reply.com',	
					    	To: toAddress,
					    	Project: "Cafe Backup",
					    	Message: JSON.stringify(data)
					    },
					    success: function(data, textStatus, jqXHR){
					    	alert("Email sent.");
					    	console.log(textStatus);
					    	console.log(data);
					    },
					    error: function(jqXHR, status, err){
						    console.log("Something went wrong while sending the email.");
				    		console.log(status);
				    		console.log(err);	
					    },
					    complete: function(){
					    	console.log("mail send complete.");
					    }					   
					};

					$.ajax(ajaxPayload);					
				});				
			},
			// Restore : function() {
			// 	var data = ko.observable();
			// 	var onSuccess = function() {
			// 	};
			// 	var restoreVM = {
			// 		Data : data,
			// 		Restore : function() {
			// 			var json = JSON.parse(data());
			// 			localStore.Restore(json);
			// 			onSuccess();
			// 		},
			// 		OnSuccess : function(cb) {
			// 			onSuccess = cb;
			// 		}
			// 	};
			// 	dialog.Open("restore", restoreVM, {
			// 		title : "Restore Local Data"
			// 	});

			// },
			// HardPush : function() {
			// 	//console.log("Command to hard push.");				
			// 	//localStore.ClearRemoteDatabase().done(function(){
			// 		//localStore.PushSync();
			// 	//});
			// }
		};
	};

	return {
		NewInstance : function() {
			return new viewModel();
		}
	};
});
