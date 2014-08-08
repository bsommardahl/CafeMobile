define(["dataContext"],function(dc) {

    var viewModel = function(itemId, priceObservable) {

        var price = ko.observable(priceObservable());

        var save = function () {
            dc.Product.SavePriceChange(itemId, price())
                .done(function () {
                    priceObservable(price());
                    if (callback) callback();
                });
        };

        var callback = null;

        return {
            Price: price,
            Save: save,
            OnSuccess: function (callbackFromOutside) {
                callback = callbackFromOutside;
            }
        };
    };
    
    return {
        NewInstance: function (itemId, priceObservable) {
            return new viewModel(itemId, priceObservable);
        }
    };
});