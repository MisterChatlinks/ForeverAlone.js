'use strict';

/* Core logic ====================================================================>*/

class appShell {
    constructor(fragment) {
        this.fragment = isValidFragment(fragment);
        if (this.fragment) {
            Router.routerLifeCycleHooks.extendCycle("onBeforeRendering");
            Router.routerLifeCycleHooks.extendCycle("onAfterRendering");
            Router.useArgs["fragmentAppShell"] = () => { return this.fragment };
        }
    }

    render(component) {      
          try {
            Router.executeCycle("onBeforeRendering");

            this.fragment.innerHTML = component;

            // handle script tag execution
            if (this.fragment.querySelector("script")) {
                loadViewWithScripts(this.fragment);
            }

            // handle pseudo event
            if (this.fragment.querySelector('[data-event]')) {
                this.bindPseudoEvents(this.fragment);
            }

            Router.executeCycle("onAfterRendering");

        } catch (error) {
            if (error.message === "Execution halted by request") {
                console.log("Stopping current execution, origin: appShell");
                return;
            }
            console.log("Error", error, JSON.stringify(this.fragment));
        }
    }

    renderDefaultComponent() {
        console.log("default err,", defaultPageErr());
        let defaultComponent = defaultPageErr();
        this.render(defaultComponent);
    }

    bindPseudoEvents(viewer) {
        const elements = viewer.querySelectorAll("[data-event]");

        elements.forEach((el) => {
            // Get the events and functions from data-event attribute
            const events = el.getAttribute("data-event").split(";");

            /**
             * Simulates an element being loaded by listening for the `viewChanged` event
             * and triggering the appropriate handler when the DOM is ready.
             * 
             * @param {string} handlerName - The name of the handler function to invoke.
             */
            function simulateElementLoaded(target, handlerName) {
                if (typeof window[handlerName] === "function") {
                    target.addEventListener("VIEW-CHANGED", window[handlerName], {once: true})
                    target.dispatchEvent(new CustomEvent("VIEW-CHANGED"));
                } else {
                    console.error(`Handler ${handlerName} is not defined.`);
                }
            }

            // Iterate over each event pair and bind the appropriate handler
            events.forEach((eventPair) => {
                const [eventType, handlerName] = eventPair.split(":").map((e) => e.trim());

                switch (eventType) {
                    case "load":
                        simulateElementLoaded(el, handlerName);
                        break;

                default:
                    // Attach the event handler to the element
                    if (eventType && handlerName && typeof window[handlerName] === "function") {
                        el.addEventListener(eventType, window[handlerName]);
                    } else {
                        console.warn(`Handler ${handlerName} for event ${eventType} is not defined.`);
                    }
                }
            });
        });
    }
}

class Router {
    static instance = null;
    static route = [];

    constructor({ appShell, loadDuration = null, pagesRef = { err, load, login } }) {
        this.loadDuration = loadDuration;
        this.appShell = appShell;
        this.pagesRef = pagesRef || null;
        window.addEventListener("hashchange", () => this.onHasChange());
    }

    static getInstance({ appShell, loadDuration, pagesRef }) {
        if (!Router.instance) {
            Router.instance = new Router({ appShell: appShell, loadDuration: loadDuration, pagesRef: { ...pagesRef } });
        }
        return Router.instance;
    }

    static addRoute(route) {
        let routeStock = Router.route;
        if (routeStock.some((r) => r.key === route.key)) {
            console.warn(`Route with key "${route.key}" already exists.`);
            return;
        }
        routeStock.push(route)
    }

    static stopCode() {
        throw new Error("Execution halted by request")
    }

    addRoute(route) {
        Router.addRoute(route)
    }

    static routesConfig = {
        currentRoute: null,
        currentHash: null,
        loadingRoute: null,
        errorRoute: null,
    }

    static urlParams = () => { return Router.routesConfig.currentRoute.url.paramExtractor({ hashUrl: Router.routesConfig.currentHash }) }

    findCurrentRoute() {
        Router.routesConfig.currentRoute = this.findRoute(route => route.url.match({ hashUrl: this.currentHash }) === true);
        this.currentRoute = Router.routesConfig.currentRoute;
    }

    findLoadRoute() {
        let ref = this.pagesRef.load || "#load-spa";
        Router.routesConfig.loadingRoute = this.findRoute(route => route.key === ref);
        this.loadRoute = Router.routesConfig.loadingRoute;
    }

