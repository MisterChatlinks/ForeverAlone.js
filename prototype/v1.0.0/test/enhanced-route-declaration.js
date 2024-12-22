function _Fa_ParseRoutes(routes) {

    let result = [];

    let nodes = Object.keys(routes);
    nodes
        .forEach(node => {
            if (typeof routes[node] == "function") {
                routes[node] = routes[node]();
            }
            routes[node].key = routes[node].type ? `${node} type:${routes[node].type}` : node;
            routes[node] = {...routes[node], ...( routes[node].option || {} )  }

            if(routes[node].content){
                routes[node].path = routes[node].content;
            } 

            delete routes[node].type;
            delete routes[node].option;
            delete routes[node].content;

            if(routes[node].children){
                routes[node].children = parseRoutes(routes[node].children)
            }
            result.push(routes[node]);
        }
    )

    return result;
}

let app = {
    "/home": () => renderHome(),
}

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
        type: "number",
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
        path: "/doc/whoops.html",
        option: {
            method: "get",
            header: { token: "Bearer ..." },
            props: {
                state: {}
            }
        }
    };
}


// let routes = [
//     {
//         key: "/home", path: "home-path", ...option, children: [
//             { key: "/u", path: "u-path", ...option, children: [] },
//             {
//                 key: `/:article type:${type}`, path: "home-path", ...option, children: [
//                     { key: "deprecated", path: "deprecated-path", ...option, children: [] }
//                 ]
//             }
//         ]
//     }
// ]

console.log(JSON.stringify(parseRoutes(app)))