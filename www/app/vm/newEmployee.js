define(["dataContext"],function(dc) {

    var viewModel = function() {

        var name = ko.observable();

        var callback = null;
        
        return {
            Name: name,

            Save: function () {
                dc.Employees.CreateNew(name()).done(function () {
                    if (callback) callback();
                });
            },
            
            OnSuccess: function (cb) {
                callback = cb;
            }
        };
    };
    
    return {
        NewInstance: function () {
            return new viewModel();
        }
    };
});