define([], function() {

	var viewPath = "/views/";
	if (window.device) {
		viewPath = "views/";
	}
	return {
		debugMode : true,
		contentContainer : $("#content"),
		//ApiUrl : "http://localhost:3001",
		ApiUrl : "https://gringo-cafe-server.herokuapp.com",
		ViewPath : viewPath,
		QueuePollingInterval : 10,
		LocationId : "50cbae0243847a0000000001",
	};
});
