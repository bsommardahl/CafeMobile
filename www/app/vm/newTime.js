define(["dataContext", "moment"], function(dc, moment) {

	var viewModel = function(employeeId, callbackOnCreated) {

		var date = ko.observable(new Date());
		var dateDisplay = ko.computed(function() {
			return date().toString("MM/dd/yyyy");
		});

		var employeeName = ko.observable();

		dc.Employees.GetById(employeeId).done(function(employee) {
			employeeName(employee.Name);
		});

		var callback = null;
		var displayDateField = ko.observable();

		var selectedArrivalHour = ko.observable("9");
		var selectedArrivalMinutes = ko.observable("00");
		var selectedArrivalAmPm = ko.observable("AM");

		var selectedDepartureHour = ko.observable("7");
		var selectedDepartureMinutes = ko.observable("30");
		var selectedDepartureAmPm = ko.observable("PM");

		var timeIn = ko.computed(function() {
			return selectedArrivalHour() + ":" + selectedArrivalMinutes() + " " + selectedArrivalAmPm();
		});
		var timeOut = ko.computed(function() {
			return selectedDepartureHour() + ":" + selectedDepartureMinutes() + " " + selectedDepartureAmPm();
		});
	
		var calculatedHours = ko.computed(function(){
			var arrivalHour = selectedArrivalHour();
			if(selectedArrivalAmPm()=="PM"){
				arrivalHour = parseInt(arrivalHour) + 12
			}
			var arrivalMoment = moment().hours(arrivalHour).minutes(selectedArrivalMinutes()).seconds(0);
			
			var departureHour = selectedDepartureHour();
			if(selectedDepartureAmPm()=="PM"){
				departureHour = parseInt(departureHour) + 12;
			}
			var departureMoment = moment().hours(departureHour).minutes(selectedDepartureMinutes()).seconds(0);
			
			var difference = departureMoment.diff(arrivalMoment, 'hours', true);
			return difference;
		});
		
		return {
			Hours : ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
			Minutes : ["00", "15", "30", "45"],
			AmPm : ["AM", "PM"],
			
			SelectedArrivalHour : selectedArrivalHour,
			SelectedArrivalMinutes : selectedArrivalMinutes,
			SelectedArrivalAmPm : selectedArrivalAmPm,

			SelectedDepartureHour : selectedDepartureHour,
			SelectedDepartureMinutes : selectedDepartureMinutes,
			SelectedDepartureAmPm : selectedDepartureAmPm,

			AddDay : function() {
				date(date().addDays(1));
			},
			SubtractDay : function() {
				date(date().addDays(-1));
			},

			EmployeeId : employeeId,
			EmployeeName : employeeName,
			Date : dateDisplay,

			Save : function() {
				var newTimeEntry = {
					EmployeeName : employeeName(),
					EmployeeId : employeeId,
					"Date" : moment(date())._d,
					TimeIn : timeIn(),
					TimeOut : timeOut(),
					CreatedDate :moment()._d
				};
				dc.Times.CreateNew(newTimeEntry).done(function() {
					if (callback)
						callback();
					if (callbackOnCreated)
						callbackOnCreated(newTimeEntry);
				});
			},

			OnSuccess : function(cb) {
				callback = cb;
			},
			
			CalculatedHours: calculatedHours
		};
	};

	return {
		NewInstance : function(employeeId, callbackOnCreated) {
			return new viewModel(employeeId, callbackOnCreated);
		}
	};
});
