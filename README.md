# What is it?

A lightweight (~4KB) JavaScript library to support single page web apps

# What are the concepts?

1. App shell -> see https://developers.google.com/web/updates/2015/11/app-shell?hl=en
2. Fragment -> a HTML view element that can switch out its content to show different views (other HTML elements) as required
3. Sign post -> a map from hash locations to document locations. E.g. '#item' maps for 'item.html'

# How does it work?

## The basics:
1. Import forever_alone.js into your app shell
2. Define a "fragment" element. This can be any HTML element that will switch out its contents when the hash location for a page changes.
3. Create a ForeverAlone.getInstance() using JavaScript; 'let signPost = ForeverAlone.getInstance();'
~1. Invoke the .add() method to add routes. add() takes a hash location as its 1st argument and the location of a HTML document for its 2nd argument. I.e. 'signPost.add("error", "nonexistant.html");' will create a sign post that causes your fragment's content to change to 'domain.com/nonexistant.html' when 'domain.com/#error' is visited.
4. Ensure you have a route for "#index" as ForeverAlone will redirect 'domain.com' or 'domain.com/#' to 'domain.com/#index'
5. Initialise forever_alone with your fragment's view element and your sign post. I.e. 'forever_alone.init(fragment, loadview, errorView);'

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
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script></script>
</head>
<body>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My First Webpage</title>
		<script src="forever_alone_v2.js" type="text/javascript"></script>
		<script type="text/javascript">
			function init() {
				var view = document.getElementById("fa-fragment");

				let forever_Alone = ForeverAlone.getInstance();
				let _ = forever_Alone;
					_.add("index", "index.html")
					_.add("item/([0-9]+)", "item.html?id={0}")
					_.add("error", "nonexistant.html")

				forever_Alone.init(view,"load.html", "error.html")
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
