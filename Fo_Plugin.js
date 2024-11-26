// PLUGINS ==============================================>

    SPABundle.use({
        name: "Remove .html from window href",
        at: "onWindowHashFound",
        fn: (args) => {
            if (window.location.href.includes(".html")) {
                console.log("removing .html part of the link");
                let href = window.location.href;
                window.location.href = href.replace(/\/([^\/]+)\.html/, "");
                console.log(window.location.href)
            }
        }
    })
    
    SPABundle.use({
        name: "Redirect to #home if no Hash detected",
        at: "onWindowHashFound",
        fn: (args) => {
            console.log("changing to home")
            if (window.location.hash == "") {
                window.location.hash = "#home";
                window.location.reload()
            }
        }
    })
    
    SPABundle.use({
        name: "Show this's args keys",
        at: "onBeforeRendering",
        fn: (args) => {
            console.group()
                console.log("args contain the keys")
                for(let key in args){
                    console.log(key)
                }
            console.groupEnd()
        }
    })
    
    SPABundle.use({
        name: "console.log the key of the current route being used",
        at: "onBeforeRendering",
        fn: (args) => {
            console.log(`Rendering request for route ${args.currentRoute().key}`)
        }
    })
    
    SPABundle.use({
        name: "Dispatch Event after rendering",
        at: "onAfterRendering",
        fn: (args) => {
            console.log("Event: VIEW-CHANGED");
            document.dispatchEvent(new CustomEvent("VIEW-CHANGED", args));
        }
    })
    
    SPABundle.use({
        name: "signal",
        fn: (event) => document.dispatchEvent(new CustomEvent(event))
    });

// SPABundle.use({
//     name: "Remove # from window href",
//     at: "onWindowHashFound",
//     fn: (args) => {
//         console.log("removing # from the link");
//         let href = window.location.href;
        
//         Replace '#' without causing a page reload
//         const newHref = href.replace("#", "");
        
//         Update the URL without reloading the page
//         window.history.replaceState({}, document.title, newHref);
//     }
// });