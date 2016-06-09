# What is it?

A lightweight (~4KB) JavaScript library to support single page web apps

# What are the concepts?

1. App shell
2. Fragment
3. Sign posts

# How does it work?

## The basics:
1. Import forever_alone.js into your app shell
2. Define a "fragment" element. This can be any HTML element that will switch out its contents when the hash location for a page changes.
3. Create a forever_alone.SignPost object using JavaScript; 'var signPost = new forever_alone.SignPost();'
~1. Invoke the .add() method to add routes. add() takes a hash location as its 1st argument and the location of a HTML document for its 2nd argument. I.e. 'signPost.add("error", "nonexistant.html");' will create a sign post that causes your fragment's content to change to 'domain.com/nonexistant.html' when 'domain.com/#error' is visited.
4. Initialise forever_alone with your fragment's view element and your sign post. I.e. 'forever_alone.init(fragment, signPost);'

## More advanced stuff:

Sign posts support regexes. Use a regex within the hash location to match many routes to one or more HTML documents. You can even capture groups from the hash location and reference them by index in your HTML documents. Needs examples?

1. 'signPost.add(".*)", "index.html");' will match 'domain.com/#a', 'domain.com/#b', etc to 'index.html' acting as a "catch all"
2. 'signPost.add("item/([0-9]+)", "item.html?id={0}");' will match 'domain.com/#item/0',  'domain.com/#item/1', etc to 'domain.com/item.html?id=0', 'domain.com/item.html?id=1', etc
3. 'signPost.add("item/([0-9]+)/subitem/([0-9]+)", "item.html?id={0}&subid={1}");' will match 'domain.com/#item/0/subitem/0',  'domain.com/#item/0/subitem/1', etc to 'domain.com/item.html?id=0&subid=0', 'domain.com/item.html?id=0&subid=1', etc

ForeverAlone also allows you to show a particular HTML document while another page is loading. The contents of the loading document is loaded and saved (as a variable; i.e. on a full page load basis) when ForeverAlone is initialised to increase the likelihood that it is loaded when a fragment change occurs.

You can even show a particular HTML document for error scenarios. Again, the contents of the error document is loaded and saved (as a variable; i.e. on a full page load basis) when ForeverAlone is initialised to increase the likelihood that it is loaded when something does go wrong. Error scenarions are currently limited to the same error document for:
1. Failing to load a document for given hash location
2. When no route has been specified for a given hash location.

# Is there an example?

Yes, see below

index.html:
```html
<!DOCTYPE>
<html>
	<head>
		<script src="forever_alone.js" type="text/javascript"></script>
		<script type="text/javascript">
			function init() {
				var signPost = new forever_alone.SignPost();
				signPost.add("index", "index.html");
				signPost.add("item/([0-9]+)", "item.html?id={0}");
				signPost.add("error", "nonexistant.html");

				var fragment = document.getElementById("fa-fragment");
				forever_alone.init(fragment, signPost, "load.html", "error.html");
			}
		</script>
	</head>
	<body onload="init()">
		<div id="fa-fragment">
			<a href="#item/1">Item 1</a>
			<a href="#item/42">Item 42</a>
			<a href="#error">Example error</a>
		</div>
	</body>
</html>
```

item.html:
```html
<script type="text/javascript">
	var itemId = window.location.search.replace("?id=", "");
	document.write("Item id is " + itemId);
</script>
```

loading.html:
```html
<h1>Loading...</h1>
```

error.html:
```html
<h1>Whoops.</h1>
<p>Something went wrong, <a href="#">Would you like to go home?</a></p>
```
