define(["dataContext"],function(dc) {

    var viewModel = function(itemId, priorityObservable) {

        var priority = ko.observable(priorityObservable());

        var save = function() {
            dc.Product.SavePriorityChange(itemId, priority())
                .done(function() {
                    priorityObservable(priority());
                    if (callback) callback();
                });
        };

        var callback = null;

        return {
            Priority: priority,
            Save: save,
            OnSuccess: function (callbackFromOutside) {
                callback = callbackFromOutside;
            }
        };
    };
    
    return {
        NewInstance: function (itemId, priorityObservable) {
            return new viewModel(itemId, priorityObservable);
        }
    };
});