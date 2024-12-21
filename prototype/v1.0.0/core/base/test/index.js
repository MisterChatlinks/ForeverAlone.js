let app = new foreveralone();
app.configure({ fragmentSelector: '#app' })
app.addRoutes([
    {key: "/index", path: "/prototype/v1.0.0/core/base/test/view/home.html"},
    {key: "/test", path: "/prototype/v1.0.0/core/base/test/view/test.html"}
])
app.init()





