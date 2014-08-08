define(["dataContext"],function(dc) {

    var viewModel = function() {

        var name = ko.observable();
        var price = ko.observable();
        var taxRate = ko.observable();
        var imageSrc = ko.observable();
        var priority = ko.observable();

        var availableTags = ko.observableArray();
        var selectedTag = ko.observable();

        dc.GetTags().done(function (listOfTags) {
            $.each(listOfTags, function () {
                availableTags.push(this);
            });
        });
        
        var callback = null;
        
        return {
            Name: name,
            Price: price,
            TaxRate: taxRate,
            SelectedTag: selectedTag,
            ImageSrc: imageSrc,
            Priority: priority,
            
            AvailableTags: availableTags,
            
            Save: function() {
                dc.Product.Create({
                    Name: name(),
                    Price: price(),
                    TaxRate: taxRate(),
                    Tag: selectedTag().Name,
                    ImageSrc: imageSrc(),
                    Priority: priority()
                }).done(function() {
                    if (callback) callback();
                });
            },
            OnSuccess: function (incomingCallback) {
                callback = incomingCallback;
            }
        };
    };
    
    return {
        NewInstance: function () {
            return new viewModel();
        }
    };
});