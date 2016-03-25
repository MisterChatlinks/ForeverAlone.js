//helpers
var _fa_http = {
	"get" : function (url, success, fail) {
		return this.getWithMinTime(url, success, fail, 0);
	},
	"getWithMinTime" : function (url, success, fail, minTime) {
		console.log("get " + url);

		var start = new Date().getTime();

		var xHttp = new XMLHttpRequest();
		
		var that = this;

		xHttp.onreadystatechange = function() {
			if (xHttp.readyState == 4) {
				if (xHttp.status >= 200 && xHttp.status < 300) {
					that.wait(start, minTime, function() {
						console.log("called back");
						console.log(xHttp);
			    		success(xHttp.responseText, xHttp.status, xHttp.statusText);
			    	});
				} else {
					that.wait(start, minTime, function() {
			    		console.log("called back");
						console.log(xHttp);
			    		fail(xHttp.responseText, xHttp.status, xHttp.statusText);
			    	});
				}
		    }
		}
		xHttp.open("GET", url, true);
		xHttp.send();
	},
	"wait" : function (start, minTime, callback) {
		var delta = new Date().getTime() - start;
		if ((minTime * 1000) > delta) {
			setTimeout(function() {
				callback();
			}, (minTime * 1000) - delta);
		} else {
			callback();
		}
	}
};

//internals
var _fa_onHashChanged = function() {
	if(typeof forever_alone.hashChangedCallback != "function" || !forever_alone.hashChangedCallback()) {
		var hash = window.location.hash.substr(1);

		
		var destination = _fa_findDestinationForHash(hash);
		if (destination == null) {
			_fa_showErrorView();
		} else {
			var route = forever_alone.signPost[destination];

			var matches = hash.match(new RegExp(destination, "i"));
			for (var index = 1; index < matches.length; index++) {
				var match = matches[index];

				route = route.replace("{" + (index-1) + "}", match);
			}

			_fa_loadView(route);
		}
	}
};

var _fa_loadView = function(toLoad) {
	forever_alone.viewSection.innerHTML = forever_alone.loadView;

	_fa_http.getWithMinTime(toLoad, function(responseText) {
		forever_alone.viewSection.innerHTML = responseText;
	}, function(responseText, status) {
		_fa_showErrorView();
	}, 5);
};

var _fa_showErrorView = function() {
	forever_alone.viewSection.innerHTML = forever_alone.errorView;
};


var _fa_findDestinationForHash = function(hash) {
	for (var destination in forever_alone.signPost) {
		var route = forever_alone.signPost[destination];

		if(typeof route != "function" && new RegExp(destination, "i").test(hash)) {
			return destination;
		}
	}

	console.log("no routes for " + hash);
	return null;
};


var _fa_init = function() {
	if (window.location.hash == "") {
		var endsWithHash = (window.location.toString().substr(window.location.length - 1) == "#");
		window.location += (endsWithHash ? "" : "#") + "index";
	}

	window.onhashchange = _fa_onHashChanged;
	_fa_onHashChanged();
};

//interface
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

		_fa_init();
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