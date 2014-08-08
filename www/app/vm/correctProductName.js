define(["dataContext"], function(dc) {

    var viewModel = function(itemId, nameObservable) {

        var name = ko.observable(nameObservable());
        
        var saveNameChange = function () {
            dc.Product.SaveNameChange(itemId, name())
                .done(function () {
                    nameObservable(name());
                    if (callback) callback();
                });            
        };
        
        var callback = null;
        
        return {
            Name: name,
            Save: saveNameChange,
            OnSuccess: function (callbackFromOutside) {
                callback = callbackFromOutside;
            }
        };
    };
    
    return {
        NewInstance: function (itemId, nameObservable) {
            return new viewModel(itemId, nameObservable);
        }
    };
});