define(["config", "vm/startOrder", "vm/orders", "vm/order", "vm/tags", "vm/sales", "vm/debits", "vm/items", "vm/employees", "vm/employee", "vm/item", "vm/queue", "vm/admin", "vm/hooks", "vm/tags"], 
function(config, startOrder, orders, order, tags, sales, debits, items, employees, employee, item, queue, admin, hooks, tags) {
	var history = function(viewName, viewModel, showTitleBar) {
		return {
			ViewName : viewName,
			ViewModel : viewModel,
			ShowTitleBar : showTitleBar,
		};
	};

	var last = [];

	var displayView = function(viewName, viewModel, showTitleBar, container) {
		var viewPath = config.ViewPath + viewName + ".html";
		var contentContainer = container || config.contentContainer;
		var div = $("<div>");
		$(contentContainer).empty().append(div);
		$(div).load(viewPath, function() {
			last.push(new history(viewName, viewModel, showTitleBar));

			if (viewModel) {
				ko.applyBindings(viewModel, $(div)[0]);
			};

		});
	};

	return {
		GoToView : {
			Caja : function() {
				var vm = {
					StartOrderView : startOrder,
					OrdersView : orders.NewInstance()
				};

				displayView("caja", vm, false);
			},
			Admin: function(){
				displayView("admin", admin, false);
			},
			Data : function() {
				displayView("queue", queue.NewInstance(), false);
			},
			Sales : function() {
				displayView("sales", sales.NewInstance(), false);
			},
			Debits : function() {
				displayView("debits", debits.NewInstance(), false);
			},
			Hooks : function() {
				displayView("hooks", hooks.NewInstance(), false);
			},
			Products : function() {
				displayView("items", items.NewInstance(), false);
			},
			ProductById : function(productId) {
				var vm = item.NewInstance(productId);
				displayView("item", vm);
			},
			Tags : function() {
				displayView("tags", tags.NewInstance(), false);
			},
			Employees : function() {
				displayView("employees", employees.NewInstance(), false);
			},
			EmployeeById : function(employeeId) {
				displayView("employee", employee.NewInstance(employeeId), false);
			},
			NewOrder : function(customerName) {
				var newOrder = order.NewOrder(customerName);

				var itemSelected = function(item) {
					newOrder.AddItem(item);
				};

				var vm = {
					Order : newOrder,
					Products : tags.NewInstance(itemSelected)
				};

				displayView("order", vm, false);
			},			
			// TagByName : function(tagName) {
			// history.pushState({}, "", "/tag/" + tagName);
			// },
			OrderById : function(orderId) {
				var existingOrder = order.ExistingOrder(orderId);

				var itemSelected = function(item) {
					existingOrder.AddItem(item);
				};

				var vm = {
					Order : existingOrder,
					Products : tags.NewInstance(itemSelected)
				};

				displayView("order", vm, false);
			},
		},
		GoBack : function() {
			var lastPageIndex = last.length - 2;
			var lastPage = last[lastPageIndex];
			displayView(lastPage.ViewName, lastPage.ViewModel, lastPage.ShowTitleBar);
			last.pop();
		},
	};
});
