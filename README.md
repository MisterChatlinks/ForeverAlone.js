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
   Pages and UI elements are treated as standalone components, leveraging HTML’s custom structure with attributes like `<children>` for nested content.

3. **Dynamic Links:**  
   Use the `app-link` attribute to create dynamic, SPA-friendly navigation between routes.

---

This setup provides a foundation to build a lightweight, event-driven SPA with plain HTML and JavaScript. Customize the app further by extending the routes or creating more complex components. 🎉



