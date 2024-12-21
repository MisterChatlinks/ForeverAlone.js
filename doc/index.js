foreveralone.configure({
    appShell: 'foreveralone-docs-app',
    pagesRef: {
        root: "/home",
        load: "/loading...",
        err: "/error"
    }
})

foreveralone.addRoutes([
    { key: "/home", path: "/doc/views/home.html" },
    {
        key: "/docs", path: "./views/docs.html",
        children: [
            { key: "/:documentation-required type:string" },
        ]
    },
    { key: "/loading", path: "./views/load.html" },
    { key: "/error", path: "./views/home.html" },
])

foreveralone.init()

