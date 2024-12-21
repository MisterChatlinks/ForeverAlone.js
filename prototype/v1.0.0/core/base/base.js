/*<=========================================================== Debugging Helper Class ============================================================>>*/

/**
* A helper class for managing and controlling debugging functionality.
* 
* @class
*/
class _Fa_DebugHelper {

    static #debugStack = {};
    static #debugRegistered = [];
    static debugTrace = false;
    static #traceable = {};

    static #debugAll = false

    /**
     * Toggles all debug modes to `true`.
     */
    static toggleDebugAllTrue() {
        this.#debugAll = true;
    }

    /**
     * Toggles all debug modes to `false`.
     */
    static toggleDebugAllFalse() {
        this.#debugAll = false;
    }

    /**
     * Registers or returns a reference name for debugging.
     * 
     * @param {string} at - The reference name to be registered.
     * @returns {string} The reference name.
     */
    static debugReference(at) {
        if (!at) at = "Unknown";
        if (!this.#debugStack[at]) {
            this.#debugStack[at] = false;
            this.#debugRegistered.push(at);
        }
        return (type, message, data = null)=> this.debugLogs({ ref: at, type: type, message: message, data: data });
    }

    /**
     * Activates tracing mode for debugging.
     */
    static traceOn() {
        this.debugTrace = true;
    }

    /**
     * Marks a reference or an array of references as traceable.
     * 
     * @param {string | string[]} target - A single reference or an array of references to be marked as traceable.
     */
    static isTraceable(target) {
        if (typeof target === "string") {
            this.#traceable[target] = true;
        } else if (Array.isArray(target)) {
            target.forEach((item) => {
                this.#traceable[item] = true;
            });
        }
    }

    /**
     * Logs messages to the console based on reference, type, and conditions.
     * 
     * @param {Object} params - The logging parameters.
     * @param {string} params.ref - The reference name associated with the log.
     * @param {string} params.type - The type of log ('log', 'warn', 'error', etc.).
     * @param {string} params.message - The message to be logged.
     */
    static debugLogs({ ref, type, message, data = null }) {
        if (this.#debugStack[ref] === true || this.#debugAll === true) {
            const style = _Fa_DebugHelper_Styles.styles[type] || _Fa_DebugHelper_Styles.styles["log"];
            const debugMode = this.debugTrace && this.#traceable[ref] ? "trace" : "log";

            switch (type) {
                case "error":
                    console.error(`%c${message}`,  style);
                    break;
                case "warn":
                    console.warn(`%c${message}`, style);
                    break;
                case "info":
                    console.info(`%c${message}`, style);
                    break;
                case "debug":
                    console[debugMode](`%c${message}`, style);
                    break;
                default:
                    console.log(`%c${message}`, style);
            }
        }
        if(data){
            console.log(data);
        }
    }

    /**
     * Initializes debugging for a reference or array of references.
     * 
     * @param {string | string[]} target - A single reference or an array of references to initialize debugging for.
     */
    static initDebug(target) {
        if (typeof target === "string") {
            this.#debugStack[target] = true;
        } else if (Array.isArray(target)) {
            target.forEach((item) => {
                this.#debugStack[item] = true;
            });
        }
    }
}

/**
 * A class that contains predefined styles for different log types.
 * 
 * @class
 */
class _Fa_DebugHelper_Styles {
    /**
     * A collection of styles for various log types.
     * 
     * @static
     * @type {Object}
     * @property {string} error - Style for error logs.
     * @property {string} warn - Style for warning logs.
     * @property {string} info - Style for info logs.
     * @property {string} debug - Style for debug logs.
     * @property {string} success - Style for success logs.
     * @property {string} log - Default style for general logs.
     */
    static styles = {
        error: "color: white; background-color: red; font-weight: bold;",
        warn: "color: black; background-color: yellow; font-weight: bold;",
        info: "color: blue; background-color: lightgray; font-weight: normal; padding: 4px;",
        debug: "color: white; background-color: darkorange; font-weight: normal; padding: 2px 4px;",
        success: "color: green; background-color: lightgreen; font-weight: bold; padding: 4px;",
        log: "color: black; background-color: white; font-weight: normal;",
    };
}

const _Fa_UseDebugHelper = (debugConfigs) => {
    console.log("Debug mode is initializing...");

    for (let config of debugConfigs) {
        if (config?.debug === true) {
            _Fa_DebugHelper.initDebug(config.ref);
        }
        if (config?.trace === true) {
            _Fa_DebugHelper.isTraceable(config.ref);
        }
    }
    _Fa_DebugHelper.traceOn();
    console.log("Debug mode is active.");
};

let debuggable = [
    { ref: "_Fa_getTag", debug: true, trace: false },
    { ref: "_Fo_Component", debug: true, trace: false },
    { ref: "_Fo_Component_Config", debug: true, trace: false },
    { ref: "_Fo_Component_PlaceholderParser", debug: true, trace: false },
    { ref: "_Fo_Component_PlaceholderReplacer", debug: true, trace: false },
    { ref: "_Fo_Component_LifecycleInterpreter", debug: true, trace: false },
    { ref: "_Fa_ParentChildRelationshipHelper_useAncestorMethod", debug: true, trace: false },
    { ref: "_Fa_ParentChildRelationshipHelper_useAncestorProp", debug: true, trace: false },
    { ref: "_Fa_ParentChildRelationshipHelper_useAncestorEventMethod", debug: true, trace: false },
    { ref: "_Fo_AppRouter", debug: true, trace: false },
    { ref: "_Fo_AppRoute_UrlParameter", debug: true, trace: false },
    { ref: "_Fo_AppManager", debug: true, trace: false }
];

_Fa_UseDebugHelper(debuggable);

/*<=========================================================== ForeverAlone Routing ============================================================>>*/

class _Fo_AppShell {
    
     debug = _Fa_DebugHelper.debugReference("_Fo_appShell")

    constructor(fragment) {
        this.fragment = this.isValidFragment(fragment);
        if (this.fragment) {
            _Fo_AppRouter.lifeCycle.extendLifeCycle("onBeforeRendering");
            _Fo_AppRouter.lifeCycle.extendLifeCycle("onAfterRendering");
            _Fo_AppRouter.args["fragmentAppShell"] = () => { return this.fragment };
        }
    }

    async render(component) {      
          try {
            _Fo_AppRouter.executeLifeCycle("onBeforeRendering");
            console.log(component)
            const result = await component.render();
            if(result){
                foreveralone.clean(this.fragment);
                this.fragment.appendChild(result);
                _Fo_AppRouter.executeLifeCycle("onAfterRendering");
            } else {
                throw new Error("Component render failed");
            }
        } catch (error) {
            if (error.message === "Component render failed") {
                this.debug("warn", "Stopping current execution, origin: appShell" + error);
                console.log("Current fragment", this.fragment);
                return false;
            }
            console.log("Error", error, this.fragment);
        }
    }

    isValidFragment(fragment) {
        if (typeof fragment == "string") {
            const el = document.querySelector(fragment);
    
            if (!el) {
                this.debug("error", "Fragment not found");
                return null;
            }
    
            return el;
        } else {
            console.log(fragment)
            throw new Error("Invalid fragment type");
        }
    }
}

/**
 * Router class for managing Single Page Application (SPA) navigation and route handling.
 */
class _Fo_AppRouter {
    /** Singleton instance of the router */
    static instance = null;

    /** Debugging utility */
    static debug = _Fa_DebugHelper.debugReference("_Fo_AppRouter");

    /**
     * Retrieve the singleton instance of the router.
     * @returns { _Fo_AppRouter } The router instance.
     */
    static getInstance() {
        if (this.instance === null) {
            this.instance = new _Fo_AppRouter();
        }
        return this.instance;
    }

    /**
     * Configures the router with initial settings.
     * @param {Object} param - Configuration parameters.
     * @param {Object} param.appShell - The main application shell responsible for rendering routes.
     * @param {Object} [param.pagesRef={}] - A reference object for special routes (e.g., loading, error).
     * @param {number} [param.loadTime=1500] - Delay (in ms) before rendering a route.
     * @param {Array<Function>} [param.middlewares=[]] - Middleware functions to execute during route changes.
     * @throws Will throw an error if `appShell` is not provided.
     */
    static configure({ appShell, pagesRef, loadTime, middlewares } = param) {
        if (appShell) {
            this.appShell = appShell;
        } else {
            throw new Error("Fatal Error: appShell is required, ", appShell, " passed");
        }
        this.pagesRef = pagesRef || {};
        this.loadTime = loadTime || 1500;
        this.middlewares = middlewares || [];
    }

    /** Checks if jQuery is available in the environment. */
    static isJQueryAvailable = () => typeof $ !== 'undefined';

    /** Initializes the router and sets up event listeners for navigation. */
    static init() {
        this.isJQueryAvailable()
            ? this.debug( "info", "JQuery detected, igniting router on JQuery Version")
            : this.debug( "info", "No JQuery detected, igniting router on standard Version");

        // Handle forward/backward navigation triggered by the browser
        window.addEventListener("popstate", ()=>{
            this.isJQueryAvailable()
                ? _Fo_AppRouter.onUrlChange(window.location.pathname) 
                : _Fo_AppRouter.onUrlChangeStandard(window.location.pathname);
        });

        // Handle custom navigation via "app-link" clicks
        document.addEventListener("click", (e) => {
            if (e.target.hasAttribute("app-link")) {
                e.preventDefault(); // Prevent the default link behavior
                if(window.location.pathname != e.target.getAttribute("href")){
                    // Update the URL without reloading the page
                    window.history.pushState({}, "", e.target.getAttribute("href"));
                    window.dispatchEvent(new Event("popstate"))
                }
            }
        });
    }

