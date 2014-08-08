define(["config"], function(config) {

	return {
		OpenContent: function(html, dialogOptions){
			var modal = $("<div>");

			//build dom strcture in modal div
			$(modal).addClass("modal hide fade");
			var closeButton = $("<button>").addClass("close").attr("data-dismiss", "modal").attr("aria-hidden", "true").html("&times;");
			var headerTitle = $("<h3>").html(dialogOptions.title);
			var header = $("<div>").addClass("modal-header").append(closeButton).append(headerTitle);
			modal.append(header);

			var content = $("<div>");
			var contentContainer = $("<div>").addClass("modal-body").append(content);
			modal.append(contentContainer);	
			
			content.html(html);

			$("body").append(modal);

			// wire up the buttons to dismiss the modal when shown
			$(modal).bind("show", function() {
				$("div a.btn").click(function(e) {
					// do something based on which button was clicked
					// we just log the contents of the link element for demo purposes
					console.log("button pressed: " + $(this).html());
					// hide the dialog box
					$(modal).modal('hide');
				});
			});

			// remove the event listeners when the dialog is hidden
			$(modal).bind("hide", function() {
				// remove event listeners on the buttons
				$("div a.btn").unbind();
			});

			$(modal).on('hidden', function () {
				modal.remove();
			});
			
			// finally, wire up the actual modal functionality and show the dialog
			$(modal).modal({
				"backdrop": "static",
				"keyboard": true,
				"show": true // this parameter ensures the modal is shown immediately
			});

			$("#loading").hide();	
		},
		Open: function(viewName, viewModel, dialogOptions, callback) {
			var viewFile = config.ViewPath + viewName + ".html";

			var modal = $("<div>");

			if (viewModel.OnSuccess) {
				viewModel.OnSuccess(function() {
					modal.modal("hide");
					if(callback) callback();
				});
			}

			//build dom strcture in modal div
			$(modal).addClass("modal hide fade");
			var closeButton = $("<button>").addClass("close").attr("data-dismiss", "modal").attr("aria-hidden", "true").html("&times;");
			var headerTitle = $("<h3>").html(dialogOptions.title);
			var header = $("<div>").addClass("modal-header").append(closeButton).append(headerTitle);
			modal.append(header);

			var content = $("<div>");
			var contentContainer = $("<div>").addClass("modal-body").append(content);
			modal.append(contentContainer);	
			
			//load partial into content div
			content.load(viewFile, function() {
				//$("#loading").hide(); //hack because the loading indicator was stuck on when opening/loading dialogs                
				ko.applyBindings(viewModel, content[0]);
				$(contentContainer).find("input").first().focus();
			});

			$("body").append(modal);

			// wire up the buttons to dismiss the modal when shown
			$(modal).bind("show", function() {
				$("div a.btn").click(function(e) {
					// do something based on which button was clicked
					// we just log the contents of the link element for demo purposes
					console.log("button pressed: " + $(this).html());
					// hide the dialog box
					$(modal).modal('hide');
				});
			});

			// remove the event listeners when the dialog is hidden
			$(modal).bind("hide", function() {
				// remove event listeners on the buttons
				$("div a.btn").unbind();
			});

			$(modal).on('hidden', function () {
				modal.remove();
			});
			
			// finally, wire up the actual modal functionality and show the dialog
			$(modal).modal({
				"backdrop": "static",
				"keyboard": true,
				"show": true // this parameter ensures the modal is shown immediately
			});

			$("#loading").hide();			
		}
	};
});
