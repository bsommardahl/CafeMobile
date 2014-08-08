define(["dataContext", "dialog", "vm/correctProductName", "vm/changeProductPrice", "vm/changeProductTaxRate", "vm/reorderProduct", "vm/changeProductTag"], function(dc, dialog, correctProductName, changeProductPrice, changeProductTaxRate, reorderProduct, changeProductTag) {

	var viewModel = function(itemId) {

		var name = ko.observable();
		var imageSrc = ko.observable();
		var priority = ko.observable();
		var tag = ko.observable();
		var price = ko.observable();
		var taxRate = ko.observable();
		
		dc.GetItemById(itemId).done(function(item) {
			name(item.Name);
			imageSrc(item.ImageSrc);
			priority(item.Priority);
			tag(item.Tag);
			price(item.Price);
			taxRate(item.TaxRate);
		});

		return {
			Id : itemId,
			Name : name,
			ImageSrc : imageSrc,
			Priority : priority,
			Tag : tag,
			Price : price,
			TaxRate: taxRate,
			
			CorrectName : function() {
				dialog.Open("correctProductName", correctProductName.NewInstance(itemId, name), {
					modal : true,
					title : "Correcting Misspelled Product Name"
				});
			},
			ChangePrice : function() {
				dialog.Open("changeProductPrice", changeProductPrice.NewInstance(itemId, price), {
					modal : true,
					title : "Changing Product Price"
				});
			},
			ChangeTaxRate : function() {
				dialog.Open("changeProductTaxRate", changeProductTaxRate.NewInstance(itemId, taxRate), {
					modal : true,
					title : "Changing Product Tax Rate"
				});
			},
			ChangeTag : function() {
				dialog.Open("changeProductTag", changeProductTag.NewInstance(itemId, tag), {
					modal : true,
					title : "Changing Product Tag"
				});
			},
			ChangeImageSrc : function() {

			},
			ReOrderProduct : function() {
				dialog.Open("reorderProduct", reorderProduct.NewInstance(itemId, priority), {
					modal : true,
					title : "Re-Ordering Product"
				});
			},
			ArchiveProduct : function() {
				if (confirm("Estas seguro?")) {
					dc.Product.Delete(itemId).done(function() {
						require("router").GoToView.Products();
					});
				}
			},
			GoBack : function() {
				require("router").GoBack();
			}
		};
	};

	return {
		NewInstance : function(itemId) {
			return new viewModel(itemId);
		}
	};
});
