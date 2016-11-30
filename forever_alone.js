//helpers
var _fa_http = {
	"get" : function (url, success, fail) {
		return this.getWithMinTime(url, success, fail, 0);
	},
	"getWithMinTime" : function (url, success, fail, minTime) {
		var start = new Date().getTime();
		var xHttp = new XMLHttpRequest();
		var _this = this;

		xHttp.onreadystatechange = function() {
			if (xHttp.readyState == 4) {
				if (xHttp.status >= 200 && xHttp.status < 300) {
					_this.wait(start, minTime, function() {
			    		success(xHttp.responseText, xHttp.status, xHttp.statusText);
			    	});
				} else {
					_this.wait(start, minTime, function() {
			    		fail(xHttp.responseText, xHttp.status, xHttp.statusText);
			    	});
				}
		    }
		};
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
		_fa_nodeScriptReplace(forever_alone.viewSection);

	}, function(responseText, status) {
		_fa_showErrorView();
	}, 1);
};

var _fa_nodeScriptReplace = function(node) {
	if (node.tagName === "SCRIPT") {
		node.parentNode.replaceChild(_fa_nodeScriptClone(node), node);
	} else {
		var index = 0;
		var children = node.childNodes;
		while (index < children.length) {
	  	_fa_nodeScriptReplace(children[index++]);
		}
	}

	return node;
};

var _fa_nodeScriptClone = function(node){
	var script  = document.createElement("script");
	script.text = node.innerHTML;
	for(var index = node.attributes.length-1; index >= 0; index--) {
	    script.setAttribute(node.attributes[index].name, node.attributes[index].value);
	}
	return script;
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
