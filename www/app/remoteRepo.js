define(["config"], function(config) {

	var onAjaxError = function() {
	};

	var get = function(url, data) {
		//data.LocationId = config.LocationId;
		return send("GET", url, data);
	};
	var del = function(url, data) {
		//data.LocationId = config.LocationId;
		return send("DELETE", url, data);
	};
	var put = function(url, data) {
		data.LocationId = config.LocationId;
		return send("PUT", url, data);
	};
	var post = function(url, data) {
		data.LocationId = config.LocationId;
		return send("POST", url, data);
	};

	var getChanges = function(currentVersion) {		
		return get("/commands", {
			Since : currentVersion
		});
	};

	var send = function(type, url, data) {

		var dataObj = ko.toJS(data || {});

		return $.ajax({
			url : config.ApiUrl + url,
			dataType : "json",
            contentType: "application/json",
			type : type,
			data : JSON.stringify(dataObj),
		}).pipe(function(response, textStatus, jqXhr) {
			var deferred = new $.Deferred();
			if (response && response.Status == "error") {
				toastr.error(response.Message, response.ErrorType);
				return deferred.reject(response);
			} else {
				return deferred.resolve(response, textStatus, jqXhr);
			}
		}).fail(function(err) {
			onAjaxError(err);
		});
	};

	return {
		Post : function(resource, itemToPost) {
			return post(resource, itemToPost);
		},
		Put : function(resource, id, itemToPut) {
			return put(resource + "/" + id, itemToPut);
		},
		Delete : function(resource, id) {
			var res = resource;
			if (id)
				res = res + "/" + id;
			return del(res);
		},
		Get : function(resource) {
			return get(resource);
		},
		SetOnAjaxError : function(callback) {
			onAjaxError = callback;
		},
		GetChanges : getChanges
	};
});
