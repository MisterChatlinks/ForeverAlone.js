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
    { key: "/home", path: "/views/home.html" },
    {
        key: "/docs", path: "/views/docs.html",
        children: [
            { key: "/:documentation type:string" },
        ]
    },
    { key: "/loading", path: "/views/load.html" },
    { key: "/error", path: "/views/error.html" },
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

