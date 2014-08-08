define(["dataContext", "dialog", "vm/orderSummary"], function(dc, dialog, orderSummary) {

	var viewModel = function() {
		var summaryOrder = function(order) {

			var parsedPaidDate = moment(order.Paid);

			return {
				CustomerName : order.CustomerName,
				PaidDate : parsedPaidDate.format("MM/DD/YYYY"),
				PaidTime : parsedPaidDate.format("hh:mm A"),
				AmountPaid : order.AmountPaid,
				TaxPaid: order.TaxPaid,

				SelectOrder : function() {
					dialog.Open("orderSummary", orderSummary.NewInstance(order._id), {
						title : "Order Summary"
					});
				}
			};
		};

		var start = ko.observable(moment().format("YYYY-MM-DD"));
		
		var end = ko.observable(moment().format("YYYY-MM-DD"));
		var orders = ko.observableArray();

		var totalPaid = ko.observable(0);
		var totalTaxPaid = ko.observable(0);

		var runReport = function() {
			orders.removeAll();
			totalPaid(0);
			totalTaxPaid(0);

			dc.GetPaidOrders(start(), end()).done(function(summaryOrders) {
				
				$.each(summaryOrders, function() {
					
					var item = new summaryOrder(this);
					orders.push(item);
					var fltAmountPaid = parseFloat(item.AmountPaid);
					if (!isNaN(fltAmountPaid)) {
						totalPaid(totalPaid() + fltAmountPaid);
					}
					var fltAmountTaxPaid = parseFloat(item.TaxPaid);
					if(!isNaN(fltAmountTaxPaid)){
						totalTaxPaid(totalTaxPaid() + fltAmountTaxPaid);
					}

				});
			});
		};
		runReport();

		return {
			Orders : orders,
			TotalPaid : totalPaid,
			TotalTaxPaid : totalTaxPaid,
			Start : start,
			End : end,
			RunReport : runReport
		};
	};

	return {
		NewInstance : function() {
			return new viewModel();
		}
	};
});
