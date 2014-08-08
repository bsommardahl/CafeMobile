define(["dataContext", "router"], function (dc, router) {

    var itemByTag = function (tagName) {        
        var items = ko.observableArray();

        dc.GetItemsByTag(tagName)
            .done(function(listOfItems) {
                $.each(listOfItems, function() {
                    items.push(this);
                });
            });

        return {
            Items: items,
            TagName: tagName,
            GoBack: function () {
                router.GoBack();
            },
            ClickItem: function (item) {
                console.log(item);
            }
        };
    };

    return {
        CreateNewInstance: function (tagName) {
            return new itemByTag(tagName, dc);
        }
    };
});