    /** @type {Array<Object>} List of registered routes. */
    static routes = [];

    /**
     * Adds a new route to the router.
     * @param {Object} route - The route object to add.
     */
    static add(route) {
        this.routes.push(route);
    }

    /** Handles URL changes (for environments with jQuery). */
    static onUrlChange() { }

    /**
     * Finds a route based on a predicate function.
     * @param {Function} predicate - The predicate function to find the route.
     * @returns {Object} The matching route, or undefined if not found.
     */
    static findRoute(predicate) {
        return this.routes.find(predicate);
    }

    /**
     * Handles URL changes in standard environments.
     */
    static async onUrlChangeStandard(currentLocation) {

        if(window.location.pathname.match(/\w+\.\w+/g) || window.location.pathname.trim() === ""){
            window.history.pushState({}, "", this.pagesRef.root || "/index");
            window.dispatchEvent(new Event("popstate"))
            return;
        }

        try {
            this.debug("info", `URL changed: ${window.location.pathname}`);
            this.location = currentLocation || window.location.pathname;
            this.currentRoute = this.findRoute(route => route.match(this.location));
            this.loadingRoute = this.findRoute(route => route.match(this.pagesRef.load || "/load-spa"));
            this.errorRoute = this.findRoute(route => route.match(this.pagesRef.error || "/err-spa"));

            if (this.loadingRoute) this.appShell.render(this.loadingRoute);

            for (const middleware of this.middlewares) {
                const result = await middleware(this.currentRoute);
                if (result !== true) {
                        this.debug("warn", `Middleware blocked route: ${result}`);
                    return;
                }
            }

            if (this.currentRoute) {
                await this.executeLifeCycle("onCurrentRouteFound");
                    setTimeout(() => this.appShell.render(this.currentRoute), this.loadTime);
            } else if(this.errorRoute){
                this.debug( "warn", `No route found for: ${this.location}`);
                    setTimeout(() => this.appShell.render(this.errorRoute), this.loadTime);
            } else {
                this.debug( "warn", `No route found for: ${this.location}, And No Error route found have been provided`);
            }
        } catch (error) {
            this.debug( "error", `Error during URL change handling: ${error.message}`);
        }
    }

    /** @type {Proxy} Lifecycle hooks for the router. */
    static lifeCycle = new Proxy(
        {
            onUrlChange: {},
            onLoading: {},
            onError: {},
            onCurrentRouteFound: {},

            extendLifeCycle(prop) {
                if (!this[prop]) {
                    this[prop] = {};
                } else {
                    throw new Error(`Unauthorized override of lifeCycle: "${prop}", requires core code modification`);
                }
            },
        },
        {
            get: (target, prop) => {
                if (prop in target) {
                    return target[prop];
                } else {
                    this.debug("warn", `LifeCycle property "${prop}" not found, using default setting behavior`);
                    return target[prop];
                }
            },
            set: (target, prop, value) => {
                if (!target[prop]) {
                    target[prop] = value;
                    return true;
                } else {
                    throw new Error(`Cycle "${prop}" already exists. Core code modification required.`);
                }
            },
        }
    );

    /**
     * Executes a lifecycle method by name.
     * @param {string} cycleName - The name of the lifecycle to execute.
     * @returns {Promise<boolean>} Whether the lifecycle executed successfully.
     */
    static async executeLifeCycle(cycleName) {
        let cycle = this.lifeCycle[cycleName];

        if (cycle) {
            for (let key in cycle) {
                if (await cycle[key](this.args) === false) {
                    this.debug( "warn", `LifeCycle "${cycleName}" failed at "${key}"`);
                    return false;
                }
            }
        }
        if (!cycle) {
            this.debug( "warn", `Lifecycle "${cycleName}" is not defined.`);
            return false;
        }
    }

    /** @type {Object} Arguments accessible in lifecycle methods. */
    static args = {
        currentRoute: () => this.currentRoute,
        loadingRoute: () => this.loadingRoute,
        location: () => this.location,
        debug: () => this.debug,
        errorRoute: () => this.errorRoute,
        findRoute: predicate => this.findRoute(predicate),
        RouteUrlParam: () => this.currentRoute.urlParam.paramExtractor(this.location),
    };

    /**
     * Registers a method or lifecycle for the router.
     * @param {Object} param - Configuration for the method or lifecycle.
     * @param {string} param.name - The name of the method/lifecycle.
     * @param {string} [param.at] - The lifecycle phase to attach to.
     * @param {Function} param.fn - The function to execute.
     */
    static use({ name, at, fn }) {
        let props = this.useArgs;

        if (at) {
            this.registerLifeCycle(at, name, fn, props);
        } else {
            this.registerMethod(name, fn, props);
        }
    }

    /**
     * Registers a lifecycle method.
     * @param {string} at - The lifecycle phase to attach to.
     * @param {string} name - The name of the lifecycle.
     * @param {Function} fn - The function to execute.
     * @param {Object} props - Arguments for the lifecycle method.
     */
    static async registerLifeCycle(at, name, fn, props) {
        async function updatelifeCycle() {
            await new Promise((resolve, reject) => {
                let findAt = setInterval(() => {
                    if (this.LifeCycle[at]) {
                        this.LifeCycle[at][name] = fn(props);
                        resolve(true);
                        clearInterval(findAt);
                    }
                }, 100);
            });
        }

        const cycle = await updatelifeCycle();

        if (cycle) {
            this.debug( "info", `LifeCycle "${name}" registered at "${at}"`);
        }
    }

    /** @type {Object} Registered custom methods. */
    static registeredMethods = {};

    /**
     * Registers a custom method.
     * @param {string} name - The name of the method.
     * @param {Function} fn - The function to execute.
     * @param {Object} props - Arguments for the method.
     */
    static registerMethod(name, fn, props) {
        this.registeredMethods[name] = fn(props);
    }
}

/**
 * @param { String } key - The route's name example `/home`
 * @param { String } path - The route's fetch url 
 * @param { Array  } children - Nested Route
 * @param { Object } props - Route's props
 * @param { Object } [headers=null] - Optional, header used for route fetching
 * @param { String } [method=null] - Optional, method used for route fetching
 * @param { Object } [body=null] - Optional, body used for route fetching
 * 
 * */
class _Fo_AppRoute {

    debug = _Fa_DebugHelper.debugReference("_Fo_AppRoute")

    constructor({ key, path, children, props, headers = null, method = null, body = null }) {
        this.key = key;
        this.path = path;
        this.headers = headers;
        this.props = props;
        this.method = method;
        this.body = body;
        this.children = children || [];
        this.urlParam = new _Fo_AppRoute_UrlParameter({ pattern: key })
    }

    async render() {
        this.debug("info", `route ${this.key} requested`);

        if (this.component) return this.component;

        const { data, error } = await this.fetch();

        if (error) {
            this.debug( "error", `Error fetching route "${this.key}"`)
            return null;
        } else {
            let component = document.createElement("div");
            component.setAttribute(_Fo_Component.keyword["component"],"")
            component.innerHTML = data;
            component.props = { ...this.props }


            let checkReadinessAt = 0;

            let Observer = new MutationObserver(()=> checkReadinessAt += 50);
                Observer.observe(component, {
                    childList: true,
                    subtree: true,
                })

            new _Fo_Component({ node: component });

            while (checkReadinessAt != 0) {
                await new Promise(resolve => setTimeout(()=>{
                    if(checkReadinessAt === 0) resolve
                    else checkReadinessAt -= 50
                }, 50))
            }

            Observer.disconnect();

            this.component = component;
            return this.component
        }
    }

    cloneWithListeners(element) {
        const clone = element.cloneNode(true);
        
        // Get all listeners and attach them to the clone
        const listeners = getEventListeners(element); // You may need a custom implementation for this
        for (let type in listeners) {
          listeners[type].forEach(listener => {
            clone.addEventListener(type, listener.listener, listener.useCapture);
          });
        }
        
        return clone;
      }
      

    match(currentUrl) {
        return this.urlParam.match(currentUrl)
    }

