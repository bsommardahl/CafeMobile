define(["dataContext", "dialog", "cafeEvents"], function(dc, dialog, cafeEvents) {

	var viewModel = function(debitId) {

		var amount = ko.observable();
		var createdDate = ko.observable();
		var description = ko.observable();
		var vendorName = ko.observable();
		var taxPaid = ko.observable();
		var operationalExpense = ko.observable();
		var modifying = ko.observable(false);

		var getDebit = function() {
			dc.Debits.GetById(debitId).done(function(debit) {				
				createdDate(moment(debit.CreatedDate).format("MM/DD/YYYY hh:mm A"));
				amount(debit.Amount);
				description(debit.Description);
				vendorName(debit.VendorName);	
				taxPaid(debit.TaxPaid);	
				operationalExpense(debit.OperationalExpense);		
			});
		};
		getDebit();

		var deleteDebit = function() {
			if (confirm("Estas seguro?")) {
				dc.Debits.Delete(debitId).done(function() {
					if (callback)
						callback();
				});
			}
		};

		var callback;
		
		return {
			Id : debitId,
			CreatedDate: createdDate,
			Amount: amount,
			Description: description, 
			VendorName: vendorName,
			DeleteDebit : deleteDebit,
			TaxPaid: taxPaid,
			OperationalExpense: operationalExpense,
			modifying: modifying,
			Modify: function(){
				modifying(true);
			},
			OnSuccess : function(callbackFromOutside) {
				callback = callbackFromOutside;
			},
			SaveChanges : function() {
				dc.Debits.Update(debitId, {
					CreatedDate: createdDate(),
					Description: description(),
					Amount: amount(),
					TaxPaid: taxPaid()
				}).done(function() {					
					if (callback)
						callback();
				});
			},			
		};
	};

	return {
		NewInstance : function(debitId) {
			return new viewModel(debitId);
		}
	};
});
