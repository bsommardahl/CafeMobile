define(["dataContext", "router"], function(dc, router) {

    var tagViewModel = function(tag, tagSelected) {

        return {
            Name: tag.Name,
            ImageSrc: tag.ImageSrc,
            Select: function() {
                tagSelected(tag);
            }
        };
    };

    var itemViewModel = function(item, itemSelected) {

        return {
            Name: item.Name,
            ImageSrc: item.ImageSrc,
            Select: function () {
                itemSelected(item);
            }
        };
    };
    
    var listViewModel = function(itemSelected) {

        var items = ko.observableArray();
        var isViewingTags = ko.observable();
        
        var loadItemsByTag = function (tag) {
            isViewingTags(false);
            items.removeAll();
            //now, display items in the tag
            dc.GetItemsByTag(tag.Name)
                .done(function(listOfItems) {
                    $.each(listOfItems, function() {
                        items.push(new itemViewModel(this, itemSelected));
                    });
                });
        };

        var loadTags = function () {
            isViewingTags(true);
            items.removeAll();
            dc.GetTags().done(function(listOfTags) {
                $.each(listOfTags, function() {
                    items.push(new tagViewModel(this, loadItemsByTag));
                });
            });
        };
        loadTags();
        
        return {
            Items: items,
            LoadTags: loadTags,
            IsViewingTags: isViewingTags
        };
    };

    return {
        NewInstance: function(itemSelected) {
            return new listViewModel(itemSelected);
        },        
    };
});