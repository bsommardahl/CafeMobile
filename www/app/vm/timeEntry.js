define(function() {

	var viewModel = function(timeEntry) {

		var d = moment(timeEntry.Date);

		var timeIn = moment(d.format("MM/DD/YYYY") + " " + timeEntry.TimeIn);
		var timeOut = moment(d.format("MM/DD/YYYY") + " " + timeEntry.TimeOut);

		var getHours = function(date1, date2) {
			return timeOut.diff(timeIn, 'hours');
		}
		//round to first decimal place
		var hours = Math.round(getHours(timeIn, timeOut) * 10) / 10;

		return {
			_id : timeEntry._id,
			Name : timeEntry.EmployeeName || "Employee",
			"Date" : timeIn.format("MM/DD/YYYY"),
			TimeIn : timeIn.format("hh:mm A"),
			TimeOut : timeOut.format("hh:mm A"),
			Hours : hours,
		};
	};

	return {
		FromExisting : function(timeEntry) {
			return new viewModel(timeEntry);
		}
	};
});
