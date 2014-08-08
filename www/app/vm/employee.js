define(["dataContext", "dialog", "vm/newTime", "vm/timeEntry", "router"], function(dc, dialog, newTime, timeEntry, router) {

	var viewModel = function(employeeId) {

		
		var employeeName = ko.observable();
		var times = ko.observableArray();
		var canDeleteTimeEntry = ko.observable(false);

		var totalHours = ko.computed(function() {
			var hours = 0;
			$.each(times(), function() {
				hours = hours + this.Hours;
			});
			return hours;
		});

		dc.Employees.GetById(employeeId).done(function(employee) {
			employeeName(employee.Name);
		});

		dc.Times.GetByEmployeeId(employeeId).done(function(listOfTimes) {
			if (listOfTimes) {
				$.each(listOfTimes, function() {
					times.push(timeEntry.FromExisting(this));
				});
			}
		});

		var addNewTimeEntry = function(newTimeEntry) {	
			times.push(timeEntry.FromExisting(newTimeEntry));
		};

		return {
			Name : employeeName,
			Times : times,
			TotalHours : totalHours,
			CanDeleteTimeEntries: canDeleteTimeEntry,
			EnterNewTime : function() {
				dialog.Open("newTime", newTime.NewInstance(employeeId, addNewTimeEntry), {
					title : "Entering New Time"
				});
			},
			EnterDeleteMode: function(){
				canDeleteTimeEntry(true);
			},
			DeleteTimeEntry : function(timeEntry) {
				if (confirm("Estas seguro?")) {
					dc.Times.Delete(timeEntry._id).done(function() {
						times.remove(timeEntry);
					});
				}
			},

			Delete : function() {
				if (confirm("Estas seguro?")) {
					dc.Employees.Delete(employeeId).done(function() {
						require("router").GoToView.Employees();
					});
				}
			},
			GoBack: function(){
				require("router").GoBack();
			}
		};
	};

	return {
		NewInstance : function(employeeId) {
			return new viewModel(employeeId);
		}
	};
});
