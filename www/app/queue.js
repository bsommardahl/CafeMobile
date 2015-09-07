define(["bsonObjectId", "config", "remoteRepo"], function(bsonObjectId, config, remoteRepo) {

	var store = window.localStorage, debugMode = config.debugMode;

	var workItem = function(type, collection, item) {
		if (debugMode)
			console.log("Queue now has " + queue.count() + " items.");

		var created = new Date();

		var objectId = new bsonObjectId();

		return {
			_id : objectId.toString(),
			Type : type,
			Collection : collection,
			Item : item,
			Created : created,
		};
	};

	var onQueueChange = function() {
	};

	var getCollection = function(key) {
		var result = store.getItem(key);
		if (!result) {
			if (debugMode)
				console.log("Store " + key + " does not exist yet. It will be created on next 'add'.");
			return [];
		}
		var list = JSON.parse(result);
		return list;
	};

	var get = function(list, query) {
		return _.find(list, query);
		
		// if (list.length == 0)
		// 	return;

		// var item = false;
		// $.each(list || [], function() {
		// 	if (query(this)) {
		// 		item = this;
		// 	}
		// });
		// return item;
	};

	var queueKey = ":queue_pending";
	var workingKey = ":queue_working";	
	
	var queue = {
		clear : function() {
			store.setItem(queueKey, JSON.stringify([]));
			store.setItem(workingKey, JSON.stringify([]));
			onQueueChange();
		},
		push : function(workItem) {
			var workItems = getCollection(queueKey);
			workItems.push(workItem);
			var str = JSON.stringify(workItems);
			store.setItem(queueKey, str);
			onQueueChange();
		},
		pop : function() {
			//take out of pending queue
			var workItems = getCollection(queueKey);

			//need to sort by created date here so that the oldest is the next item
			workItems = _.sortBy(workItems, function(i) {
				if (!i)
					return;

				return i.Created;
			});

			var workItem = workItems.shift();
			var newPendingQueue = JSON.stringify(workItems);
			store.setItem(queueKey, newPendingQueue);

			if (workItem) {
				//put into working queue
				var workingItems = getCollection(workingKey);
				var popsSoFar = parseInt(workItem.Pops || "0");
				workItem.Pops = popsSoFar + 1;
				workingItems.push(workItem);
				var newWorkingQueue = JSON.stringify(workingItems);
				store.setItem(workingKey, newWorkingQueue);
				onQueueChange();
			}
			return workItem;
		},
		splat : function(workItemId) {
			//splat is what should happen after a work item is completely done

			console.log("!! Preparing to splat working item: " + workItemId);

			var keyForQueue = workingKey;
			var items = getCollection(keyForQueue);
			console.log(items[0]);
			console.log("Searching working queue for match...");
			var matchingItem = get(items, function(item) {
				return item.Item._id === workItemId;
			});	

			if(!matchingItem){
				toastr.warning("Not found in working queue.");				
				keyForQueue = queueKey;
				items = getCollection(keyForQueue);
				console.log(items);		
				console.log("Item count in pending queue: " + items.length);
				console.log(items[0]);
				
				matchingItem = get(items, function(item) {
					return item.Item._id === workItemId;
				});								
			}
		
			if(!matchingItem){
				toastr.error("That work item was not found. No work was done.");
				return;
			}
			
			console.log("Found working item to splat: " + matchingItem._id);

			//remove working item from working queue
			var index = items.indexOf(matchingItem);
			console.log("Working item index: " + index);
			items.splice(index, 1);
			console.log("Total working items: " + items.length);
			var newWorkingQueue = JSON.stringify(items);
			store.setItem(keyForQueue, newWorkingQueue);
			console.log("Working item removed: " + workItemId);			
			onQueueChange();
		},
		unPop : function(workItemId, error) {
			console.log("unpopping " + workingKey);
			//get item from working queue
			var result = store.getItem(workingKey);
			var list = JSON.parse(result);

			var workingItems = list;

			var workingItem = get(workingItems, function(item) {
				return item._id == workItemId;
			});

			if (!workingItem.errors)
				workingItem.errors = [];
			workingItem.errors.push({
				error : error,
				date : new Date()
			});

			//remove working item from working queue
			console.log("Removing from working queue...");
			var index = workingItems.indexOf(workingItem);
			workingItems.splice(index, 1);
			var newWorkingQueue = JSON.stringify(workingItems);
			store.setItem(workingKey, newWorkingQueue);

			//add item back into pending queue
			console.log("Adding to pending queue...");
			var pendingWorkItems = getCollection(queueKey);
			pendingWorkItems.push(workingItem);
			var newPendingQueue = JSON.stringify(pendingWorkItems);
			store.setItem(queueKey, newPendingQueue);

			onQueueChange();
		},
		count : function() {
			var workItems = getCollection(queueKey);
			return workItems.length;
		}
	};

	var isProcessingItem = false;
	var processNextWorkItem = function() {
		if (!isProcessingItem) {
			var next = queue.pop();
			if (next) {
				isProcessingItem = true;

				var source = get(sources, function(source) {
					return next.Collection == source.Key
				});

				if (!source) {
					//let the item die
					var msg = "No source for " + next.Collection + " was available to process the work item."
					if (debugMode)
						console.log(msg);	
					queue.splat(next._id);				
					isProcessingItem = false;
				} else {
					if (next.Type == "ADD") {
						var restUrl = source.RestUrl;
						remoteRepo.Post(restUrl, next.Item).done(function() {
							if (debugMode) {
								console.log("Item from work queue posted/created to remote repo.");
								console.log(next.Item);
							}
							queue.splat(next._id);
							isProcessingItem = false;
						}).fail(function(err) {
							queue.unPop(next._id, err);
							isProcessingItem = false;
						});
					} else if (next.Type == "UPDATE") {
						var restUrl = source.RestUrl;
						remoteRepo.Put(restUrl, next.Item._id, next.Item).done(function() {
							if (debugMode) {
								console.log("Item from work queue put/updated item in remote repo.");
								console.log(next.Item);
							}
							queue.splat(next._id);
							isProcessingItem = false;
						}).fail(function(err) {
							queue.unPop(next._id, err);
							isProcessingItem = false;
						});
					} else if (next.Type == "REMOVE") {
						var restUrl = source.RestUrl;
						remoteRepo.Delete(restUrl, next.Item._id).done(function() {
							if (debugMode) {
								console.log("Item from work queue deleted item from remote repo.");
								console.log(next.Item);
							}
							queue.splat(next._id);
							isProcessingItem = false;
						}).fail(function(err) {
							queue.unPop(next._id, err);
							isProcessingItem = false;
						});
						isProcessingItem = false;
					} else if (next.Type == "GETALL") {
						var restUrl = source.RestUrl;
						remoteRepo.Get(restUrl).done(function(result) {
							var str = JSON.stringify(result);
							store.setItem(source.Key, str);
							if (debugMode) {
								console.log(result.length + " items from remote resource " + source.RestUrl + " were imported into local collection " + source.Key + ".");
							}
							queue.splat(next._id);
							isProcessingItem = false;
						}).fail(function(err) {
							queue.unPop(next._id, err);
							isProcessingItem = false;
						});
					} else if (next.Type == "REMOVEALL") {
						var restUrl = source.RestUrl;
						remoteRepo.Delete(restUrl).done(function(result) {
							if (debugMode) {
								console.log("Remote resource " + source.RestUrl + " was cleared.");
							}
							queue.splat(next._id);
							isProcessingItem = false;
						}).fail(function(err) {
							queue.unPop(next._id, err);
							isProcessingItem = false;
						});
					} else {
						var msg = "No handler for work item type " + next.Type + ".";
						if (debugMode)
							console.log(msg);
						queue.unPop(next, msg);
						isProcessingItem = false;
					}
				}
				if (debugMode)
					console.log("Pending queue now has " + queue.count() + " items.");
			}
		}
	};

	var onChanges = function() {
	};

	var requestNewChanges = function() {
		var s = store.getItem("session");
		var session = JSON.parse(s) || {};
		var currentVersion = session.LocationVersion || 0;

		remoteRepo.GetChanges(currentVersion).done(function(changes) {
			if (changes.length > 0) {
				$.each(changes, function() {
					var changeVersion = parseInt(this.Version);
					if (changeVersion > currentVersion)
						currentVersion = changeVersion;
				});

				session.LocationVersion = currentVersion
				store.setItem("session", JSON.stringify(session));
				onChanges(changes);
			}
		});
	};

	var workQueueTimer;
	var serverChangesTimer;

	var isPolling = ko.observable(false);

	var startPolling = function() {
		isProcessingItem = false;
		workQueueTimer = setInterval(processNextWorkItem, config.QueuePollingInterval);

		serverChangesTimer = setInterval(requestNewChanges, 5000);
		isPolling(true);
		if (debugMode)
			console.log("### Started polling.");
	};

	var stopPolling = function() {
		clearInterval(workQueueTimer);
		clearInterval(serverChangesTimer);
		serverChangesTimer = null;
		workQueueTimer = null;
		isPolling(false);
		if (debugMode)
			console.log("### Stopped polling.");
	};

	var isConnected = ko.observable(false);

	var connect = function() {
		isConnected(true);
		//startPolling();
	};

	var disconnect = function() {
		isConnected(false);
		stopPolling();
	};

	var onAjaxError = function(err) {
		stopPolling();
	};

	remoteRepo.SetOnAjaxError(onAjaxError);

	var getAllPending = function() {
		var q = getCollection(queueKey);
		q = _.sortBy(q, function(i) {
			return i.Created;
		});
		return q;
	};

	var getAllWorking = function() {
		var q = getCollection(workingKey);
		q = _.sortBy(q, function(i) {
			return i.Created;
		});
		return q;
	};

	$.each(getAllWorking(), function() {
		queue.unPop(this._id);
	});

	var clearQueue = function() {
		queue.clear();
	};

	return {
		StartPolling : startPolling,
		StopPolling : stopPolling,
		Clear : clearQueue,
		Push : function(type, collection, item) {
			queue.push(new workItem(type, collection, item));
		},
		SetOnQueueChange : function(cb) {
			onQueueChange = cb;
		},
		RemoveWorkItem: function(id){
			queue.splat(id);
		},
		Connect : connect,
		Disconnect : disconnect,
		IsPolling : isPolling,
		IsConnected : isConnected,
		GetAllPending : getAllPending,
		GetAllWorking : getAllWorking,
		SetSources : function(s) {
			sources = s;
		},
		SetOnChanges : function(cb) {
			onChanges = cb;
		}
	};
});
