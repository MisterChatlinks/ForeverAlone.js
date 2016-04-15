# ForeverAlone
A JS library to support single page web apps

# Example

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

				var viewSection = document.getElementById("fa-fragment");
				forever_alone.init(viewSection, signPost, "load.html", "error.html");
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