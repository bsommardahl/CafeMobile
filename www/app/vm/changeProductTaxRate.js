define(["dataContext"],function(dc) {

    var viewModel = function(itemId, input) {

        var taxRate = ko.observable(input());

        var save = function () {
            dc.Product.SaveTaxRateChange(itemId, taxRate())
                .done(function () {
                    input(taxRate());
                    if (callback) callback();
                });
        };

        var callback = null;

        return {
            TaxRate: taxRate,
            Save: save,
            OnSuccess: function (callbackFromOutside) {
                callback = callbackFromOutside;
            }
        };
    };
    
    return {
        NewInstance: function (itemId, input) {
            return new viewModel(itemId, input);
        }
    };
});