    async fetch() {
        try {
            const response = await fetch(this.path, {
                method: this.method || 'GET',
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return { data: await response.text(), error: null }
        } catch (error) {
            console.error(`Error fetching route "${this.key}":`, error);
            return { data: null, error };
        }
    }
}


class _Fo_AppRoute_UrlParameter {

    debug = _Fa_DebugHelper.debugReference("_Fo_AppRoute_UrlParameter")

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

    match(Url) {
        // Remove trailing slashes from Url and routeRegex for consistency
        let url = Url.replace(/\/$/, '').split('/');
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

    paramExtractor(Url) {
        if (this.match(Url)) {
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


/*<=========================================================== ForeverAlone Component ============================================================>>*/


/**
 * Represents a stand-alone component that parses, builds, and manages child nodes.
 */
class _Fo_Component {

    /**
     * @type {Object} Debug reference for logging.
     */
    debug = _Fa_DebugHelper.debugReference("_Fo_Component");

    /**
     * Creates an instance of _Fo_Component.
     * @param {Object} config - Configuration object.
     * @param {HTMLElement} config.node - The DOM node associated with this component.
     * @param {Object} config.options - Configuration options for the component.
     * @throws Will throw an error if no children are found in the node.
     */
    constructor({ node, options }) {
        this.node = node;
        this.options = options;

        if (this.node?.isFoComponent) return;
        this.node.isFoComponent = true;

        // _Fo_AppRoute.signalComponentBuilding(true)

        this.configureComponent();

        const childrenTag = _Fa_getTag({ node: this.node, tagname: "children" });
        if (childrenTag != null) {
             this.debug("info","_Fo_Component configured, initializing parsing and placeholder interpretation.");
            this.children = childrenTag;
            this.parseComponent();
            this.buildComponent();

            // _Fo_AppRoute.signalComponentBuilding(false)
            this.node.querySelector("getComponent") && this.HandleGetComponentTag();
        } else {
            // _Fo_AppRoute.signalComponentBuilding(false)
            throw new Error(`No children detected on data-stand-alone-component ${node}`);
        }
    }

    /**
     * Keywords for identifying components and event handlers.
     * @static
     * @type {Object}
     */
    static keyword = {
        "component": "stand-alone",
        "event-handler": "lone-event",
    };

    /**
     * Parses the component by processing its HTML and placeholders.
     */
    parseComponent() {
        this.parseToCommonHTML();
        this.parseComponentPlaceholder();
    }

    /**
     * Parses placeholders within the component using depth-first search (DFS).
     * @param {HTMLElement} [node=this.node] - Node to start parsing from.
     */
    parseComponentPlaceholder(node = this.node) {
        this.debug("info", `==> Begin parsing by DFS on _Fo_Component ${this.node.nodeName}`);
        _Fa_DFSHelper({
            node,
            predicates: [
                (stack, current) => {
                    if (current?.getAttribute) {
                        this.debug("debug", `==> Parsing by DFS, current node ${current.nodeName}`);
                        current.innerHTML = new _Fo_Component_PlaceholderParser({
                            nodeOrigin: this.node,
                            node: current,
                            content: current.innerHTML
                        });

                        this.debug("debug", `==> Parsing by DFS, current result ${this.node.innerHTML}`);                    }
                },
                (stack, current) => {
                    if (current?.childNodes?.length > 0) {
                        if (!current.hasAttribute(_Fo_Component.keyword["component"]) || current === this.node) {
                            return [...current.childNodes];
                        }
                    }
                },
            ],
        });

        this.debug("info", `==> Parsing by DFS ended on _Fo_Component ${this.node.nodeName}`);    }

    /**
     * Builds the component by setting up event listeners and a mutation observer.
     */
    buildComponent() {
        this.traverseAndSetPseudoEvent();

        this.debug("info", `Binding MutationObserver on ${this.node.nodeName}`);
        this.node.addEventListener(
            "node-builded",
            () => {
                const observer = new MutationObserver(() => {
                    this.debug("info", `Mutation detected in _Fo_Component ${this.node.nodeName}, re-executing traverseAndSetPseudoEvent.`);
                    this.traverseAndSetPseudoEvent(this.childNodes);
                });

                observer.observe(this.node, {
                    childList: true,
                    subtree: true,
                });
            },
            { once: true }
        );

        this.node.dispatchEvent(new CustomEvent("node-builded"));
    }

    /**
     * Converts the component's children into a standard HTML structure.
     */
    parseToCommonHTML() {
        this.debug("info", `Parsing _Fo_Component ${this.node.nodeName} to Common HTML`);
        const childCopy = this.children.cloneNode(true);
        const childNodes = Array.from(childCopy.childNodes);

        this.node.innerHTML = "";
        childNodes.forEach((child) => this.node.appendChild(child));

        this.debug("success", `Parsing _Fo_Component ${this.node.nodeName} to Common HTML completed`);    }

    /**
     * Traverses and sets up pseudo-events for child nodes using DFS.
     * @param {HTMLElement} [node=this.node] - Node to start traversal from.
     */
    traverseAndSetPseudoEvent(node = this.node) {
        if (!node) return;

        this.debug("info", `==> Begin Event Binding & Ignition of _Fo_Component Children by DFS`);
        _Fa_DFSHelper({
            node,
            predicates: [
                (stack, current) => {
                    if (current?.getAttribute) {
                        _Fa_DebugHelper.debugLogs({
                            ref: this.debug,
                            type: "debug",
                            message: `Trying to set pseudo-event on node ${current.nodeName}`,
                        });

                        if (!current.useAncestorMethod) {
                            current.parentComponentRef = this.node;
                            current.useAncestorEventMethod = _Fa_ParentChildRelationshipHelper_useAncestorEventMethod;
                            current.useAncestorMethod = _Fa_ParentChildRelationshipHelper_useAncestorMethod;
                            current.useAncestorProp = _Fa_ParentChildRelationshipHelper_useAncestorProp;
                        }

                        this.setPseudoEvent(current);
                    }
                },
                (stack, current) => {
                    if (current?.childNodes?.length > 0) {
                        if (!current.hasAttribute(_Fo_Component.keyword["component"]) || current === this.node) {
                            return [...current.childNodes];
                        } else {
                            setTimeout(() => {
                                new _Fo_Component({ node: current, options: this.options });
                            }, 500);
                        }
                    }
                },
            ],
        });

        this.debug("success", `==> Event Binding & Ignition of _Fo_Component Children by DFS completed`);    }

    /**
     * Sets pseudo-events for a given node based on its attributes.
     * @param {HTMLElement} node - The node to set pseudo-events on.
     * @param {HTMLElement} [nodeParent=this.node] - Parent node for event relationships.
     */
    setPseudoEvent(node, nodeParent = this.node) {
        const eventAttribute = node?.getAttribute(_Fo_Component.keyword["event-handler"]);
        if (!eventAttribute) return;

        if (!nodeParent["loneEvents"]) {
            nodeParent["loneEvents"] = {};
            nodeParent["loneEventsListened"] = [];
        }

        _Fa_DebugHelper.debugLogs({
            ref: this.debug,
            type: "info",
            message: `=> Valid event props detected, setting events on node ${node.nodeName}`,
        });

        eventAttribute.split(";").forEach((eventPair) => {
            const [eventType, handlerFunc] = eventPair.split(":");
            if (!eventType || !handlerFunc) {
                _Fa_DebugHelper.debugLogs({
                    ref: this.debug,
                    type: "error",
                    message: `=> Invalid event format for node: ${node.nodeName}. Expected format: "event:handlerName", given: ${eventPair}`,
                });
                return;
            }

            // Ensure the event handlers object exists
            if (!nodeParent["loneEvents"][eventType]) {
                nodeParent["loneEvents"][eventType] = [];
            }

            // Register the handler
            const handler = function (event) {
                if (typeof nodeParent.eventMethods[handlerFunc.toLowerCase()] === "function") {
                    nodeParent.eventMethods[handlerFunc.toLowerCase()].call(this, event);
                } else {
                    console.error(`Handler function '${handlerFunc}' not found on node`, node);
                }
            };

            nodeParent["loneEvents"][eventType].push({ node, handler });

            let nonBubbling = [
                "mouseenter",
                "mouseleave",
                "focus",
                "blur",
                "dragenter",
                "dragleave"
            ];

            // Special case for non-bubbling events
            if (nonBubbling.includes(eventType)) {
                node.addEventListener(eventType, (event) => {
                    handler.call(node, event); // Ensure `this` refers to the node
                });
            } else {
                // Add a global listener for bubbling events
                if (!nodeParent["loneEventsListened"].includes(eventType)) {
                    nodeParent["loneEventsListened"].push(eventType);

                    nodeParent.addEventListener(eventType, (event) => {
                        const handlers = nodeParent["loneEvents"][eventType];
                        if (!handlers) return;

                        handlers.forEach(({ node: targetNode, handler }) => {
                            if (event.target === targetNode) {
                                handler.call(event.target, event);
                            }
                        });
                    });
                }
            }
        });

        // Remove processed attribute to avoid duplicate processing
        node.removeAttribute(_Fo_Component.keyword["event-handler"]);
    }



    /**
     * Makes an HTTP request and returns the response as text.
     * @param {Object} params - Configuration object for the HTTP request.
     * @param {string} params.url - The URL to fetch data from.
     * @param {Object} [params.header] - Optional headers to include in the request.
     * @param {string} [params.method="GET"] - The HTTP method to use (e.g., "GET", "POST").
     * @returns {Promise<string>} The response text from the HTTP request.
     */
    async selfHttpHelper({ url, header, method = "GET" }) {
        let response = await fetch(url, { method, headers: header });
        return response.text();
    }

    /**
     * Processes <getComponent> tags in the DOM and replaces them with fetched components.
     * Uses an iterative depth-first search (DFS) to traverse the DOM.
     * 
     * Logs the progress, success, and errors using the _Fa_DebugHelper.debugLogs method.
     * 
     * @returns {Promise<void>} Resolves when all <getComponent> tags are processed.
     */
    async HandleGetComponentTag() {
        const queue = [this.node]; // Start from the root node

        // _Fo_AppRoute.signalComponentBuilding(true)

        _Fa_DebugHelper.debugLogs({
            ref: this.debug,
            type: "log",
            message: `=> Start of HandleGetComponentTag() with queue: ${queue}`,
        });

        while (queue.length > 0) {
            const current = queue.shift();

            if (current?.nodeName?.match(/getComponent/i)) {
                const src = current.getAttribute("src");
                _Fa_DebugHelper.debugLogs({
                    ref: this.debug,
                    type: "log",
                    message: `<getComponent ...> detected, trying to fetch component, at source "${src}"`,
                });

                try {
                    const component = await this.selfHttpHelper({ url: src });
                    const fragment = document.createElement("div");
                    fragment.innerHTML = component;

                    _Fa_DebugHelper.debugLogs({
                        ref: this.debug,
                        type: "log",
                        message: `fetch success, replacing <getComponent> with: \n"${component}"`,
                    });

                    while (fragment.firstChild) {
                        current.parentNode.insertBefore(fragment.firstChild, current);
                    }
                    current.parentNode.removeChild(current);

                    Array.from(fragment.childNodes).forEach((child) => queue.push(child));
                } catch (error) {
                    _Fa_DebugHelper.debugLogs({
                        ref: this.debug,
                        type: "error",
                        message: `Failed to load component for node: ${current}. Error: ${error.message}`,
                    });

                    const commentNode = document.createComment(`failed to get component at src "${src}"`);
                    current.parentNode.replaceChild(commentNode, current);
                }
            }

            if (current?.childNodes?.length > 0) {
                Array.from(current.childNodes).forEach((child) => queue.push(child));
            }

            _Fa_DebugHelper.debugLogs({
                ref: this.debug,
                type: "log",
                message: `processed node: ${current.nodeName} with children: ${current.childNodes.length}`,
            });

            _Fa_DebugHelper.debugLogs({
                ref: this.debug,
                type: "log",
                message: `queue length: ${queue.length}`,
            });
        }

        // _Fo_AppRoute.signalComponentBuilding(false)
    }

    /**
     * Configures the component associated with the root node.
     * This method initializes a new _Fo_Component_Config instance for the current node.
     */
    configureComponent() {
        new _Fo_Component_Config({ node: this.node });
    }
}

class _Fo_Component_Config {

    debug = _Fa_DebugHelper.debugReference("_Fo_Component_Config");

    /**
     * Constructor for initializing the component configuration.
     * @param {Object} param - The input parameters.
     * @param {HTMLElement} param.node - The DOM node representing the component.
     * @param {Object} param.options - Additional options (currently unused).
     */
    constructor({ node, options }) {
        // Register a debug reference for this class instance
        _Fa_DebugHelper.debugLogs({
            ref: this.debug,
            type: "info",
            message: "Initializing _Fo_Component_Config...",
        });

        this.node = node;

        // Initialize component properties
        this.getProperty();
        this.setProperty();

        _Fa_DebugHelper.debugLogs({
            ref: this.debug,
            type: "success",
            message: "Initialization completed for _Fo_Component_Config.",
        });
    }

    /**
     * Retrieve the first element with the specified tag name within the node.
     * @param {string} tagname - The tag name to search for.
     * @returns {HTMLElement|null} - The found element or null if not found.
     */
    getTag(tagname) {
        const result = this.node.querySelector(tagname);
        this.debug("warn", `getTag called for tagname: ${tagname}, result: ${result ? "found" : "not found"}.`);        return result || null;
    }

    // Static component property names
    static componentProperty = ["props", "methods", "eventMethods"];

    // Instance-specific component properties
    componentProperty = _Fo_Component_Config.componentProperty;

    /**
     * Retrieves attributes for each component property and stores them in the instance.
     */
    getProperty() {
        this.debug("debug", `Fetching component properties...`);
        this.componentProperty.forEach((property) => {
            const tag = _Fa_getTag({ node: this.node, tagname: property });
            const value = tag?.getAttributeNames() || [];
            this[`${property}Names`] = value;
            this.node[property] = {};

            this.debug("debug", `Property: ${property}, Attributes: ${JSON.stringify(value)}.`);        });
    }

    /**
     * Assigns parsed property values to the node's property object.
     */
    setProperty() {
        this.debug("debug", `Setting component properties...`);
        this.componentProperty.forEach((property) => {
            this[`${property}Names`].forEach((propName) => {
                const tag = _Fa_getTag({ node: this.node, tagname: property });
                const value = tag?.getAttribute(propName);
                this.node[property][propName] = this.parseProperty(value);

                this.debug("debug", `Set property: ${propName}, Value: ${value}.`);            });
        });
    }

    /**
     * Parses a property value from string format.
     * @param {string} property - The property value to parse.
     * @returns {any} - The parsed property value.
     */
    parseProperty(property) {
        if (!property) return;

        const props = property.trim();
        const isJSON = props.match(/^{.*}$/) ? true : false;
        const isArrowFunc = props.match(/^\s*(.*?)\s*=>\s*\{([\s\S]*?)\}\s*$/) ? true : false;
        const isArrayString = props.match(/^\[.*\]$/) ? true : false; // Check if it's a string representation of an array

        _Fa_DebugHelper.debugLogs({
            ref: this.debug,
            type: "debug",
            message: `Parsing property: ${property}, Detected format: ${isJSON ? "JSON" : isArrowFunc ? "Arrow Function" : isArrayString ? "Array String" : "Unknown"}.` // Log the detected format
        });

        if (isJSON) {
            try {
                return JSON.parse(props); // Parse as JSON
            } catch (e) {
                this.debug("error", `JSON parsing failed for property: ${property}, error: ${e}.`);                return null;
            }
        } else if (isArrowFunc) {
            try {
                return new Function("props", `return (${props})(props);`);
            } catch (e) {
                this.debug("error", `Arrow function execution failed for property: ${property}, error: ${e}.`);                return null;
            }
        } else if (isArrayString) {
            try {
                return JSON.parse(props); // Parse the array string into an actual array
            } catch (e) {
                this.debug("error", `Array string parsing failed for property: ${property}, error: ${e}.`);                return null;
            }
        }

        this.debug("error", `Invalid property format detected for: ${property}.`);
        return null;
    }

}

class _Fo_Component_LifecycleInterpreter {
    debug = _Fa_DebugHelper.debugReference("_Fo_Component_LifecycleInterpreter");

    constructor({ node }) {
        this.debug("info", `Initializing Lifecycle Interpreter for component: ${node.componentName}.`)

        this.node = node;

        this.debug("info",`Lifecycle Interpreter initialized for component: ${node.componentName}, with lifecycle: ${node.lifecycle}.`)
    }

    lifeCycle = [
        "onMount",
        "onUpdate",
    ]

    getLifecycleTagInfo() {
    }

}

/**
 * Helper function to search and bind a method from the ancestor component.
 * 
 * This function traverses the component hierarchy, starting from the current component's parent,
 * to find a method specified by its name. If the method is found, it is returned and bound to the 
 * given context. If the method is not found, `null` is returned.
 *
 * @param {Object} params - The parameters for the function.
 * @param {string} params.method - The name of the method to search for.
 * @param {number} [params.skipMatch=0] - The number of matches to skip before binding the method.
 * @param {Object|null} [params.context=null] - The context to bind the method to.
 * 
 * @returns {Function|null} - The bound method if found, or `null` if the method is not found.
 */
const _Fa_ParentChildRelationshipHelper_useAncestorMethod = function ({ method, skipMatch = 0, context = null }) {
    const debug = _Fa_DebugHelper.debugReference("_Fa_ParentChildRelationshipHelper_useAncestorMethod");

    // Helper for debug logs
    const logDebug = (type, message, result) => {
        _Fa_DebugHelper.debugLogs({
            ref: debug,
            type: type,
            message: `Html Element requests access to its _Fo_Component ancestor's method: ${method}, \ncontext: ${context ? 'element' : 'parent'} \nresult: ${result}`
        });
    };

    logDebug("log", `Searching for method '${method}'`, "initiated");

    let current = this?.parentComponentRef;

    while (current) {
        console.log('current node explored: ', current);

        if (current?.methods[method.toLowerCase()]) {
            if (skipMatch === 0) {
                logDebug("log", `Found method '${method}'`, "success");
                return current.methods[method.toLowerCase()].bind(context || current);
            }
            skipMatch--;
        }
        current = current?.parentComponentRef;
    }

    logDebug("error", `Method '${method}' not found`, "failed");
    return null;
};

/**
 * Helper function to search and bind a property from the ancestor component.
 * 
 * This function traverses the component hierarchy, starting from the current component's parent,
 * to find a property specified by its name. If the property is found, it is returned and bound 
 * to the given context. If the property is not found, `null` is returned.
 *
 * @param {Object} params - The parameters for the function.
 * @param {string} params.prop - The name of the property to search for.
 * @param {number} [params.skipMatch=0] - The number of matches to skip before binding the property.
 * @param {Object|null} [params.context=null] - The context to bind the property to.
 * 
 * @returns {any|null} - The bound property if found, or `null` if the property is not found.
 */
const _Fa_ParentChildRelationshipHelper_useAncestorProp = function ({ prop, skipMatch = 0, context = null }) {
    const debug = _Fa_DebugHelper.debugReference("_Fa_ParentChildRelationshipHelper_useAncestorProp");

    // Helper for debug logs
    const logDebug = (type, message, result) => {
        _Fa_DebugHelper.debugLogs({
            ref: debug,
            type: type,
            message: `Html Element requests access to its _Fo_Component ancestor's property: ${prop}`
        });
    };

    logDebug("log", `Searching for property '${prop}'`, "initiated");

    let current = this?.parentComponentRef;

    while (current) {
        console.log("current node explored:", current);

        if (current?.props[prop.toLowerCase()]) {
            if (skipMatch === 0) {
                logDebug("log", `Found property '${prop}'`, "success");
                return typeof current.props[prop.toLowerCase()] == "object"
                    ? current.props[prop.toLowerCase()]
                    : current.props[prop.toLowerCase()].bind(context || current);
            }
            skipMatch--;
        }
        current = current?.parentComponentRef;
    }

    logDebug("error", `Method '${prop}' not found`, "failed");
    return null;
};

/**
 * Helper function to search and bind an event method from the ancestor component.
 * 
 * This function traverses the component hierarchy, starting from the current component's parent,
 * to find an event method specified by its name. If the event method is found, it is returned 
 * and bound to the given context. If the event method is not found, `null` is returned.
 *
 * @param {Object} params - The parameters for the function.
 * @param {string} params.eventMethod - The name of the event method to search for.
 * @param {number} [params.skipMatch=0] - The number of matches to skip before binding the event method.
 * @param {Object|null} [params.context=null] - The context to bind the event method to.
 * 
 * @returns {Function|null} - The bound event method if found, or `null` if the event method is not found.
 */
const _Fa_ParentChildRelationshipHelper_useAncestorEventMethod = function ({ eventMethod, skipMatch = 0, context = null }) {
    const debug = _Fa_DebugHelper.debugReference("_Fa_ParentChildRelationshipHelper_useAncestorEventMethod");

    // Helper for debug logs
    const logDebug = (type, message, result) => {
        _Fa_DebugHelper.debugLogs({
            ref: debug,
            type: type,
            message: `Html Element requests access to its _Fo_Component ancestor's eventMethod: ${eventMethod}`
        });
    };

    logDebug("log", `Searching for eventMethod '${eventMethod}'`, "initiated");

    let current = this?.parentComponentRef;

    while (current) {
        console.log("current node explored:", current);
        if (current?.eventMethods[eventMethod.toLowerCase()]) {
            if (skipMatch === 0) {
                logDebug("log", `Found eventMethod '${eventMethod}'`, "success");
                return current.eventMethods[eventMethod.toLowerCase()].bind(context || current);
            }
            skipMatch--;
        }
        current = current?.parentComponentRef;
    }

    logDebug("error", `eventMethod '${eventMethod}' not found`, "failed");
    return null;
};



/**
 * Class responsible for parsing and replacing placeholders in a given HTML content.
 * It handles dynamic placeholder replacements, interprets expressions within `{{ }}`,
 * and parses HTML structure while preserving tag integrity.
 * 
 * @class _Fo_Component_PlaceholderParser
 */
class _Fo_Component_PlaceholderParser {

    debug = _Fa_DebugHelper.debugReference("_Fo_Component_PlaceholderParser")

    /**
     * Creates an instance of the PlaceholderParser.
     * 
     * @param {Object} params - The parameters for the constructor.
     * @param {HTMLElement} params.nodeOrigin - The original node used as the context for placeholder replacements.
     * @param {HTMLElement} params.node - The current node being processed.
     * @param {string} params.content - The content string that may contain placeholders.
     */
    constructor({ nodeOrigin, node, content }) {
        this.node = node;

        /**
         * Function to replace placeholders within content.
         * 
         * @param {string} content - The content string that may contain placeholders.
         * @returns {string} - The content with placeholders replaced by their evaluated values.
         */
        this.interpreter = (content) => {
            return new _Fo_Component_PlaceholderReplacer({ node: nodeOrigin, content: content }).replacePlaceHolder();
        }

        _Fa_DebugHelper.debugLogs({
            ref: this.debug,
            type: "log",
            message: `==> _Fo_Component_PlaceholderParser called for ${node} with content ${content}`,
        });

        // Parse and replace placeholders
        let result = new String(this.placeholderParser(content));

        _Fa_DebugHelper.debugLogs({
            ref: this.debug,
            type: "log",
            message: `==> _Fo_Component_PlaceholderParser call result:\n ${result}\n\nresult type:${typeof result}`,
        });

        return result;
    }

    /**
     * Parses the given content and replaces placeholders with their evaluated values.
     * It handles the splitting of content by HTML tags and processes placeholders outside of tags.
     * 
     * @param {string} value - The content string containing placeholders.
     * @returns {string} - The content with placeholders replaced.
     */
    placeholderParser(value) {
        if (value.trim === "") {
            this.debug("log",`==> _Fo_Component_PlaceholderParser placeholderParser called with empty value`)
            return value;
        }

        // Split the content at HTML tags while excluding placeholders inside {{ }}
        const regex = /<\/?\w+[^>]*>(?=(?:(?!(?:{{[^}]*}}))<\/?\w+[^>]*>)*$)/g;
        const parts = value.split(regex);

        this.debug("log", `==> _Fo_Component_PlaceholderParser placeholderParser called with splitted value ${parts} }`);
        const stack = [];
        const output = [];

        // Process each split part (either HTML or placeholder)
        for (let part of parts) {
            const trimmedPart = part.trim();

            if (/^<\w+[^>]*>$/.test(trimmedPart)) {
                // Opening tag
                stack.push(trimmedPart);
                const processedTag =
                    stack.length === 1
                        ? trimmedPart.replace(/(="")|(='')/g, "").replace(/(\{\{\s*(.*?)\s*\}\})/g, (match, code) => {
                            let result = this.interpreter(code.trim());
                            this.debug("log", `==> _Fo_Component_PlaceholderParser placeholderParser called with code ${code}\nresult: ${result}`);                            return result;
                        })
                        : trimmedPart;

                output.push(String(processedTag));

                if (this.isSelfClosing(trimmedPart)) {
                    stack.pop();
                }
            } else if (/^<\/\w+>$/.test(trimmedPart)) {
                // Closing tag
                stack.pop();
                output.push(String(trimmedPart));
            } else if (/\{\{.*?\}\}/.test(trimmedPart) && stack.length === 0) {
                // Placeholder outside of tags
                output.push(String(trimmedPart.replace(/(\{\{\s*.*?\s*\}\})/g, (match, code) => {
                    let result = this.interpreter(code.trim());
                    this.debug("log", `==> _Fo_Component_PlaceholderParser placeholderParser called with code ${code}\nresult: ${result}`);                    return result;
                })));
            } else if (trimmedPart.length > 0) {
                // Plain text
                output.push(String(trimmedPart));
            }
        }

        // Log and return final processed output
        const finalOutput = output.join("");
        this.debug("debug", `Final Processed Output: ${finalOutput}`);
        return finalOutput;
    }

    /**
     * Determines whether the provided tag is self-closing.
     * 
     * @param {string} tag - The HTML tag to be checked.
     * @returns {boolean} - Returns `true` if the tag is self-closing, otherwise `false`.
     */
    isSelfClosing(tag) {
        // Matches generic self-closing tags or specific known ones
        const selfClosingRegex = /<\w+[^>]*\/>/; // Generic self-closing tags (e.g., <tag attr="value" />)
        const knownSelfClosingTags = /<\s*(img|br|hr|input|meta|link|area|base|col|embed|source|track|wbr|getComponent)\b[^>]*>/i;

        // Matches either generic or known self-closing tags
        return selfClosingRegex.test(tag) || knownSelfClosingTags.test(tag);
    }
}

/**
 * Class representing a placeholder replacer for a given node content.
 * It is designed to replace placeholders in content based on dynamic expressions.
 * It supports conditional expressions, method invocations, and data iteration for rendering content dynamically.
 */
class _Fo_Component_PlaceholderReplacer {
    /**
     * Initializes an instance of the PlaceholderReplacer.
     * 
     * @param {Object} params - The parameters for the constructor.
     * @param {Object} params.node - The node containing the content and methods to evaluate.
     * @param {string} params.content - The content with placeholders to replace.
     */
    debug = _Fa_DebugHelper.debugReference("_Fo_Component_PlaceholderReplacer");

    constructor({ node, content }) {
        this.node = node;
        this.content = content;
    }

    /**
     * Replaces placeholders in the content with their evaluated values.
     * 
     * This method processes placeholders like `{{ expression }}`, where the expression can be:
     * 1. Conditional expressions (`{{ value ? this : that }}`)
     * 2. Default value expressions (`{{ value || "default" }}`)
     * 3. Method invocations (`{{ method() }}`)
     * 4. Iteration expressions (`{{ forDataIn(value, '<li>...value.test</li>') }}`)
     * 
     * @returns {string} - The content with replaced placeholders.
     */
    replacePlaceHolder() {
        if (!this.content || typeof this.content !== "string") return this.content;

        this.debug("debug", `Replacing placeholder in ${this.node.nodeName} with content: ${this.content}`);
        return this.content.replace(/{{\s*(.*?)\s*}}/g, (match, expression) => {
            try {
                if (expression.includes("||")) {
                    // Case 1: Handle `{{ value || "default" }}`
                    const [value, defaultValue] = expression.split("||").map((s) => s.trim());
                    return this.evaluateExpression(value) || this.evaluateExpression(defaultValue);
                }
                else if (expression.includes("?")) {
                    // Case 2: Handle `{{ value ? this : that }}`
                    const [condition, options] = expression.split("?").map((s) => s.trim());
                    const [ifTrue, ifFalse] = options.split(":").map((s) => s.trim());
                    return this.evaluateExpression(condition) ? this.evaluateExpression(ifTrue) : this.evaluateExpression(ifFalse);
                }
                else if (expression.includes("(") && expression.includes(")") && !expression.trim().startsWith("forDataIn(")) {
                    // Case 3: Handle `{{ method() }}`
                    const methodMatch = expression.match(/(\w+)\((.*?)\)/);
                    if (methodMatch) {
                        const [_, methodName, args] = methodMatch;
                        const method = this.node.methods[methodName.toLowerCase()];

                        this.debug("debug", `Invoking method ${methodName} with args: ${args.trim() === '' ? '(no argument passed)' : args}`);
                        if (typeof method === "function") {
                            const evaluatedArgs = args.split(",").map((arg) => this.evaluateExpression(arg.trim()));
                            return evaluatedArgs?.length > 0 ? method() : method(...evaluatedArgs);
                        }
                    }
                    throw new Error(`Method ${expression} is not defined or is not a function.`);
                }
                else if (expression.startsWith("forDataIn(")) {
                    // Case 4: Handle `{{ forDataIn(value, '<li>...value.test</li>') }}`
                    const match = expression.trim().match(/forDataIn\((.+?),\s*['"`](.+?)['"`]\)/);
                    if (match) {
                        const [_, dataKey, template] = match;
                        const data = this.evaluateExpression(dataKey);

                        this.debug("debug", `Invoking forDataIn with data: ${data} and template: ${template}`);
                        if (Array.isArray(data)) {
                            return data.map((item) => template.replace(/value\.(\w+)/g, (_, key) => item[key] || "")).join("");
                        }
                    }
                    throw new Error(`Invalid forDataIn expression: ${expression}`);
                }
                // Default case: Fallback if no known placeholder structure
                return this.evaluateExpression(expression);
            } catch (err) {
                this.debug("error",`Error evaluating placeholder "${expression}": ${err.message}`);
                return "";
            }
        });
    }

    /**
     * Evaluates a given expression in the context of the node's properties.
     * 
     * This method supports evaluating simple expressions by using `Function` to execute the expression dynamically.
     * It can handle properties defined in `node.props`.
     * 
     * @param {string} expression - The expression to evaluate.
     * @returns {*} - The evaluated result or null if the expression cannot be evaluated.
     */
    evaluateExpression(expression) {
        try {
            // Evaluate simple expressions (e.g., value from props or constants)
            const func = new Function("props", `with (props) { return ${expression}; }`);
            return func(this.node.props);
        } catch (err) {
            this.debug( "warn", `Error evaluating expression "${expression}" : ${err.message}` );
            return null;
        }
    }
}

/**
 * Retrieves a child element of the given `node` matching the specified `tagname`.
 * Logs the result of the search to the debug logs.
 *
 * @param {Object} params - The parameters for the function.
 * @param {Element} params.node - The parent node to search within.
 * @param {string} params.tagname - The tag name to search for.
 * 
 * @returns {Element|null} - Returns the found element if exists, otherwise null.
 */
const _Fa_getTag = ({ node, tagname }) => {
    let debug = _Fa_DebugHelper.debugReference("_Fa_getTag");

    let condition = (node && node.querySelector(tagname)) ? true : false;

    debug(`${condition == true ? "log" : "warn"}`, `helper func _Fa_getTag called for node "${node.nodeName}", child to find "${tagname}" \nresult: ${condition == true ? "found" : "not found"}`);
    
    return (condition == true)
        ? node.querySelector(tagname)
        : null;
};


/**
 * Performs a depth-first search (DFS) on a node or an array of nodes,
 * applying the provided predicates to each node.
 * If a predicate returns an array, the elements of that array are added to the stack for further processing.
 * 
 * @param {Object} params - The parameters for the function.
 * @param {Element|Array} params.node - The node or array of nodes to start the DFS from.
 * @param {Array<Function>} params.predicates - An array of predicate functions to apply to each node.
 * 
 * @example
 * // Example usage
 * _Fa_DFSHelper({
 *     node: document.body,
 *     predicates: [
 *         (stack, currentNode) => { 
 *              // custom logic here  
 *          }
 *     ]
 * });
 */
const _Fa_DFSHelper = function ({ node, predicates }) {
    let stack = Array.isArray(node) ? [...node] : [node];
    while (stack.length > 0) {
        const current = stack.pop();
        predicates.forEach((predicate) => {
            const result = predicate(stack, current);
            if (Array.isArray(result)) stack.push(...result);
        });
    }
};

/*<=========================================================== Capability Extension (DOM Manipulation) ============================================================>>*/

/**
 * A collection of utility functions for DOM manipulation and traversal.
 * @namespace _Fo_UtilityFunc
 * 
 * The `_Fo_UtilityFunc` utility class provides a collection of DOM manipulation and utility methods.
 * These methods help in interacting with the DOM, handling custom events, and performing other tasks
 * such as adding/removing classes, setting attributes, and more.
 */
class _Fo_UtilityFunc {

    /**
     * Dispatches a custom event on the first element that matches the selector, 
     * or on all elements that match if there are multiple matches.
     * 
     * @param {Object} params - The parameters for dispatching the event.
     * @param {string} params.selector - The CSS selector to target the elements.
     * @param {string} params.event - The name of the event to be dispatched.
     * @param {any} [params.data=null] - Optional data to be passed with the event.
     */
    static customEvent = ({ selector, event, data = null }) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length == 1) {
            elements[0].dispatchEvent(new CustomEvent(event, { detail: data, bubbles: true }));
        }
        else if (elements.length > 1) {
            elements.forEach((element) => {
                element.dispatchEvent(new CustomEvent(event, { detail: data, bubbles: true }));
            });
        }
        else {
            console.log(`foreveralone.customEvent log, element with selector ${selector} not found`);
        }
    };

    /**
     * Performs a depth-first search (DFS) traversal over nodes and executes predicates on each node.
     * 
     * @param {Object} params - The parameters for DFS traversal.
     * @param {Array|Element} params.node - The node or nodes to be traversed.
     * @param {Function[]} params.predicates - An array of predicate functions to apply to each node.
     * @returns {void}
     */
    static dfs = ({ node, predicates }) => {
        let stack = Array.isArray(node) ? [...node] : [node];
        let canContinue = true;
        while (stack.length > 0) {
            const current = stack.pop();
            console.log(`foreveralone.dfs log, node current explored ${current}`);
            predicates.forEach((predicate) => {
                const result = predicate(current);
                if (typeof result === "boolean") {
                    canContinue = false;
                    console.log(`foreveralone.dfs log, execution ended on demand`);
                }
                if (Array.isArray(result) && canContinue) {
                    stack.push(...result);
                }
            });
        }
    };

    /**
     * Appends a child element to a parent element.
     * @param {Element} element - The parent element.
     * @param {Element} child - The child element to append.
     * @returns {void}
     */
    static append = (element, child) => element.appendChild(child);

    /**
     * Prepends a child element to a parent element.
     * @param {Element} element - The parent element.
     * @param {Element} child - The child element to prepend.
     * @returns {void}
     */
    static prepend = (element, child) => element.insertBefore(child, element.firstChild);

    /**
     * Removes a child element from a parent element.
     * @param {Element} element - The parent element.
     * @param {Element} child - The child element to remove.
     * @returns {void}
     */
    static remove = (element, child) => element.removeChild(child);

    /**
     * Sets the inner HTML of an element by parsing the provided HTML string.
     * @param {Element} element - The target element.
     * @param {string} html - The HTML string to be inserted into the element.
     * @returns {void}
     */
    static addHtml = (element, html) => {
        let children = [];
        let fragment = document.createElement("div");
        fragment.innerHTML = html;
        while (fragment.firstChild) {
            children.push(fragment.firstChild);
            fragment.removeChild(fragment.firstChild);
        }
        children.forEach((child) => element.appendChild(child));
    };

    static cleanAndAddHtml = (element, html) => {
        this.clean(element)
        this.addHtml(element, html);
    };

    /**
     * Transfers all child nodes from one element to another by deeply cloning the children.
     * 
     * @param {Element} giver - The element whose children will be transferred.
     * @param {Element} receiver - The element to which the children will be added.
     */
    static transferHTML = (giver, receiver) => {
        let child = [];
        let childCopy = giver.cloneNode(true); // Clone children deeply

        // Push all child nodes into the child array
        while (childCopy.firstChild) {
            child.push(childCopy.firstChild);
        }

        // Append all the children to receiver
        child.forEach((childNode) => receiver.appendChild(childNode));
    };

    /**
     * Replaces the inner HTML of the current element with the deeply cloned children of another element.
     * 
     * @param {Element} node - The element whose inner HTML will be replaced.
     * @param {Element} copy - The element from which the children will be copied.
     */
    static transferHTMLAndReplaceHTML = (giver, receiver) => {
        this.clean(receiver)
        this.transferHTML(giver, receiver);
    };

    /**
     * Sets the text content of an element.
     * @param {Element} element - The target element.
     * @param {string} text - The text content to set.
     * @returns {void}
     */
    static text = (element, text) => element.textContent = text;

    /**
     * Removes all child nodes from an element.
     * @param {Element} element - The target element.
     * @returns {void}
     */
    static clean = (element) => {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    };

    /**
     * Sets an attribute on an element.
     * @param {Element} element - The target element.
     * @param {string} key - The name of the attribute.
     * @param {string} value - The value to set for the attribute.
     * @returns {void}
     */
    static attr = (element, key, value) => element.setAttribute(key, value);

    /**
     * Sets a CSS style property on an element.
     * @param {Element} element - The target element.
     * @param {string} key - The CSS property name.
     * @param {string} value - The value to set for the CSS property.
     * @returns {void}
     */
    static css = (element, key, value) => element.style[key] = value;

    /**
     * Adds a CSS class to an element.
     * @param {Element} element - The target element.
     * @param {string} className - The class name to add.
     * @returns {void}
     */
    static addClass = (element, className) => element.classList.add(className);

    /**
     * Removes a CSS class from an element.
     * @param {Element} element - The target element.
     * @param {string} className - The class name to remove.
     * @returns {void}
     */
    static removeClass = (element, className) => element.classList.remove(className);

    /**
     * Toggles a CSS class on an element.
     * @param {Element} element - The target element.
     * @param {string} className - The class name to toggle.
     * @returns {void}
     */
    static toggleClass = (element, className) => element.classList.toggle(className);

    /**
     * Checks if an element has a specific CSS class.
     * @param {Element} element - The target element.
     * @param {string} className - The class name to check.
     * @returns {boolean} `true` if the element has the class, `false` otherwise.
     */
    static hasClass = (element, className) => {
        return element.classList.contains(className);
    };

    /**
     * Finds an element(s) by a CSS selector.
     * @param {string} selector - The CSS selector to use.
     * @param {Element} [element=document] - The root element to search within (default is `document`).
     * @returns {NodeList|Element} The found element(s), either a single element or a NodeList.
     */
    static find = (selector, element = document) => {
        let result = element.querySelectorAll(selector);
        return result.length === 1 ? result[0] : result;
    };

    /**
     * Returns an array of child elements of the given element.
     * 
     * @param {Element} element - The parent element whose children are to be retrieved.
     * @returns {Array} An array of child elements.
     */
    static children = (element) => {
        return Array.from(element.children);
    };

    /**
     * Returns the parent element of the given element.
     * 
     * @param {Element} element - The element whose parent is to be retrieved.
     * @returns {Element|null} The parent element, or null if no parent exists.
     */
    static parent = (element) => {
        return element.parentNode;
    };

    /**
     * Returns the next sibling element of the given element.
     * 
     * @param {Element} element - The element whose next sibling is to be retrieved.
     * @returns {Element|null} The next sibling element, or null if no next sibling exists.
     */
    static next = (element) => {
        return element.nextElementSibling;
    };

    /**
     * Returns the previous sibling element of the given element.
     * 
     * @param {Element} element - The element whose previous sibling is to be retrieved.
     * @returns {Element|null} The previous sibling element, or null if no previous sibling exists.
     */
    static prev = (element) => {
        return element.previousElementSibling;
    };

    /**
     * Returns an array of all next sibling elements of the given element.
     * 
     * @param {Element} element - The element whose next siblings are to be retrieved.
     * @returns {Array} An array of next sibling elements.
     */
    static nextAll = (element) => {
        let result = [];
        let current = element.nextElementSibling;
        while (current) {
            result.push(current);
            current = current.nextElementSibling;
        }
        return result;
    };

    /**
     * Returns an array of all previous sibling elements of the given element.
     * 
     * @param {Element} element - The element whose previous siblings are to be retrieved.
     * @returns {Array} An array of previous sibling elements.
     */
    static prevAll = (element) => {
        let result = [];
        let current = element.previousElementSibling;
        while (current) {
            result.push(current);
            current = current.previousElementSibling;
        }
        return result;
    };

    /**
     * Returns an array of all next sibling elements of the given element, up until a matching element.
     * 
     * @param {Element} element - The element from which to start the search for next siblings.
     * @param {string} selector - The CSS selector to match against next sibling elements.
     * @returns {Array} An array of sibling elements up until the first match.
     */
    static nextUntil = (element, selector) => {
        let result = [];
        let current = element.nextElementSibling;
        while (current && !current.matches(selector)) {
            result.push(current);
            current = current.nextElementSibling;
        }
        return result;
    };

    /**
     * Returns an array of all previous sibling elements of the given element, up until a matching element.
     * 
     * @param {Element} element - The element from which to start the search for previous siblings.
     * @param {string} selector - The CSS selector to match against previous sibling elements.
     * @returns {Array} An array of sibling elements up until the first match.
     */
    static prevUntil = (element, selector) => {
        let result = [];
        let current = element.previousElementSibling;
        while (current && !current.matches(selector)) {
            result.push(current);
            current = current.previousElementSibling;
        }
        return result;
    };

    /**
     * Clones the given element, including its children.
     * 
     * @param {Element} element - The element to be cloned.
     * @param {boolean} deep deep or shallow copy .
     * @returns {Element} A clone of the given element.
     */
    static clone = (element, deep = true) => {
        return element.cloneNode(deep);
    };

    /**
     * Wraps the given element inside a wrapper element.
     * 
     * @param {Element} element - The element to be wrapped.
     * @param {Element} wrapper - The wrapper element to wrap the element with.
     * @throws {Error} If the element or its parent node is invalid.
     */
    static wrap = (element, wrapper) => {
        if (!element || !element.parentNode) {
            console.error("Invalid element or element is not in the DOM.");
            return;
        }
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
    };

    /**
     * Removes the wrapper element around the given element, optionally removing the wrapper itself.
     * 
     * @param {Element} element - The element whose wrapper is to be removed.
     * @param {boolean} [remove=false] - If true, the wrapper element will be removed from the DOM.
     * @throws {Error} If the element or its parent node is invalid, or if the wrapper is not inside a parent.
     */
    static unwrap = (element, remove = false) => {
        if (!element || !element.parentNode) {
            console.error("Invalid element or element is not in the DOM.");
            return;
        }
        let wrapper = element.parentNode;
        let wrapperParent = wrapper.parentNode;

        if (!wrapperParent) {
            console.error("Wrapper is not inside a parent.");
            return;
        }

        wrapperParent.insertBefore(element, wrapper); // Move element out of wrapper

        if (remove == true) {
            wrapperParent.removeChild(wrapper); // Remove wrapper from DOM
        }
    };

    /**
     * Asynchronous function that makes an HTTP request using the fetch API in JavaScript.
     *
     * @param {Object} params - The request parameters.
     * @param {string} params.url - The URL to which the request will be made.
     * @param {string} params.method - The HTTP method (e.g., 'GET', 'POST').
     * @param {Object|string} [params.data] - The data to send in the body of the request (for methods like 'POST' or 'PUT').
     * @param {Object} [params.headers] - Additional headers for the request.
     * @returns {Promise<any>} The response data or an error.
     */
    static fetch = async ({ url, method, data = null, headers = {} }) => {
        try {
            // Prepare the options for the fetch request
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',  // Default content type
                    ...headers,  // Merge any additional headers
                },
                body: data ? JSON.stringify(data) : null,  // If data exists, stringify it for POST/PUT requests
            };

            // Send the fetch request and wait for the response
            const response = await fetch(url, options);

            // Check if the response is okay (status 200-299)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Handle the response, parse as JSON or text
            const responseData = await response.json().catch(() => response.text());  // Try parsing as JSON, fallback to text
            return responseData;
        } catch (error) {
            // Handle any errors that occurred during the fetch process
            console.error('Fetch error:', error);
            throw error;  // Rethrow the error for further handling
        }
    };

    /**
     * Toggles the debug mode on or off.
     * 
     * @param {boolean} debuggable - A boolean value indicating whether the debug mode should be enabled (true) or disabled (false).
     */
    debugMode = (debuggable) => {
        if (debuggable) {
            _Fa_DebugHelper.toggleDebugAllTrue();
        } else {
            _Fa_DebugHelper.toggleDebugAllFalse();
        }
    };

    /**
     * Allows debugging for the specified references.
     * 
     * @param {string | string[]} refs - A single reference string or an array of reference strings that should be initialized for debugging.
     * 
     * @throws {Error} Throws an error if the argument is neither a string nor an array of strings.
     */
    allowDebug = (refs) => {
        Array.isArray(refs)
            ? refs.forEach(ref => _Fa_DebugHelper.initDebug(ref))
            : typeof refs == "string"
                ? _Fa_DebugHelper.initDebug(refs)
                : console.error(
                    `Error: allowDebug() expects an array of refs or a single ref string, but got ${typeof refs} ${refs}`
                );
    };

    /**
    * Initializes the debug mode with the given configuration.
    * 
    * @param {Array<Object>} debugConfigs - An array of configuration objects for initializing debugging.
    * @param {string} debugConfigs.ref - The reference for which debugging is to be initialized.
    * @param {boolean} [debugConfigs.debug=true] - A flag indicating whether debugging should be enabled for the reference.
    * @param {boolean} [debugConfigs.trace=false] - A flag indicating whether tracing should be enabled for the reference.
    */
    allowAdvancedDebug = (debugConfigs) => {
        console.log("Debug mode is initializing...");

        for (let config of debugConfigs) {
            if (config?.debug === true) {
                _Fa_DebugHelper.initDebug(config.ref);
            }
            if (config?.trace === true) {
                _Fa_DebugHelper.isTraceable(config.ref);
            }
        }
        _Fa_DebugHelper.traceOn();
        console.log("Debug mode is active.");
    };

    debugRef = _Fa_DebugHelper.debugReference;

}


/*<=========================================================== Capability Extension (App Management) ============================================================>>*/

/**
 * A utility class that extends _Fo_UtilityFunc for managing routes, configuration, 
 * and custom event handling in a web application framework.
 */
class _Fo_AppManager extends _Fo_UtilityFunc {
    
    /**
     * Debug utility for logging information related to this class.
     * @type {Function}
     */
    debug = _Fa_DebugHelper.debugReference("_Fo_AppManager");

    /**
     * Constructor for the foreveralone class.
     */
    constructor() {
        super();
    }

    /**
     * Adds new routes to the application router.
     * 
     * @param {Array<Object>} routes - An array of route objects to add.
     * @param {string} routes[].key - Unique key identifying the route.
     * @param {string} routes[].path - Path or URL of the route.
     * @param {Array<Object>} [routes[].children] - Nested routes (optional).
     * @param {Object} [routes[].props] - Additional properties for the route.
     * @param {Object|null} [routes[].headers] - HTTP headers (optional).
     * @param {string|null} [routes[].method] - HTTP method (e.g., GET, POST) (optional).
     * @param {Object|null} [routes[].body] - Request body for the route (optional).
     * 
     * @throws {Error} If `routes` is not an array.
     */
    addRoutes(routes = [{ key, path, children, props, headers: null, method: null, body: null }]) {
        this.debug("log", "addRoute() is called with the following arguments:");
        this.debug("log", "routes:", routes);
    
        if (!Array.isArray(routes)) {
            this.debug("error", "routes must be an array.");
            return;
        }
    
        routes.forEach(route => {
            if (!route.key || !route.path) {
                this.debug("error", `Invalid route configuration:`, route);
                return;
            }
    
            let routeInstance = new _Fo_AppRoute(route);
            this.emit('route-added', routeInstance); // Emit instead of directly adding to the router
        });
    }    

    /**
     * Configures the application shell and routes.
     * 
     * @param {Object} config - Configuration object.
     * @param {string} config.fragmentSelector - CSS selector for the application fragment.
     * @param {Array<Object>} config.pagesRef - Reference to the pages configuration.
     * @param {number} config.loadTime - Load time threshold for performance tuning.
     * @param {Array<Function>} config.middlewares - Array of middleware functions.
     */
    configure({ fragmentSelector, pagesRef, loadTime, middlewares }) {
        if (!this.fragment) {
            this.fragment = new _Fo_AppShell(fragmentSelector);
        } else if (fragmentSelector && this.fragment) {
            // this.fragment.update(fragmentSelector);
        }

        _Fo_AppRouter.configure({ appShell: this.fragment, pagesRef, loadTime, middlewares });
    }

    /**
     * Initializes the application router and sets up URL change handling.
     */
    init() {
         _Fo_AppManager.emit('app-ignited') 
    }

    /**
     * Static object to hold registered event listeners.
     * @type {Object<string, Array<Function>>}
     */
    static listener = {};

    /**
     * Registers a callback function to an event.
     * 
     * @param {string} event - The event name to listen for.
     * @param {Function} fn - The callback function to invoke when the event is emitted.
     */
    static on(event, fn) {
        if (!_Fo_AppManager.listener[event]) {
            _Fo_AppManager.listener[event] = [];
        }

        if (!_Fo_AppManager.listener[event].includes(fn)) {
            _Fo_AppManager.listener[event].push(fn);
        }
    }

    /**
     * Removes a callback function from an event.
     * 
     * @param {string} event - The event name to remove the callback from.
     * @param {Function} fn - The callback function to remove.
     */
    static off(event, fn) {
        if (_Fo_AppManager.listener[event]) {
            const index = _Fo_AppManager.listener[event].indexOf(fn);
            if (index !== -1) {
                _Fo_AppManager.listener[event].splice(index, 1);
            }
        }
    }

    /**
     * Emits an event and invokes all registered callbacks for the event.
     * 
     * @param {string} event - The event name to emit.
     * @param {...*} args - Arguments to pass to the callback functions.
     */
     emit(event, ...args) {
        if (_Fo_AppManager.listener[event]) {
            _Fo_AppManager.listener[event].forEach(fn => fn(...args));
        }
    }   
     /**
     * Emits an event and invokes all registered callbacks for the event.
     * 
     * @param {string} event - The event name to emit.
     * @param {...*} args - Arguments to pass to the callback functions.
     */
     static emit(event, ...args) {
        if (_Fo_AppManager.listener[event]) {
            _Fo_AppManager.listener[event].forEach(fn => fn(...args));
        }
    }
}

_Fo_AppManager.on('route-added', (routeInstance) => {
    _Fo_AppRouter.add(routeInstance);
    console.log('Route successfully added to the router.');
});

_Fo_AppManager.on('app-ignited', (config) => {
    _Fo_AppRouter.init();
    _Fo_AppRouter.onUrlChangeStandard();
    console.log('App has been ignited:');
});

/*<=========================================================== Capability Extension (Navigation helper) ============================================================>>*/


/*<=========================================================== Capability Extension (State Management) ============================================================>>*/

class _Fo_AppState extends _Fo_AppManager {

    #state;
    #accessKey;

    constructor() {
            super();

        // Unique key for access
        this.#accessKey = Symbol("accessKey");

        // Internal state object
        const state = {};

        // Proxy to prevent key deletion
        this.#state = new Proxy(state, {
            deleteProperty(target, prop) {
                throw new Error(`Deleting keys is not allowed: ${String(prop)}`);
            },
            set(target, key, value) {
                target[key] = value;
                document.querySelectorAll(`[bind-state="${key}"]`).forEach((el) => {
                    el.textContent = value;
                });
                return true;
            }
        });
    }
    
    // Binding state to DOM
    bindState(key, selector){
        document.querySelector(selector).setAttribute('bind-state', key);
    };
    

    // Get the access key
    getAccessKey() {
        return this.#accessKey;
    }

    // Set a value in the state
    setState(key, value, accessKey) {
        if (accessKey !== this.#accessKey) {
            throw new Error("Unauthorized access: Invalid key.");
        }
        if (typeof accessKey !== "symbol") {
            throw new Error("Invalid access key type. Must be a symbol.");
        }        
        this.#state[key] = value;
    }

    getState(key, accessKey, defaultValue = undefined) {
        if (typeof accessKey !== "symbol") {
            throw new Error("Invalid access key type. Must be a symbol.");
        }
        if (accessKey !== this.#accessKey) {
            throw new Error("Unauthorized access: Invalid key.");
        }
        return this.#state[key] !== undefined ? this.#state[key] : defaultValue;
    }

    // View all state keys and values (for debugging)
    debugState(accessKey) {
        if (accessKey !== this.#accessKey) {
            throw new Error("Unauthorized access: Invalid key.");
        }
        return { ...this.#state };
    }
}

// // Usage Example
// const appState = new _Fo_AppState();
// const key = appState.getAccessKey();

// appState.setState("user", { name: "John Doe" }, key);
// console.log(appState.getState("user", key)); // { name: "John Doe" }

// // Debug the entire state
// console.log(appState.debugState(key)); // { user: { name: "John Doe" } }

// // Attempt to delete key
// try {
//     delete appState.user; // Throws an error
// } catch (err) {
//     console.error(err.message); // Deleting keys is not allowed: user
// }

// // Attempt to access without a key
// try {
//     appState.getState("user", Symbol("invalidKey")); // Throws an error
// } catch (err) {
//     console.error(err.message); // Unauthorized access: Invalid key.
// }

/*<=========================================================== Capability Extension (JWT Management) ============================================================>>*/
class _Fo_AppJWT extends _Fo_AppState {
    constructor() {
        super();
        this.jwt = null; // Placeholder for JWT token
    }

    setJWT(token, accessKey) {
        if (accessKey !== this.getAccessKey()) {
            throw new Error("Unauthorized access: Invalid key.");
        }
        this.jwt = token;
    }

    getJWT(accessKey) {
        if (accessKey !== this.getAccessKey()) {
            throw new Error("Unauthorized access: Invalid key.");
        }
        return this.jwt;
    }

    isJWTValid() {
        // Add validation logic (e.g., decoding, expiry check)
        return !!this.jwt; // Simplistic check
    }
}

class foreveralone extends _Fo_AppJWT {
    constructor() {
        super();
    }

    // Method to synchronize state with local storage
    syncWithLocalStorage() {
        const key = this.getAccessKey();
        localStorage.setItem("appState", JSON.stringify(this.debugState(key)));
    }

    // Method to load state from local storage
    loadFromLocalStorage() {
        const key = this.getAccessKey();
        const storedState = JSON.parse(localStorage.getItem("appState") || "{}");
        Object.entries(storedState).forEach(([k, v]) => this.setState(k, v, key));
    }

    onChange(callback) {
        if(!changeHandlers.indexOf(callback)){
            this.changeHandlers.push(callback);
        }
    }

    setState(key, value, accessKey) {
        super.setState(key, value, accessKey);
        this.changeHandlers.forEach((handler) => handler(key, value));
    }
}

// const app = new foreveralone();
// const kkey = app.getAccessKey();

// app.onChange((k, v) => console.log(`State updated: ${k} -> ${JSON.stringify(v)}`));
// app.setState("theme", "dark", kkey); // Logs: State updated: theme -> "dark"
