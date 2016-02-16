//helpers
var _fa_http = {
	"get" : function (url, success, fail) {
		var xHttp = new XMLHttpRequest();
		
		xHttp.onreadystatechange = function() {
			if (xHttp.readyState == 4 && xHttp.status >= 200 && xHttp.status < 300) {
				success(xHttp.responseText, xHttp.status, xHttp.statusText);
		    } else {
		    	fail(xHttp.responseText, xHttp.status, xHttp.statusText);
		    }
		}
		xHttp.open("GET", url, true);
		xHttp.send();
	}
};

//internals
var _fa_onHashChanged = function() {
	if(typeof forever_alone.hashChangedCallback != "function" || !forever_alone.hashChangedCallback()) {
		var hash = window.location.hash.substr(1);

		
		var destination = _fa_findDestinationForHash(hash);
		//TODO: handle case where no destination found

		var route = forever_alone.signPost[destination];

		var matches = hash.match(new RegExp(destination, "i"));
		for (var index = 1; index < matches.length; index++) {
			var match = matches[index];

			route = route.replace("{" + (index-1) + "}", match);
		}

		//TODO: show loading view before updating to new view
		_fa_http.get(route, function(responseText) {
			forever_alone.viewSection.innerHTML = responseText;
		}, function(responseText, status) {
			//TODO: error view
		});
	}
};

var _fa_init = function() {
	window.onhashchange = _fa_onHashChanged;
};

var _fa_findDestinationForHash = function(hash) {
	console.log(hash);

	for (var destination in forever_alone.signPost) {
		var route = forever_alone.signPost[destination];

		if(typeof route != "function" && new RegExp(destination, "i").test(hash)) {
			return destination;
		}
	}
};

_fa_init();

//interfaces
var forever_alone = {
	"viewSection" : null,
	"signPost" : null,
	"loadView" : null,
	"errorView" : null,
	"loadCallback" : null,
	"errorCallback" : null,
	"hashChangedCallback" : null,
	"init" : function(viewSection, signPost, loadViewUrl, errorViewUrl, hashChangedCallback) {
		forever_alone.viewSection = viewSection;

		forever_alone.signPost = signPost;

		_fa_http.get(loadViewUrl, function(responseText) {
			forever_alone.loadView = responseText;
		}, function(responseText, status) {
			//TODO: how to handle this?
		});

		_fa_http.get(errorViewUrl, function(responseText) {
			forever_alone.errorView = responseText;
		}, function(responseText, status) {
			//TODO: how to handle this?
		});

		forever_alone.hashChangedCallback = hashChangedCallback;
	},
	"onError" : function(errorCallback) {
		this.errorCallback = errorCallback;
	}, 
	"onLoad" : function(loadCallback) {
		this.loadCallback = loadCallback;
	},
	"SignPost": function() {
		var that = this;
		this.add = function(destination, route) {
			that[destination] = route;
		};
	} 
};