    findErrRoute() {
        let ref = this.pagesRef.err || "#err-spa";
        Router.routesConfig.errorRoute = this.findRoute(route => route.key === ref);
        this.errRoute = Router.routesConfig.errorRoute;
    }

    findCurrentHashRoute() {
        Router.routesConfig.currentHash = window.location.hash;
        this.currentHash = Router.routesConfig.currentHash;
    }

    static findRoute(predicate) {
        return Router.route.find(predicate);
    }

    findRoute(predicate) {
        return Router.findRoute(predicate)
    }

    onHasChange() {
        try {
            this.findCurrentHashRoute()
            this.executeCycle("onWindowHashFound");

            this.findCurrentRoute()
            this.executeCycle("onRouteFound");

            this.findErrRoute();
            this.findLoadRoute();

            const route = this.currentRoute;
            const load = this.loadRoute;
            const err = this.errRoute;

            this.clearAppShell() // Clear existing content

            const renderWithTimeout = (callback) => {
                setTimeout(() => callback(), this.loadDuration || 1500);
            };

            if (load) {
                this.executeCycle("onLoading")
                this.appShell.render(load.component);
            }

            if (route) {
                const redirectKey = this.beforeNavigate(route);
                if (redirectKey !== route.key) {
                    window.location.hash = redirectKey;
                    return;
                }
                this.executeCycle("onPrepareRendering");
                renderWithTimeout(() => this.appShell.render(route.component));
            } else if (err) {
                this.executeCycle("onError");
                renderWithTimeout(() => this.appShell.render(err.component));
            } else {
                this.executeCycle("onDefaultError");
                renderWithTimeout(() => this.appShell.renderDefaultComponent());
            }
        } catch (err) {
            if (err.message === "Execution halted by request") {
                console.log("Stopping current execution, origin: Router");
                return;
            }
        }
    }

    beforeNavigate(route) {
        if (this?.pagesRef?.login) {
            if (route?.requiresAuth && isUserLoggedIn() !== true) {
                return this.pagesRef.login;
            }
        }
        return route.key;
    }

    firstInit() {
        this.onHasChange();
    }

    on(event, callback) {
        if (!this.listener) {
            this.listener = {};
        }
        this.listener[event] = callback;
        document.addEventListener(event, () => callback(this))
    }

    clearAppShell() {
        this.appShell.fragment.innerHTML = "";
    }

    static registeredMethods = {}
    registeredMethods = Router.registeredMethods;

    static routerLifeCycleHooks = new Proxy({
        // Initialisation des cycles disponibles
        "onWindowHashFound": {},
        "onLoading": {},
        "onError": {},
        "onDefaultError": {},
        "onPrepareRendering": {},
        "onRouteFound": {},

        // Méthode pour ajouter un cycle
        extendCycle(prop) {
            if (!this[prop]) {
                this[prop] = {};
            } else {
                throw new Error(`Unauthorized override of lifeCycle: "${prop}", requires core code modification`);
            }
        }
    }, {
        // Interception de la lecture des propriétés
        get: (target, prop) => {
            if (prop in target) {
                return target[prop];
            } else {
                console.warn(`Property "${prop}" not found in lifeCycle`);
            }
            return target[prop];
        },
        set: (target, prop, value) => { // Interception de l'écriture pour éviter les modifications
            if (!target[prop]) {
                target[prop] = value;
                return true;
            } else {
                throw new Error(`Cycle "${prop}" already exists. Core code modification required.`);
            }
        }
    })

    static executeCycle(cycleName) {
        let cycle = Router.routerLifeCycleHooks[cycleName];

        if (cycle) {
            for (let key in cycle) {
                cycle[key];
            }
        }
    }

    executeCycle(cycleName) {
        Router.executeCycle(cycleName);
    }

    static useArgs = {
        currentRoute: () => { return Router.routesConfig.currentRoute },
        currentHash: () => { return Router.routesConfig.currentHash },
        loadRoute: () => { return Router.routesConfig.loadingRoute },
        errRoute: () => { return Router.routesConfig.errorRoute },
        findRoute: (predicate) => { return Router.findRoute(predicate) },
        stopCode: () => Router.stopCode(),
        urlParams: ()=>{ return Router.urlParams}
    }

    useArgs() {
        return Router.useArgs;
    }

