const App = new ForeverAlone({ appShellSelector:'#fragment-body', loadDuration: 1000 });

const routes = [
    { key: "#home", path: "/demo/views/home.html" },
    { key: "#home/:searchId type:number", path: "/demo/views/home.html" },
    { key: "#about", path: "/demo/views/about.html" },
    { key: "#load-spa", path: "/demo/views/load.html" },
    { key: "#err-spa", path: "/demo/views/err.html" },
];

App.addAll(routes);
App.init(); 