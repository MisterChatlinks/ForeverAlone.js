# ForeverAlone.js: A Minimalist SPA Framework  

**ForeverAlone.js** is a lightweight and functional Single Page Application (SPA) engine designed for developers who want a simple, self-contained, and event-driven framework for modern web applications without the overhead of larger libraries.  

It leverages the **History API** for seamless routing, allowing dynamic updates to the browser's URL without refreshing the page. This enables clean, responsive navigation while maintaining the SPA philosophy.  

---

## Key Features  
- **Self-Contained Components**: Define reusable HTML components with encapsulated logic, state, and methods. Components are written in plain HTML, making the framework intuitive and beginner-friendly.  
- **Event-Driven Architecture**: Handle user interactions efficiently with declarative event bindings and custom event-driven methods.  
- **Simple State Management**: Manage and share state between components through properties and ancestor-prop lookups for easy communication.  
- **Facilitated DOM Manipulation**: Built-in helpers simplify dynamic DOM updates, reducing boilerplate and making interactivity straightforward.  
- **Routing with History API**: Navigate through your application using clean URLs, with support for pushState and popState to handle route changes elegantly.  

---

## Sample Code  

```html
<!-- Standalone Component -->
<div stand-alone>
    <!-- Component Properties -->
    <props
        state='{ "count": 0 }'
        root='[ { "prop1": "value1" }, { "prop2": "value2" } ]'
    />
    
    <!-- Component Methods -->
    <methods
        method1='() => console.log("Method 1 called")'
    />
    
    <!-- Event-driven Methods -->
    <eventMethods
        changeColor='() => {
            this.style.color = "blue";
        }'

        increment='() => {
            let state = this.useAncestorProp({ prop: "state" })
            state.count += 1
        }'
    />
    
    <!-- Component Children -->
    <children>
        <div lone-event="click:changeColor">
            <h1>Click me to change color</h1>
        </div>
        <button lone-event="click:increment" >
            Increment Count
        </button>
    </children>
</div>
```

---

## Example Breakdown  
1. **State and Props**: Each component manages its own state while allowing for hierarchical data sharing using `useAncestorProp`.  
2. **Event Binding**: Events like `click` are bound declaratively with attributes like `lone-event`, ensuring clean and maintainable code.  
3. **Scoped Logic**: Methods and event-driven logic are encapsulated within the component, fostering modularity.  

---

## Why Choose ForeverAlone.js?  

If you’re building a project and need a minimal yet functional SPA framework that adheres to modern standards, **ForeverAlone.js** is for you. It's ideal for developers looking to work directly with plain HTML, while enjoying the benefits of componentization and event-driven programming.  

Embrace the simplicity and power of **ForeverAlone.js**—your perfect companion for modern web development.

## Getting Started  

Easily integrate **ForeverAlone.js** into your project by adding the script via a CDN:  

### Unminified Version
```html
<script src="https://cdn.jsdelivr.net/gh/MisterChatlinks/ForeverAlone.js@latest/dist/foreveralone.js"></script>
```

### Minified Version
```html
<script src="https://cdn.jsdelivr.net/gh/MisterChatlinks/ForeverAlone.js@latest/dist/foreveralone.min.js"></script>
```

> **Tip:** Replace `"latest"` with a specific version (e.g., `1.0.0`) to ensure compatibility with your project.  

---

## Sample Application  

Here’s a quick demo to showcase how **ForeverAlone.js** works:

### **index.html**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ForeverAlone.js Demo</title>
    <script src="https://cdn.jsdelivr.net/gh/MisterChatlinks/ForeverAlone.js@latest/dist/foreveralone.min.js"></script>
</head>
<body>
    <div id="foreveralone-app"></div>
    <script>
        // Initialize the ForeverAlone.js App
        let app = new foreveralone();
        app.configure({
            appShell: '#foreveralone-app',
            pageRef: {
                root: "/home",
                load: "/wait-a-minute",
                err: "/404"
            }
        });
        app.addRoutes([
            { key: "/home", path: "/view/home.html" },
            { key: "/test", path: "/view/test.html" },
            { key: "/404", path: "/view/err.html" },
            { key: "/wait-a-minute", path: "/view/load.html" },
        ]);
        app.init();
    </script>
</body>
</html>
```

---

### Component HTML Files  

1. **`load.html`**  
   ```html
   <children>
       <p>Wait a moment, the page is loading...</p>
   </children>
   ```

2. **`err.html`**  
   ```html
   <children>
       <p>Oops! Something went wrong. Return to the home page: <a app-link href="/home">Click here</a>.</p>
   </children>
   ```

3. **`test.html`**  
   ```html
   <children>
       <p>Test successful! Nothing much to see here. <a app-link href="/home">Go to the home page?</a></p>
   </children>
   ```

4. **`home.html`**  
   ```html
   <children>
       <p>Welcome home! Navigate to other pages or explore the demo. <a app-link href="/test">Run a test?</a></p>
   </children>
   ```

---

## How It Works  

1. **Routing:**  
   ForeverAlone.js uses the **History API** to handle navigation seamlessly without refreshing the page. Routes are mapped to their respective HTML files using the `addRoutes` method.

2. **Component-Based Design:**  
   Pages and component elements are treated as standalone components, leveraging HTML’s custom structure with attributes like `<children>` for nested content.

3. **Dynamic Links:**  
   Use the `app-link` attribute to create dynamic, SPA-friendly navigation between routes.

---

This setup provides a foundation to build a lightweight, event-driven SPA with plain HTML and JavaScript. Customize the app further by extending the routes or creating more complex components. 🎉



