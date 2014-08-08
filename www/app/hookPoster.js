define(["config"], function(config) {

	var post = function(url, data) {
		data.LocationId = config.LocationId;
		return send("POST", url, data);
	};

	var send = function(type, url, data) {

		var dataObj = ko.toJS(data || {});

		return $.ajax({
			url : url,
			dataType : "json",
			contentType : "application/json",
			type : type,
			data : JSON.stringify(dataObj)
		}).pipe(function(response, textStatus, jqXhr) {
			var deferred = new $.Deferred();
			if (response && (response.Status == "error" || response.statusText == "error" || textStatus=="error")) {
				toastr.error(response.ErrorType, response.Message);
				return deferred.reject(response);
			} else {
				return deferred.resolve(response, textStatus, jqXhr);
			}
		}).fail(function(err) {
			toastr.error(err.statusText + ": " + err.responseText, "Event hook to " + url + " failed! Please check receiving server and url.");
		});
	};

	return {
		Post : function(url, itemToPost) {
			return post(url, itemToPost).then(function(){
				toastr.info("Posted to " + url + ".", "Done");
			});
		}
	};
}); 