    static use({ name, at, fn }) {
        let props = this.useArgs;

        if (at) {
            this.registerLifeCycle(at, name, fn, props);
        } else {
            this.registerMethod(name, fn, props);
        }
    }

    static async registerLifeCycle(at, name, fn, props) {
        async function updatelifeCycle() {
            await new Promise((resolve, reject) => {
                let findAt = setInterval(() => {
                    if (Router.routerLifeCycleHooks[at]) {
                        Router.routerLifeCycleHooks[at][name] = fn(props);
                        resolve(true);
                        clearInterval(findAt);
                    }
                }, 100);
            });
        }

        const cycle = await updatelifeCycle();

        if (cycle) {
            console.log("cycle func ", Router.routerLifeCycleHooks[at][name])
        }
    }

    static registerMethod(name, fn, props) {
        Router.registeredMethods[name] = fn(props);
    }
}

/* Route Logic ===================================================================>*/

class Route {
    constructor({ key, path, inlineComponent = null, requiresAuth = false, useData = {} }) {
        this.key = key;
        this.path = path;
        this.component = inlineComponent || null;
        this.use = useData;

        this.url = new UrlParameter({ pattern: this.key });

        requiresAuth ? this.requiresAuth = true : null;

        if (!inlineComponent) {
            this.initComponent();
        }

        Router.addRoute(this);
    }

    async initComponent() {
        try {
            this.component = await this.getComponent();
        } catch (error) {
            console.error("Error loading component:", error);
            this.component = "<div>Error loading component, retry in few minute</div>";
            this.retryCount < 20 && setTimeout(() => this.retryComponentInit, 5000);
        }
    }

    retryCount = 0;

    retryComponentInit() {
        this.retryCount++;
        this.initComponent();
    }

    getComponent() {
        return new HttpHelper({ url: this.path, method: "GET" }).execute();
    }
}

/**
 * @example 
 *  example.com/#index/:id type:string/...
 *  => example.com/#index/123/...
*/
class UrlParameter {
    constructor({ pattern }) {
        this.patternToSearch = pattern;
        this.routeStructure = [];
        this.constructRegex()
    }

    constructRegex() {
        // Remove trailing slashes to ensure consistency
        this.patternToSearch = this.patternToSearch.replace(/\/$/, '');
        console.log('this pattern', this.patternToSearch);

        const regex = /(:\w+ type:\w+)|([^:]+(?=:)|[^:]+$)/g;

        let pattern = this.patternToSearch.match(regex);

        this.routeRegex = pattern.map((patternFound) => {
            if (patternFound.includes('type:')) {
                return this.parseParam(patternFound);  // Parse parameter with type
            } else {
                this.routeStructure.push(patternFound);
                return patternFound;
            }
        }).join('');

        console.log('RouteLink', this.routeRegex);
    }

    match({ hashUrl }) {
        // Remove trailing slashes from hashUrl and routeRegex for consistency
        let url = hashUrl.replace(/\/$/, '').split('/');
        let urlShapeExpected = this.routeRegex.split('/');

        // If the length of the URL doesn't match the expected structure, return false
        if (url.length !== urlShapeExpected.length) {
            return false;
        }

        // Check each part of the URL against the expected regex pattern
        for (let i = 0; i < url.length; i++) {
            // If the current expected structure part is a parameter (e.g., :id type:number)
            // Create a regex from the expected pattern and test the URL part
            const expectedPart = urlShapeExpected[i];
            const regExp = new RegExp(expectedPart);

            if (!regExp.test(url[i])) {
                return false;
            }
        }
        return true;
    }


    parseParam(patternFound) {
        const paramParts = patternFound.split(" ");
        if (paramParts.length >= 1) {
            const paramName = paramParts[0];
            const paramType = paramParts[1].split("/")[0].replace('type:', "");

            this.routeStructure.push(paramName);
            return this.getRegexForType(paramType);
        }
    }

    getRegexForType(type) {
        switch (type) {
            case 'string': return '([\\w\\d\\-_]+)'; // Allow alphanumeric, hyphen, and underscore
            case 'number': return '([0-9]+)';
            case 'boolean': return 'true|false';
            default: {
                console.warn(`Unrecognized type: ${type}. Using default (.*)`);
                return '(.*)';  // Catch-all for unknown types
            }
        }
    }

