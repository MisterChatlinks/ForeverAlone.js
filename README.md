# ForeverAlone.js: "Your Solo Sidekick for SPAs"

**Tagline:**  
*For the lone coder navigating the web one hash at a time.*

## Core Philosophy

- **Independence:** A framework that’s self-sufficient, requiring minimal external libraries or tools.
- **Minimalism:** Lightweight design for developers who want to stay in control of every line of code.
- **Efficiency:** Built to get the job done quickly without over-complicating development.

The core philosophy of ForeverAlone.js is centered around the idea that coding can be a solitary experience and that sometimes, it's nice to have a companion to share the journey with. This library aims to provide a set of tools and utilities that make it easier for developers to build and maintain single-page applications (SPAs) with a focus on simplicity, flexibility, and maintainability.

## Key Features

- **Simple Routing**
  - Hash-based dynamic routing.
  - Lifecycle hooks to customize every step of navigation.

- **Lifecycle Control**
  - Fully extensible hooks for loading, rendering, error handling, and beyond.
  - Smooth transitions with built-in defaults for loading and error states.

- **Dynamic Events**
  - Use `data-event` for clean and modular event handling.
  - Simulate events like load seamlessly for custom needs.

- **Lightweight & Fast**
  - No dependencies. No fluff. Just pure JavaScript.

- **Beginner-Friendly**
  - Easy to understand and adapt for coders of all levels.

## Use Cases

- **Quick Prototyping**  
  Perfect for proof-of-concept applications or lightweight SPAs where setup time matters.

- **Personal Projects**  
  Built for the solo developer who wants a framework as independent as they are.

- **Learning SPA Design**  
  Offers an intuitive way to explore routing, lifecycle hooks, and event-driven design without the overhead of major frameworks.

## What are the concepts?

1. App shell -> see <https://developers.google.com/web/updates/2015/11/app-shell?hl=en>
2. Fragment -> a HTML view element that can switch out its content to show different views (other HTML elements) as required
3. hashRoute -> a map from hash locations to document locations. E.g. '#item' maps for 'item.html'

## How does it work?

### The basics

Import ForeverAlone.js into your app shell
Define a "fragment" element. This can be any HTML element that will switch out its contents when the hash location for a page changes.

Create a ForeverAlone instance using JavaScript;

```javascript
const myApp = new ForeverAlone({ appShellSelector:"#fragment-body", loadDuration: 1000 });
```

1. Invoke the .add() method to add routes. add() takes a hash location as its 1st argument and the location of a HTML document for its 2nd argument. I.e.

```javascript
myApp.add({key:"#error", path:"/nonexistent.html"});
```

will causes your fragment's content to change to 'domain.com/nonexistent.html' when 'domain.com/#error' is visited. Ensure you have a route for "#home" as ForeverAlone will redirect 'domain.com' or 'domain.com/#' to 'domain.com/#home'

Initialize ForeverAlone with.

```javascript
myApp.init();
```

### More advanced stuff

ForeverAlone support UrlParameter **BUT IN A PREDEFINED WAY**,
As '/:keyName type:number|string|boolean/'.

#### Example

```javascript
myApp.add({
    key: '#userAccount/:userId type:number/:isAdmin type:boolean',
    path: "/Account.html"
  })

myApp.add({
    key: '#userAccount/:userHistoryId type:number',
    path: "/Account.html"
  })

myApp.add({
    key: '#userAccount/:userHistoryId type:number/log',
    path: "/Account.html"
  })

myApp.add({
    key: '#userAccount',
    path: "/Account.html"
  })
```

##### Note on UrlParam

the previous code example work but beware when using it, if you use key of

- same hash origin
- same length when splited by '/'
- and same type

they'll overlap and cause unpredictable behavior

###### **What not to do when using UrlParam**

```javascript
myApp.add({key: '#user/userId type:number'});
myApp.add({key: '#user/logId type:number'});
```

this will cause an irregular behavior cause both route are triggered when going for example to :

- 'domain.com/#user/123'

ForeverAlone also allows you to show a particular HTML document while another page is loading. The contents of the loading document is loaded and saved (as a variable; i.e. on a full page load basis) when ForeverAlone is initialised to increase the likelihood that it is loaded when a fragment change occurs.

You can even show a particular HTML document for error scenarios. Again, the contents of the error document is loaded and saved (as a variable; i.e. on a full page load basis) when ForeverAlone is initialised to increase the likelihood that it is loaded when something does go wrong. Error scenarions are currently limited to the same error document for:

Failing to load a document for given hash location
When no route has been specified for a given hash location.

by Default they are under the hash :

- **#load-spa** , for loading page
- **#err-spa** , for error page

## Is there an example?

Yes, see below

index.html:

```html

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ForeverAlone CSR Website</title>
</head>
<body id="fragment-body"></body>
<script src="/ForeverAlone.js"></script>
<script src="/Fo_Plugin.js"></script>
<script type="text/javascript">
    // ForeverAlone.js basic setup
    const myApp = new ForeverAlone({ appShellSelector:'#fragment-body', loadDuration: 1000 });

    const routes = [
        { key: "#home", path: "index.html" },
        { key: "#home/:userId type:number", path: "index.html" },
        { key: "#load-spa", path: "/src/pages/loading.html" },
        { key: "#err-spa", path: "/src/pages/err.html" },
    ];

    myApp.addAll(routes);
    myApp.init(); 
</script>
</html>
```

item.html:

```html

<script type="text/javascript">
  function getNewId (){
    /* for those who dunno, we leverage on context execution of the this key word so that this refer to the html el doing the call */
    this.href = '#home/' + Math.random()
    this.click() 
  }
</script>

<a data-event='click:getNewId;'> Click me to get an id </a>

<script type="text/javascript">
  let id = Router.urlParams()['userId'];
  if(id){
    document.body.innerHTML += 'YOU ARE THE USER WITH THE ID '+  id
  }
</script>

```

loading.html:

```html
<h1>Loading...</h1>
```

error.html:

```html
<h1>Whoops.</h1>
<p>Something went wrong, <a href="#home">Would you like to go home?</a></p>
```
