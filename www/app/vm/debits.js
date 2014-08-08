define(["dataContext", "dialog", "vm/createNewDebit", "vm/debitSummary"], function(dc, dialog, createNewDebit, debitSummary) {

	var viewModel = function() {

		var debitListingViewModel = function(debit) {
			var parsedDebitDate = moment(debit.CreatedDate);

			return {
				_id : debit._id,
				VendorName : debit.VendorName,
				Description : debit.Description,
				DebitDate : parsedDebitDate.format("MM/DD/YYYY"),
				DebitTime : parsedDebitDate.format("hh:mm A"),
				Amount : debit.Amount,
				TaxPaid: debit.TaxPaid
			};
		};

		var startDate = ko.observable(moment().format("YYYY-MM-DD"));
		var endDate = ko.observable(moment().format("YYYY-MM-DD"));
		var debits = ko.observableArray();

		var total = ko.computed(function() {
			var t = 0;
			$.each(debits(), function() {
				var fltAmount = parseFloat(this.Amount);
				if (!isNaN(fltAmount)) {
					t = t + fltAmount;
				}
			});
			return t;
		});
		
		var totalTax = ko.computed(function() {
			var t = 0;
			$.each(debits(), function() {
				var fltAmount = parseFloat(this.TaxPaid);
				if (!isNaN(fltAmount)) {
					t = t + fltAmount;
				}
			});
			return t;
		});

		var runReport = function() {
			debits.removeAll();
			dc.Debits.GetAllForDate(startDate(), endDate()).done(function(listOfDebits) {
				$.each(listOfDebits, function() {
					debits.push(new debitListingViewModel(this));
				});
			});
		};
		runReport();

		var createDebit = function() {
			dialog.Open("createNewDebit", createNewDebit.NewInstance(), {
				title : "Creating New Debit"
			}, runReport);
		};

		var selectDebit = function(debit){			
			dialog.Open("debitSummary", debitSummary.NewInstance(debit._id), {
				title : "Debit Summary"
			});
		};

		return {
			StartDate : startDate,
			EndDate : endDate,
			RunReport : runReport,
			CreateNewDebit : createDebit,
			Debits : debits,
			Total : total,
			TotalTax: totalTax,
			SelectDebit: selectDebit			
		};
	};

	return {
		NewInstance : function() {
			return new viewModel();
		}
	};
});
