define(["dataContext"], function(dc) {

	var viewModel = function() {

		var vendors = ko.observableArray();
		var selectedVendor = ko.observable();
		var amount = ko.observable();
		var taxPaid = ko.observable();
		var description = ko.observable();

		dc.Vendors.GetAll().done(function(listOfVendors) {
			$.each(listOfVendors, function() {
				vendors.push(this);
			});
		});

		var save = function() {
			dc.Debits.Create({
				VendorId : selectedVendor()._id,
				VendorName : selectedVendor().Name,
				Amount : amount(),
				TaxPaid : taxPaid(),
				Description : description(),
				CreatedDate : moment()._d
			}).done(function() {
				if (callback)
					callback();
			});
		};

		var callback = null;

		return {
			Vendors : vendors,
			SelectedVendor : selectedVendor,
			Amount : amount,
			TaxPaid : taxPaid,
			Description : description,
			Save : save,
			OnSuccess : function(cb) {
				callback = cb;
			}
		};
	};

	return {
		NewInstance : function() {
			return new viewModel();
		}
	};
});
