define(["dataContext"],function(dc) {

    var viewModel = function(itemId, tagObservable) {

        var tag = ko.observable(tagObservable());

        var save = function () {
            dc.Product.SaveTagChange(itemId, tag())
                .done(function () {
                    tagObservable(tag());
                    if (callback) callback();
                });
        };

        var callback = null;

        return {
            Tag: tag,
            Save: save,
            OnSuccess: function (callbackFromOutside) {
                callback = callbackFromOutside;
            }
        };
    };
    
    return {
        NewInstance: function (itemId, tagObservable) {
            return new viewModel(itemId, tagObservable);
        }
    };
});