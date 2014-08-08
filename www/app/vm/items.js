define(["dataContext", "dialog", "vm/newItem"], function(dc, dialog, newItem) {

	var viewModel = function() {

		var tags = ko.observableArray();
		dc.GetTags().done(function(listOfTags) {
			$.each(listOfTags, function() {
				tags.push(this);
			});
		});
		var selectedTag = ko.observable();

		var items = ko.observableArray();

		var allItems;

		var filterByTag = function() {
			items.removeAll();
			$.each(allItems, function() {
				if (!selectedTag() || this.Tag == selectedTag().Name) {
					items.push({
						_id: this._id,
						Name: this.Name,
						Priority: this.Priority || 0,
						ImageSrc: this.ImageSrc,
						Tag: this.Tag,
						Price: this.Price,
						TaxRate: this.TaxRate
					});
				}
			});
		};

		var getItems = function() {
			dc.GetItems().done(function(listOfItems) {
				allItems = listOfItems;
				filterByTag();				
			});
		};
		getItems();

		return {
			Items : items,
			CreateNewProduct : function() {
				dialog.Open("createNewItem", newItem.NewInstance(), {
					title : "Creating New Product"
				}, getItems);
			},
			Tags : tags,
			SelectedTag : selectedTag,
			FilterByTag : filterByTag,		
			SelectItem: function(item){
				require("router").GoToView.ProductById(item._id);
				return false;
			}	
		};
	};

	return {
		NewInstance : function() {
			return new viewModel();
		}
	};
});
