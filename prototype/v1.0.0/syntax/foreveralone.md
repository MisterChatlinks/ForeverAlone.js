# foreveralone.syntax

## Component Syntax

```javascript
foreveralone.parseComponent(HTMLTemplate);
```

## State Management

- foreveralone.setState("key", "value") sets a state variable with the given key and value
- foreveralone.getState("key") returns the value of the state variable with the given key
- foreveralone.deleteState("key") deletes the state variable with the given key

```javascript
if (foreveralone.setState("userId", 12)) {
  console.log(
    "User ID set successfully, ID =",
    foreveralone.getState("userId")
  );
  // output User ID set successfully, ID = 12
}
```

## Event Handling

- foreveralone.on("event", callback) registers a callback function to be called when the specified event occurs

- foreveralone.off("event", callback) unregisters a callback function previously registered with the specified event

- foreveralone.trigger("event") triggers the specified event, calling all registered callback functions

```javascript
foreveralone.on("click", function () {
  console.log("Button clicked");
});
foreveralone.trigger("click");
```

## DOM Manipulation

foreveralone being relying on html attr to process everything, even though they not appear on DOM,
foreveralone offer to manipulate DOM elements using the following methods, or Jquery:

- foreveralone.append(element, child) appends the child element to the end of the parent element, (don't worrt, id don't rely on innerHTML)
- foreveralone.prepend(element, child) prepends the child element to the beginning of the parent element
- foreveralone.remove(element) removes the specified element from the DOM
- foreveralone.html(element, html) sets the inner HTML of the specified element (don't worrt, id don't rely on innerHTML)
- foreveralone.text(element, text) sets the text content of the specified element
- foreveralone.clean(element) clean the content of an html tag
- foreveralone.attr(element, key, value) sets the value of the specified attribute on the specified
  element
- foreveralone.css(element, key, value) sets the value of the specified CSS property on the
  specified element
- foreveralone.addClass(element, className) adds the specified class to the specified element
- foreveralone.removeClass(element, className) removes the specified class from the specified element
- foreveralone.toggleClass(element, className) toggles the specified class on the specified element
- foreveralone.hasClass(element, className) checks if the specified element has the specified class
- foreveralone.find(element, selector) finds the first element within the specified element that matches the specified
  selector
- foreveralone.children(element) returns a collection of child elements of the specified element
- foreveralone.parent(element) returns the parent element of the specified element
- foreveralone.next(element) returns the next sibling element of the specified element
- foreveralone.prev(element) returns the previous sibling element of the specified element
- foreveralone.nextAll(element) returns a collection of all next sibling elements of the specified element
- foreveralone.prevAll(element) returns a collection of all previous sibling elements of the specified element
- foreveralone.nextUntil(element, selector) returns a collection of all next sibling elements of the specified
  element until the specified selector is matched
- foreveralone.prevUntil(element, selector) returns a collection of all previous sibling elements of the specified
  element until the specified selector is matched
- foreveralone.clone(element) clones the specified element
- foreveralone.wrap(element, wrapper) wraps the specified element with the specified wrapper element
- foreveralone.unwrap(element) unwraps the specified element

- foreveralone.customEvent(selector, eventName, data = null) emit a custom to a specified element in the DOM

## Component Management

foreveralone.parseComponent(HTMLTemplate) parses the given HTML template and returns a component object

## Routing Management

- foreveralone.addAll(routes) adds the given routes to the router

- foreveralone.add(route) adds a single route to the router

- foreveralone.remove(route) removes a single route from the router

```javascript
foreveralone.addAll([
  { path: "/", component: "home" },
  { path: "/u/:id type:number", component: "about" },
  { path: "/about", component: "about" },
  { path: "/contact", component: "contact" },
]);
```

## Routing API

- foreveralone.getRoute(path) returns the route object for the given path
- foreveralone.getRouteParams(path) returns the route parameters for the given path
- foreveralone.getRouteQuery(path) returns the route query parameters for the given path
- foreveralone.getRouteHash(path) returns the route hash for the given path
- foreveralone.getFullURL(route) returns the full URL for the given route
- foreveralone.push(route) pushes the specified route onto the history stack
- foreveralone.replace(route) replaces the current route with the specified route
- foreveralone.go(route) navigates to the specified route
- foreveralone.back() navigates back in the history stack
- foreveralone.forward() navigates forward in the history stack
- foreveralone.refresh() refreshes the current route
- foreveralone.getHistory() returns the current history stack

## Route declaration

```javascript
let routes = [
    { key: "/home", path: "home-path", ...option, children:[
        { key: "/u", path: "u-path", ...option, children: [], middleware: [
            ()=>{
                console.log("middleware 1");
            }
        ] },
        { key: `/:article type:${type}`, path: "home-path", ...option, children: [
            { key: "deprecated", path: "deprecated-path", ...option, children: [] }
        ] }
    ]}
]

ForeverAlone.addRoutes(routes)
```

## Enhanced Route declaration

```javascript

// from

ForeverAlone.initRoutes({
    "/home": () => renderHome(),
});

function renderHome() {
    return {
        title: "ForeverAlone.home",
        content: "/doc/home.html",
        option: {
            method: "post",
            header: { token: "Bearer ..." },
            props: {
                state: {}
            }
        },
        middleware: [
            () => {
                if (!isUserLoggedIn) {
                    ForeverAlone.navigate("/login");
                    return false;
                }
                return true;
            }
        ],
        children: {
            "/u": () => _renderU(),
            "/:articleId": () => _renderArticleWithID()
        }
    };
}

function _renderU() {
    return {
        title: "ForeverAlone.u",
        content: "/doc/u.html",
        option: {
            method: "get",
            header: { token: "Bearer ..." },
            props: {
                state: {}
            }
        }
    };
}

function _renderArticleWithID() {
    return {
        title: "ForeverAlone.article",
        option: {
            props: {
                state: {}
            }
        },
        children: {
            "/:deprecated": () => _renderIsDeprecatedArticle()
        }
    };
}

function _renderIsDeprecatedArticle() {
    return {
        title: "ForeverAlone.isDeprecated",
        content: "/doc/whoops.html",
        option: {
            method: "get",
            header: { token: "Bearer ..." },
            props: {
                state: {}
            }
        }
    };
}
```