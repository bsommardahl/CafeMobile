require.config({
	paths : {
		'moment' : '../js/moment.min'
	}
});

require(["viewModelUpdater", "localStore", "dataContext", "config", "router", "mobileApp", "vm/startOrder", "vm/order", "vm/tags", "vm/itemsByTag", "vm/orders", "vm/sales", "vm/items", "vm/item", "vm/debits", "vm/employees", "vm/employee", "vm/hooks", "eventEmitter"], function(viewModelUpdater, local, dc, config, router, mobileApp, startOrder, order, tags, itemsByTag, orders, sales, items, item, debits, employees, employe, hooks, eventEmitter) {

	local.Configure({
		DebugMode : true
	});

	mobileApp.initialize(function() {
		var location = ko.observable("Cafe");
		dc.Location.Get().done(function(loc) {
			location(loc.Name);
		});

		hooks.NewInstance().Init();

		var navigation = {
			GoToCaja : function() {
				router.GoToView.Caja();
				return false;
			},
			GoToSales : function() {
				console.log("going to sales.");
				router.GoToView.Sales();
				return false;
			},
			GoToDebits : function() {
				router.GoToView.Debits();
				return false;
			},
			GoToEmployees : function() {
				router.GoToView.Employees();
				return false;
			},
			GoToAdmin : function() {
				router.GoToView.Admin();
				return false;
			},
			Location : location,
			Polling : ko.computed(function() {
				var polling = local.IsPolling();
				return polling;
			}),
			TryToStartPolling : function() {
				local.StartPolling();
			}
		};

		ko.applyBindings(navigation, $("#nav")[0]);

		router.GoToView.Caja();

	});

	ko.bindingHandlers["tap"] = {
		'init' : function(element, valueAccessor, allBindingsAccessor, viewModel) {
			var t = new Tap(element);
			var newValueAccessor = function() {
				return {
					'tap' : valueAccessor()
				};
			};
			return ko.bindingHandlers['event']['init'].call(this, element, newValueAccessor, allBindingsAccessor, viewModel);
		}
	};

	$.ajaxSetup({
		// Disable caching of AJAX responses
		cache : false,
		beforeSend : function() {
			$('#loading').show();
		},
		complete : function() {
			$('#loading').hide();
		},
		success : function() {
			$('#loading').hide();
		},
		error : function() {
			$('#loading').hide();
		}
	});

	local.Connect();

	if (window.device) {

		document.addEventListener("deviceready", function() {
			console.log("deviceready");
			document.addEventListener("online", function() {				
				console.log("online");
				local.Connect();
			}, false);
			document.addEventListener("offline", function() {
				console.log("offline");
				local.Disconnect();
			}, false);
		}, false);
	}

	toastr.options = {
		positionClass : 'toast-bottom-right'
	};
});