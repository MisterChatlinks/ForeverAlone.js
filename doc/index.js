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
        key: "/docs", path: "/doc/views/docs.html",
        children: [
            { key: "/:documentation type:string" },
        ]
    },
    { key: "/loading...", path: "/doc/views/load.html" },
    { key: "/error", path: "/doc/views/error.html" },
])

foreveralone.init()

