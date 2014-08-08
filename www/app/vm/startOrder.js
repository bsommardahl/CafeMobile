define(function() {

    var customerName = ko.observable();

    return {
        CustomerName: customerName,

        StartOrder: function () {
            if (!customerName()) {
            	customerName("Cliente");
            }
            require("router").GoToView.NewOrder(customerName());
            customerName("");
        }
    };
});