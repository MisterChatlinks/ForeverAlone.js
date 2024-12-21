## Getting Started  

Include the ForeverAlone.js script in your project:  

### Unminified Version
```html
<script src="https://cdn.jsdelivr.net/gh/MisterChatlinks/ForeverAlone.js@latest/dist/foreveralone.js"></script>
```

### Minified Version
```html
<script src="https://cdn.jsdelivr.net/gh/MisterChatlinks/ForeverAlone.js@latest/dist/foreveralone.min.js"></script>
```

Replace `"latest"` with the desired version if needed for version control.

## Sample App

**index.html**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="https://cdn.jsdelivr.net/gh/MisterChatlinks/ForeverAlone.js@latest/dist/foreveralone.min.js"></script>
</head>
<body>
    <div id="foreveralone-app"></div>
    <script>
      let app = new foreveralone();
          app.configure({ appShell: '#app', pageRef: { root: "/home" })
          app.addRoutes([
              {key: "/home", path: "/view/home.html"},
              {key: "/test", path: "/view/test.html"},
          ])
          app.init()
    </script>
</body>
</html>
``