    paramExtractor({ hashUrl }) {
        if (this.match({ "hashUrl": hashUrl })) {
            let param = {};
            let route = hashUrl.replace(/\/$/, '').split('/');
            let structure = this.routeStructure.join("").split('/')

            for (let index = 0; index < route.length; index++) {
                if (structure[index].includes(':')) {
                    param[structure[index].replace(':', "").trim()] = route[index];
                }
            }
            return param;

        } else { return false; }
    }
}

// const patterns = [
//     'example.com/#index/:id type:number/:search type:string/',
//     'example.com/#index/:id type:number/:search type:string/:test type:string/',
//     'example.com/#home',
//     'example.com/#product/:sku type:string/:available type:boolean/'
// ];

// patterns.forEach(pattern => {
//     const test = new UrlParameter({ pattern: pattern });
//     console.log(test.paramExtractor({ hashUrl: 'example.com/#index/123/message' }));
//     console.log(test.paramExtractor({ hashUrl: 'example.com/#index/123/message/xp' }));
//     console.log(test.paramExtractor({ hashUrl: 'example.com/#index/hi/message/xp' })); // type checking, so should return false 
//     console.log(test.paramExtractor({ hashUrl: 'example.com/#index/true/message/xp' })); // type checking, so should return false 
//     console.log(test.paramExtractor({ hashUrl: 'example.com/#product/camera/true/' }));
//     console.log(test.match({ hashUrl: 'example.com/#home' }));
// });

/* Sub/Helper Class ==============================================================>*/

class HttpHelper {
    constructor({ url, method }) {
        this.url = url;
        this.method = method;
    }

    execute() {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(this.method, this.url, true);
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.responseText);
                } else {
                    reject(xhr.responseText);
                }
            };
            xhr.onerror = () => reject(xhr.statusText);
            xhr.send();
        });
    }
}

class loginState {
    instance = null

    constructor() {
        this.state = false;
    }

    getInstance() {
        if (!loginState.instance) {
            loginState.instance = new loginState();
        }
        return loginState.instance
    }

    setState(value) {
        this.state = Boolean(value);
    }
    isLoggedIn() {
        return this.state;
    }
}

/* Helper Function ===============================================================> */

function isUserLoggedIn() {
    return new loginState().isLoggedIn();
}

function isValidFragment(fragment) {
    if (typeof fragment == "string") {
        const el = document.querySelector(fragment);

        if (!el) {
            console.warn(`Fragment "${fragment}" not found. Check your selector.`);
            return null;
        }

        return el;
    } else {
        throw new Error("Invalid fragment type");
    }
}

function defaultPageErr(errorMessage = "The page you are looking for is not available.") {
    return `
        <style>

            body { background-color: #f0f0f0; padding: auto, height: 100vh, width: 100vw}
            
            * { margin: auto }

            .error-page {
                background-color: #f0f0f0;
                height: 100vh;
                width: 100vw;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
            }

        </style>
        <div class="error-page">    
            <h1>Oops! Something went wrong.</h1>
            <p>${errorMessage}</p>
            <a href="#home" class="btn">Go to Homepage</a>
        </div>
    `;
}

function loadViewWithScripts(element) {
    _fa_nodeScriptReplace(element); // This will handle script execution
}

var _fa_nodeScriptReplace = function (node) {
    if (node.tagName === "SCRIPT") {
        node.parentNode.replaceChild(_fa_nodeScriptClone(node), node);
    } else {
        var index = 0;
        var children = node.childNodes;
        while (index < children.length) {
            _fa_nodeScriptReplace(children[index++]);
        }
    }

    return node;
};

var _fa_nodeScriptClone = function (node) {
    var script = document.createElement("script");
    script.text = node.innerHTML;
    for (var index = node.attributes.length - 1; index >= 0; index--) {
        script.setAttribute(node.attributes[index].name, node.attributes[index].value);
    }
    return script;
};

/* Bundle Logic =================================================================> */

class SPABundle {
    instance = null;
    sessionState = sessionStorage;

    static RouterRef = Router;

    constructor({ appShellSelector, loadDuration, pagesRef = { err: null, load: null, login: null } }) {
        this.appShell = new appShell(appShellSelector);

        let Refs = pagesRef;
        let App = this.appShell;
        let Duration = loadDuration;

        this.router = Router.getInstance({
            appShell: App,
            loadDuration: Duration,
            pagesRef: Refs
        });
    }

