let config = {
    appShell: 'docs-app',
    pagesRef: {
        root: "/home",
         err: "/error",
        load: "/loading",
    },
    loadTime: 3500
}

ForeverAlone.configure(config);

// ForeverAlone.initRoutes({
//     "/home": () => renderHome(),
//     "/about": () => renderAbout(),
// });

ForeverAlone.addRoutes([
    { key: "/home", path: "/docs/views/home.html" },
    {
        key: "/docs", path: "/docs/views/docs.html",
        children: [
            { key: "/:documentation type:string" },
        ]
    },
    { key: "/loading", path: "/docs/views/load.html" },
    { key: "/error", path: "/docs/views/error.html" },
])




// function renderHome() {
//     return {
//         title: "Home",
//         content: "/dist/foreveralone.js",
//         children: {
//             "/u": () => renderU(),
//             "/config": () => renderAbout(),
//         }
//     }
// }

ForeverAlone.initApp()

