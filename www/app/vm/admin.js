define(function() {

	return {
		GoToProducts : function() {
			require("router").GoToView.Products();
			return false;
		},
		GoToData : function() {
			require("router").GoToView.Data();
		},
		
		GoToHooks : function() {
			require("router").GoToView.Hooks();
		},
	};
});