    static getInstance({ appShellSelector, loadDuration, pagesRef = { err: null, load: null, login: null } }) {
        if (!SPABundle.instance) {
            SPABundle.instance = new SPABundle({ appShellSelector, loadDuration, pagesRef })
        }
        return this.instance;
    }

    static use({ name, at, fn }) {
        return SPABundle.RouterRef.use({ name, at, fn });
    }

    use({ name, at, fn }) {
        return SPABundle.use({ name, at, fn })
    }

    add({ key, path, inlineComponent, requiresAuth = false, useData = {} }) {
        new Route({ key, path, inlineComponent, requiresAuth, useData })
    }

    addAll(routes) {
        routes.forEach(route => this.add(route));
    }

    init() {
        this.router.firstInit();
    }

    getArgs = () => {return this.router.useArgs}

    urlParams() {
        return this.router.urlParams();
    }

    getSessionState() {
        return this.sessionState;
    }
}

class ForeverAlone {
    constructor({ appShellSelector, loadDuration, pagesRef = { err: null, load: null, login: null } }) {
        return SPABundle.getInstance({ appShellSelector, loadDuration, pagesRef })
    }
}

/* Sub Feature ===================================================================> */

class Fo_ImportMap {
    instance = null;

    constructor(importMapUrl) {
        window.importsFunc = {};

        this.map = importMapUrl;
        console.log(this.map);

        this.importList = this.#getImportMap();
        this.importList
            .then((importList) => {
                console.log("implist is", importList);
                
                this.#setImportMapScript(importList)
                    .then((resolve) => {
                        console.log("resolved with", resolve)
                        this.#setImportStmt(resolve);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            })
            .catch((err) => {
                console.error("implist is", err);
            });
    }

    static getInstance({ MapUrl }) {
        console.log("ist", MapUrl);
        if (!ImportMap.instance) {
            ImportMap.instance = new ImportMap(MapUrl);
        }
        return ImportMap.instance;
    }

    async #setImportMapScript(importList) {
       return await new Promise((resolve, reject) => {
            function trySettingImportMap (){
                try {
                    const script = document.createElement("script");
                    script.type = "importmap";

                    let map = { imports: {} };

                    let alias, path;

                    let impList = JSON.parse(importList);

                    for (let key in impList) {
                        console.log(impList, "key is", key);
                        path = impList[key]["path"];
                        alias = impList[key]["alias"];
                        map["imports"][alias] = path;
                    }

                    script.innerHTML = JSON.stringify(map);

                    if (document.head.appendChild(script)){
                        return impList
                    } else {
                        return false
                    };
                } catch (err) {
                    return false
                }
            }

            const result = trySettingImportMap(); 
            console.log("trying to set imp map result : ", result)

                  result != false && typeof result != 'boolean'
                    ? resolve(result)
                    : reject(Throw(new Error("Error while setting import map")))
        });
    }

    #setImportStmt(importList) {
        console.group("setImportStmt", importList);
        const script = document.createElement("script");
        script.type = "module";

        let alias;
        for (let key in importList) {
            alias = importList[key]["alias"];
            if (key.includes(",")) {
                let keys = key.split(",");
                script.innerHTML += `import { ${keys.join(",")} } from "${alias}"; `;
            } else {
                script.innerHTML += `import ${key} from "${alias}"; `;
            }
        }

        for (let key in importList) {
            if (key.includes(",")) {
                let keys = key.split(",");
                script.innerHTML += keys
                    .map((key) => {
                        return `window.importsFunc["${key}"] = ${key}; `;
                    })
                    .join(" ");
            } else {
                script.innerHTML += `window.importsFunc["${key}"] = ${key}; `;
            }
        }
        script.innerHTML +=
            "document.dispatchEvent(new CustomEvent('imp-state-done')); window.importsFunc['imp-state-done'] = 'done' ";

        document.head.appendChild(script);
    }

    async #getImportMap() {
        return await this.#HttpHelper({ url: this.map });
    }

    #HttpHelper({ method, url }) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(method || "GET", url, true);
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.responseText);
                } else {
                    reject(xhr.responseText);
                }
            };
            xhr.onerror = () => reject(xhr.statusText);
            xhr.send();
        });
    }
}

class Fo_Thread {
    constructor() {
        this.imports = window.importsFunc;
    }

    async await({ modules, callback }) {
        while (!modules.some((module) => this.imports[module])) {
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
        callback();
    }
}

/* Capability extended ============================================================> */

