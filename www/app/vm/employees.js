define(["dataContext", "dialog", "vm/newEmployee", "vm/timeEntry"], function(dc, dialog, newEmployee, timeEntry) {

	var viewModel = function() {

		var employees = ko.observableArray();

		var getEmployees = function() {
			employees.removeAll();
			dc.Employees.GetAll().done(function(listOfEmployees) {
				$.each(listOfEmployees, function() {
					employees.push(this);
				});
			});
		};
		getEmployees();

		// var todaysDate = function() {
			// var today = new Date();
			// var dd = today.getDate();
			// var mm = today.getMonth() + 1;
			// //January is 0!
			// var yyyy = today.getFullYear();
			// var todayString;
			// if (dd < 10) {
				// dd = '0' + dd;
			// }
			// if (mm < 10) {
				// mm = '0' + mm;
			// }
			// todayString = mm + '/' + dd + '/' + yyyy;
// 
			// return todayString;
		// };

		var startDate = ko.observable(moment().format("YYYY-MM-DD"));
		var endDate = ko.observable(moment().format("YYYY-MM-DD"));
		var totalHours = ko.observable(0);
		var times = ko.observableArray();

		var runReport = function() {
			times.removeAll();
			dc.Times.GetByDate(startDate(), endDate()).done(function(listOfTimes) {
				$.each(listOfTimes, function() {
					var vm = timeEntry.FromExisting(this);
					times.push(vm);
					totalHours(totalHours() + parseFloat(vm.Hours));
				});

			});
		};
		runReport();

		return {
			Employees : employees,
			CreateNewEmployee : function() {
				dialog.Open("newEmployee", newEmployee.NewInstance(), {
					title : "Crear Nuevo Empleado"
				}, getEmployees);
			},
			StartDate : startDate,
			EndDate : endDate,
			RunReport : runReport,
			TotalHours : totalHours,
			Times : times,
			SelectEmployee : function(employee) {
				require("router").GoToView.EmployeeById(employee._id);
				return false;
			},
		};
	};

	return {
		NewInstance : function() {
			return new viewModel();
		}
	};
});
