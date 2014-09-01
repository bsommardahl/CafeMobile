define(["require", "bsonObjectId", "queue", "remoteRepo", "config"], function(require, bsonObjectId, queue, remoteRepo, config) {

	var store = window.localStorage, debugMode = false;

	var sources = [{
		Key : "/products",
		RestUrl : "/products",
	}, {
		Key : "/tags",
		RestUrl : "/tags",
	}, {
		Key : "/orders",
		RestUrl : "/orders",
	}, {
		Key : "/vendors",
		RestUrl : "/vendors",
	}, {
		Key : "/employees",
		RestUrl : "/employees",
	}, {
		Key : "/debits",
		RestUrl : "/debits",
	}, {
		Key : "/users",
		RestUrl : "/users"
	}, {
		Key : "/locations",
		RestUrl : "/locations"
	}, {
		Key : "/times",
		RestUrl : "/times"
	}];

	queue.SetSources(sources);
	var get = function(list, query) {
		if (list.length == 0)
			return;

		var item;
		$.each(list || [], function() {
			if (query(this)) {
				item = this;
			}
		});
		return item;
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

	var query = function(collection, query) {
		if (!query) {
			query = function() {
				return true;
			};
		}
		var def = $.Deferred();
		var list = getCollection(collection);
		var matches = [];
		if (list) {
			$.each(list, function() {
				if (query(this)) {
					matches.push(this);
				}
			});
			if (debugMode) {
				console.log("Query returned " + matches.length + " matches:");
				console.log(matches);
			}
			def.resolve(matches);
		}
		return def;
	};

	var first = function(collection, query) {
		if (!query) {
			alert("ERROR: Cannot local.first without 'query' param.");
		}
		var def = $.Deferred();
		var list = getCollection(collection);
		var matches = [];
		if (list) {
			$.each(list, function() {
				if (query(this)) {
					matches.push(this);
				}
			});
			if (matches.length == 0) {
				var msg = "'First' query on collection " + collection + " returned no results.";
				if (debugMode)
					console.log(msg);
				def.reject(msg);
			} else {
				if (debugMode) {
					console.log("First returned:");
					console.log(matches[0]);
				}
				def.resolve(matches[0]);
			}
		}
		return def;
	};

	var add = function(collection, item, skipQueue) {

		var list = getCollection(collection);
		if (!item._id) {
			var objectId = new bsonObjectId();
			item._id = objectId.toString();
		}

		//first check to make sure the item is not already in the store
		var existingItem = get(list, function(i) {
			return i._id == item._id
		});
		if (existingItem) {
			var failureReason = "Existing item. Not adding to collection.";
			var def = $.Deferred();
			def.reject(failureReason);
			return def;
		}

		list.push(item);
		if (!skipQueue)
			queue.Push("ADD", collection, item);
		var str = JSON.stringify(list);
		store.setItem(collection, str);
		if (debugMode)
			console.log("Item added to " + collection + ". New length is " + list.length + ".");
		var def = $.Deferred();
		def.resolve(item);
		return def;
	};

	var update = function(collection, query, changes, skipQueue) {
		var list = getCollection(collection);
		var changedItems = [];
		$.each(list, function() {
			if (query(this)) {
				var changedItem = changes(this);
				changedItems.push(changedItem);
				var index = list.indexOf(this);
				list[index] = changedItem;
				if (!skipQueue)
					queue.Push("UPDATE", collection, changedItem);
				if (debugMode)
					console.log("Changed " + JSON.stringify(changedItem));
			}
		});

		if (changedItems.length == 0) {
			if (debugMode)
				console.log("No work done.");
			return $.Deferred();
		} else {
			var str = JSON.stringify(list);
			store.setItem(collection, str);
			var def = $.Deferred();
			def.resolve(changedItems);
			return def;
		}
	};

	var getAll = function(collection) {
		queue.Push("GETALL", collection);
		return $.Deferred();
	};

	var removeAll = function(collection) {
		queue.Push("REMOVEALL", collection);
		return $.Deferred();
	};

	var remove = function(collection, query, skipQueue) {
		console.log("Removing item from " + collection + " collection:");
		var list = getCollection(collection);
		var removedItems = [];
		$.each(list, function() {
			if (query(this)) {
				console.log("Removing " + this._id);
				var itemToRemove = this;
				var index = list.indexOf(itemToRemove);
				list.splice(index, 1);
				removedItems.push(itemToRemove);
				if (!skipQueue)
					queue.Push("REMOVE", collection, itemToRemove);
				if (debugMode)
					console.log("Removed " + JSON.stringify(itemToRemove));
			}
		});
		if (removedItems.length == 0) {
			console.log("No work done.");
			return $.Deferred().resolve();
		} else {
			var str = JSON.stringify(list);
			store.setItem(collection, str);
			var def = $.Deferred();
			def.resolve(removedItems);
			return def;
		}
	};

	var processChange = function(changeNotification) {
		var doNotQueue = true;

		var changeViewModel = function() {
			console.log("### CHANGING");
			var viewModelUpdater = require("viewModelUpdater");
			viewModelUpdater.Update(changeNotification);
		};
		//need to use promises here

		//first, change the local store
		if (changeNotification.CollectionKey == "orders") {
			if (changeNotification.Action == "Create") {
				add("/orders", changeNotification.Data, doNotQueue).done(changeViewModel);

			} else if (changeNotification.Action == "Delete") {
				remove("/orders", function(item) {
					return item._id == changeNotification.Data._id;
				}, doNotQueue).done(changeViewModel);

			} else if (changeNotification.Action == "Update") {
				update("/orders", function(item) {
					return item._id == changeNotification.Data._id;
				}, function(item) {
					return changeNotification.Data;
				}, doNotQueue).done(changeViewModel);

			}
		}
	};

	queue.SetOnChanges(function(changes) {
		$.each(changes, function() {
			var change = this;
			processChange(change);
		});
	});

	var local = {
		Query : query,
		First : first,
		Add : add,
		Update : update,
		Remove : remove,
		Configure : function(options) {
			if (options.DebugMode)
				debugMode = options.DebugMode;
		},
		PushSync : function() {
			$.each(sources, function() {
				var source = this;
				var col = getCollection(source.Key);
				//put data from each source
				$.each(col, function() {
					var item = this;
					update(source.Key, function(i) {
						return i._id == item._id;
					}, function() {
						return item
					});
				});
			});

		},
		PullSync : function() {
			store.clear();
			$.each(sources, function() {
				var source = this;
				getAll(source.Key);
			});
		},
		StartPolling : function() {
			queue.StartPolling();
		},
		StopPolling : function() {
			queue.StopPolling();
		},
		Connect : function() {
			queue.Connect();
			queue.StartPolling();
		},
		Disconnect : queue.Disconnect,
		GetPendingQueue : function() {
			var def = $.Deferred();
			def.resolve(queue.GetAllPending());
			return def;
		},
		GetWorkingQueue : function() {
			var def = $.Deferred();
			def.resolve(queue.GetAllWorking());
			return def;
		},
		IsPolling : queue.IsPolling,
		IsConnected : queue.IsConnected,
		SetOnQueueChange : function(callback) {
			queue.SetOnQueueChange(callback);
		},
		Restore : function(restoreBundle) {
			var confirmed = confirm("Are you sure you want to restore all local data with this bundle created on " + restoreBundle.CafeBackup.Generated + "?")
			if (confirmed) {
				$.each(restoreBundle.CafeBackup.Sources, function() {
					var source = this;
					store.setItem(source.Collection, JSON.stringify(source.Data));
					console.log("Restored " + source.Data.length + " records in " + source.Collection + ".");
				});
			}
		},
		RemoveWorkItem: function(workItemId){
			queue.RemoveWorkItem(workItemId);
		},
		ClearQueue: function(){
			queue.Clear();
		},
		ClearRemoteDatabase : function() {
			var def = $.Deferred();
			$.each(sources, function() {
				removeAll(this.Key);
			});
			return def;
		},
		GetAllData : function() {

			var def = $.Deferred();
			var s = [];
			var data = {
				CafeBackup : {
					Generated : moment()._d,
					Sources : s
				}
			};

			$.each(sources, function() {
				var col = getCollection(this.Key);
				s.push({
					Collection : this.Key,
					Data : col
				});
			});

			s.push({
				Collection : queueKey,
				Data : getCollection(queueKey)
			});

			s.push({
				Collection : workingKey,
				Data : getCollection(workingKey)
			});

			def.resolve(data);
			return def;
		}
	};

	return local;
});
