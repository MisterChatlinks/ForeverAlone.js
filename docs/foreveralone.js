/*=========================================================================================================================
  ================================================== CORE EVENT MECHANICS ===============================================
  =========================================================================================================================
*/

class _Fo_EventManager {
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
        if (!this.listener[event]) {
            this.listener[event] = [];
        }
        if (!this.listener[event].includes(fn)) {
            this.listener[event].push(fn);
        }
    }

    /**
   * Registers a callback function to an event, that trigger once.
   * 
   * @param {string} event - The event name to listen for.
   * @param {Function} fn - The callback function to invoke when the event is emitted.
   */
    static once(event, fn) {

        if (!this.listener[event]) {
            this.listener[event] = [];
        }

        let wrapper = (args) => {
            let index = this.listener[event].indexOf(wrapper);
            this.listener[event] = this.listener[event].splice(index, 1);
            fn(...args)
        }

        if (!this.listener[event].includes(fn)) {
            this.listener[event].push(wrapper);
        }
    }

    /**
     * Removes a callback function from an event.
     * 
     * @param {string} event - The event name to remove the callback from.
     * @param {Function} fn - The callback function to remove.
     */
    static off(event, fn) {
        if (this.listener[event]) {
            const index = this.listener[event].indexOf(fn);
            if (index !== -1) {
                this.listener[event].splice(index, 1);
            }
        }
    }

    /**
    * Emits an event and invokes all registered callbacks for the event.
    * 
    * @param {string} event - The event name to emit.
    * @param {...*} args - Arguments to pass to the callback functions.
    */
    static emit(event, ...args) {
        if (this.listener[event]) {
            this.listener[event].forEach(fn => fn(...args));
        }
    }
}

/*=========================================================================================================================
  ================================================== UTILITY MECHANICS ===============================================
  =========================================================================================================================
*/

/**
 * A collection of utility functions for DOM manipulation and traversal.
 * @namespace _Fo_UtilityFunc
 * 
 * The `_Fo_UtilityFunc` utility class provides a collection of DOM manipulation and utility methods.
 * These methods help in interacting with the DOM, handling custom events, and performing other tasks
 * such as adding/removing classes, setting attributes, and more.
 */
class _Fo_UtilityFunc extends _Fo_EventManager {

    constructor() {
        super();
    }

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
            console.log(`ForeverAlone.customEvent log, element with selector ${selector} not found`);
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
            console.log(`ForeverAlone.dfs log, node current explored ${current}`);
            predicates.forEach((predicate) => {
                const result = predicate(current);
                if (typeof result === "boolean") {
                    canContinue = false;
                    console.log(`ForeverAlone.dfs log, execution ended on demand`);
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
}

/*=========================================================================================================================
  ================================================== DEBUGGING MECHANICS ===============================================
  =========================================================================================================================
*/

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
        return (type, message, data = null) => this.debugLogs({ ref: at, type: type, message: message, data: data });
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

            switch (type) {
                case "error":
                    console.error(`%c${message}`, style);
                    break;
                case "warn":
                    console.warn(`%c${message}`, style);
                    break;
                case "info":
                    console.info(`%c${message}`, style);
                    break;
                case "debug":
                    console.trace(`%c${message}`, style);
                    break;
                default:
                    console.log(`%c${message}`, style);
            }
        }
        if (data) {
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

/*=========================================================================================================================
  ================================================== ROUTING API ===============================================
  =========================================================================================================================
*/

class _Fo_NavigationHelper extends _Fo_UtilityFunc {
    static debug = _Fa_DebugHelper.debugReference("_Fo_NavigationHelper");

    static navigate(routeName) {
        if (typeof routeName == "string") {
            window.history.pushState({}, "", routeName)
        } else {
            this.debug("warn", "Invalid route name. Expected a string, but received:", routeName)
        }
    }

    static back() {
        window.history.back()
    }

    static forward() {
        window.history.forward()
    }

    static getHistory() {
        return window.history
    }

}

/*=========================================================================================================================
  ================================================== CORE ROUTING MECHANICS ===============================================
  =========================================================================================================================
*/

// ================================================== APPSHELL ===============================================


class _Fo_AppShell {

    static #debug = _Fa_DebugHelper.debugReference("_Fo_AppShell");

    static #fragment;

    static setFragment(fragment) {
        if (typeof fragment == "string") {
            let shell = document.querySelector(fragment) || document.getElementById(fragment) || null;
            if (shell) {
                this.#fragment = shell
            } else {
                this.#debug("error", `Invalid fragment query selector detected, no element on the DOM Match for ${fragment}`);
            }
        } else if (typeof fragment == "object") {
            if (fragment?.nodeName) {
                this.#fragment == fragment;
            } else {
                this.#debug("error", `Invalid fragment detected, the given fragment is not a valid HTML, current value :`, fragment);
            }
        }
    }

    static async render(route) {
        if (this.#fragment) {
            const result = await route.render();
            if (result) {
                ForeverAlone.clean(this.#fragment);
                this.#fragment.appendChild(result);
                document.title = route.title || _Fo_AppRouter.websiteDefaultTitle;
                ForeverAlone.emit("app:viewChanged");
                return true; // return confirmation that everything went well

            } else throw new Error("Fatal Error: Error while requesting route rendering")
        } else throw new Error("Fatal Error: no fragment have been given");
    }
}

// ================================================== ROUTER ===============================================


class _Fo_AppRouter {

    static #debug = _Fa_DebugHelper.debugReference("_Fo_AppRouter");

    static #defaultPageRef = { root: "/index", load: "/loading", err: "/404" }

    static #appShellShape = ["render", "setFragment"]

    static async configure({ appShell, loadTime, pagesRef, middlewares }) {

        // Validate or handle the appShell
        if (!this.appShell) {
            try {
                this.#appShellShape.forEach(shape => appShell[shape]);
                this.appShell = appShell;
            } catch (error) {
                throw new Error(`Fatal Error: invalid AppShell provided to the router, ${error}`);
            }
        } else if (this.appShell && appShell) {
            this.#debug("warn", "tentative to override appShell unauthorized");
        }
    
        // Set loadTime with fallback to default value
        this.loadTime = loadTime || this.loadTime || 1500;
    
        // Merge or initialize pagesRef
        this.pagesRef = {
            ...this.#defaultPageRef,
            ...this.pagesRef,
            ...(pagesRef || {})
        };
    
        // Merge or initialize middlewares
        this.middlewares = [
            ...(this.middlewares || []),
            ...(middlewares || [])
        ];
    }

    static #route = [];

    static #findRoute(predicate) {
        return this.#route.filter(predicate);
    }

    static #routeShape = ["key", "path", "props", "children", "headers", "methods", "component"]

    static addRoute(route) {
        try {
            this.#routeShape.forEach(shape => route[shape]);
            this.#route.push(route);
        } catch (error) {
            this.#debug("warn", "Invalid Route detected, passed :", route)
        }
    }

    static async onUrlChange(currentUrl) {
        console.log("yet to be implemented")
    }

    static async onUrlChangeStandard(currentUrl) {

        if (!this.appShell) throw new Error("Fatal Error: AppShell have been given to the router");

        if (currentUrl.match(/\w+\.\w+/g) || currentUrl.trim() === "") {
            this.#debug("info", `File link detected, redirecting to root ${this.pagesRef.root}`);
            window.history.pushState({}, "", this.pagesRef.root);
            window.dispatchEvent(new Event("popstate"))
            return;
        }

        try {
            this.#debug("info", `URL changed: ${currentUrl}`);
            this.location = currentUrl;
            this.currentRoute = this.#findRoute(route => route.match(this.location))[0];
            this.loadingRoute = this.#findRoute(route => route.match(this.pagesRef.load))[0];
            this.errorRoute = this.#findRoute(route => route.match(this.pagesRef.err))[0];

            if (this.loadingRoute && this.loadTime > 0){ 
                this.#debug("log", `Requesting transition, with loading route`,this.loadingRoute)
                this.appShell.render(this.loadingRoute)
            };

            for (const middleware of this.middlewares) {
                const result = await middleware(this.currentRoute);
                if (result !== true) {
                    this.#debug("warn", `Middleware blocked route: ${result}`);
                    return;
                }
            }

            if (this.currentRoute) {
                await this.executeLifeCycle("onCurrentRouteFound");
                setTimeout(() => {this.appShell.render(this.currentRoute)}, this.loadTime);
            } else if (this.errorRoute) {
                this.#debug("warn", `No route found for: ${this.location}`);
                setTimeout(() => this.appShell.render(this.errorRoute), this.loadTime);
            } else {
                this.#debug("warn", `No route found for: ${this.location}, And No Error route found have been provided`);
            }

            return true; // return confirmation that everything went well

        } catch (error) {
            this.#debug("error", `Error during URL change handling: ${error.message}`);
        }
    }

    static isJQueryAvailable = (() => { 
        return typeof $ !== 'undefined'
    })()
    /** Initializes the router and sets up event listeners for navigation. */
    static init() {

        // save the initial page title
        this.websiteDefaultTitle = document.title;
        this.#debug("info", `Initial page title: ${this.websiteDefaultTitle}`);

        this.isJQueryAvailable
            ? this.#debug("info", "JQuery detected, igniting router on JQuery Version")
            : this.#debug("info", "No JQuery detected, igniting router on standard Version");


        // Handle forward/backward navigation triggered by the browser
        window.addEventListener("popstate", () => {
            this.isJQueryAvailable == true 
                ? _Fo_AppRouter.onUrlChange(window.location.pathname)
                : _Fo_AppRouter.onUrlChangeStandard(window.location.pathname);
        });

        // Handle custom navigation via "app-link" clicks
        document.addEventListener("click", (e) => {
            if (e.target.hasAttribute("app-link")) {
                e.preventDefault(); // Prevent the default link behavior
                if (window.location.pathname != e.target.getAttribute("href")) {
                    // Update the URL without reloading the page
                    window.history.pushState({}, "", e.target.getAttribute("href"));
                    window.dispatchEvent(new Event("popstate"))
                }
            }
        });

        window.dispatchEvent(new Event("popstate"))
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
                    this.#debug("warn", `LifeCycle "${cycleName}" failed at "${key}"`);
                    return false;
                }
            }
        }
        if (!cycle) {
            this.#debug("warn", `Lifecycle "${cycleName}" is not defined.`);
            return false;
        }
    }

    /** @type {Object} Arguments accessible in lifecycle methods. */
    static args = {
        currentRoute: () => this.currentRoute,
        loadingRoute: () => this.loadingRoute,
        location: () => this.location,
        errorRoute: () => this.errorRoute,
        findRoute: predicate => this.#findRoute(predicate),
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
            this.#debug("info", `LifeCycle "${name}" registered at "${at}"`);
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

// ================================================== ROUTE ===============================================

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

    constructor({ key, path, title, children, props, headers = null, method = null, body = null }) {
        this.key = key;
        this.path = path;
        this.title = title;
        this.headers = headers;
        this.props = props;
        this.method = method;
        this.body = body;
        this.children = children || [];
        this.urlParam = new _Fo_AppRoute_UrlParameter({ pattern: key })
    }

    async render() {
        this.debug("info", `route ${this.key} requested`);
    
        // Return existing component if already rendered
        if (this.component) return this.component;
    
        const { data, error } = await this.fetch();
    
        if (error) {
            this.debug("error", `Error fetching route "${this.key}"`);
            return null;
        }
    
        // Create and configure the component container
        const component = document.createElement("div");
        component.setAttribute(_Fo_Component.keyword["component"], ""); // Custom attribute
        component.setAttribute("view-container", ""); // Decorative attribute for developers
        component.style.cssText = "width: 100%; height: 100%; margin: 0; padding: 0;"; // Inline styles
        component.innerHTML = data; // Set content
        component.props = { ...this.props }; // Attach props
    
        // Monitor readiness of the component's child nodes
        let readinessTimer = 0;
    
        const observer = new MutationObserver(() => {
            readinessTimer += 50;
        });
    
        observer.observe(component, {
            childList: true,
            subtree: true,
        });
    
        // Initialize component logic
        new _Fo_Component({ node: component });
    
        // Wait for readiness check to complete
        while (readinessTimer !== 0) {
            await new Promise(resolve => setTimeout(() => {
                if (readinessTimer === 0) resolve();
                else readinessTimer -= 50;
            }, 50));
        }
    
        // Stop observing mutations
        observer.disconnect();
    
        // Cache and return the rendered component
        this.component = component;
        return this.component;
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

// ================================================== ROUTE URL PARAMETER ===============================================

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


/*=========================================================================================================================
  ================================================== CORE COMPONENT ===============================================
  =========================================================================================================================
*/

// ================================================== COMPONENT LOGIC ===============================================


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


        this.configureComponent();

        const childrenTag = _Fa_getTag({ node: this.node, tagname: "children" });
        if (childrenTag != null) {
            this.debug("info", "_Fo_Component configured, initializing parsing and placeholder interpretation.");
            this.children = childrenTag;
            this.parseComponent();
            this.buildComponent();

            this.node.querySelector("getComponent") && this.HandleGetComponentTag();
        } else {
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

                        this.debug("debug", `==> Parsing by DFS, current result ${this.node.innerHTML}`);
                    }
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

        this.debug("info", `==> Parsing by DFS ended on _Fo_Component ${this.node.nodeName}`);
    }

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

        this.debug("success", `Parsing _Fo_Component ${this.node.nodeName} to Common HTML completed`);
    }

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

        this.debug("success", `==> Event Binding & Ignition of _Fo_Component Children by DFS completed`);
    }

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

    }

    /**
     * Configures the component associated with the root node.
     * This method initializes a new _Fo_Component_Config instance for the current node.
     */
    configureComponent() {
        new _Fo_Component_Config({ node: this.node });
    }
}

// ================================================== COMPONENT CONFIGURATOR ===============================================


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
        this.debug("warn", `getTag called for tagname: ${tagname}, result: ${result ? "found" : "not found"}.`); return result || null;
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
            this.node[property] = this.node[property] || {};

            this.debug("debug", `Property: ${property}, Attributes: ${JSON.stringify(value)}.`);
        });
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
                this.node[property][propName] =  this.parseProperty(value);

                this.debug("debug", `Set property: ${propName}, Value: ${value}.`);
            });
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
                this.debug("error", `JSON parsing failed for property: ${property}, error: ${e}.`); return null;
            }
        } else if (isArrowFunc) {
            try {
                return new Function("props", `return (${props})(props);`);
            } catch (e) {
                this.debug("error", `Arrow function execution failed for property: ${property}, error: ${e}.`); return null;
            }
        } else if (isArrayString) {
            try {
                return JSON.parse(props); // Parse the array string into an actual array
            } catch (e) {
                this.debug("error", `Array string parsing failed for property: ${property}, error: ${e}.`); return null;
            }
        }

        this.debug("error", `Invalid property format detected for: ${property}.`);
        return null;
    }

}

// ================================================== COMPONENT'S LIFE CYCLE INTERPRETER  ===============================================


class _Fo_Component_LifecycleInterpreter {
    debug = _Fa_DebugHelper.debugReference("_Fo_Component_LifecycleInterpreter");

    constructor({ node }) {
        this.debug("info", `Initializing Lifecycle Interpreter for component: ${node.componentName}.`)

        this.node = node;

        this.debug("info", `Lifecycle Interpreter initialized for component: ${node.componentName}, with lifecycle: ${node.lifecycle}.`)
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

// ================================================== COMPONENT'S PLACEHOLDER INTERPRETER  ===============================================


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
            this.debug("log", `==> _Fo_Component_PlaceholderParser placeholderParser called with empty value`)
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
                            this.debug("log", `==> _Fo_Component_PlaceholderParser placeholderParser called with code ${code}\nresult: ${result}`); return result;
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
                    this.debug("log", `==> _Fo_Component_PlaceholderParser placeholderParser called with code ${code}\nresult: ${result}`); return result;
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

// ================================================== COMPONENT'S PLACEHOLDER REPLACER  ===============================================

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
                this.debug("error", `Error evaluating placeholder "${expression}": ${err.message}`);
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
            this.debug("warn", `Error evaluating expression "${expression}" : ${err.message}`);
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


/*=========================================================================================================================
  ================================================== CAPABILITY EXTENSION (GLOBAL STATE) ===============================================
  =========================================================================================================================
*/

/**
 * A class that extends utility functions for managing application state with enhanced security.
 * Provides state management, binding, and synchronization with local storage.
 */
class _Fo_AppState extends _Fo_UtilityFunc {

    /**
     * @private
     * @type {Object} Internal state object managed via Proxy.
     */
    #state;

    /**
     * @private
     * @type {Symbol} Unique key for state access.
     */
    #accessKey;

    constructor() {
        super();

        /**
         * Unique key for secure access to the state.
         * @type {Symbol}
         */
        this.#accessKey = Symbol("accessKey");

        /**
         * Internal state object managed via Proxy to prevent key deletion.
         */
        const state = {};
        this.#state = new Proxy(state, {
            deleteProperty(target, prop, value) {
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

        ForeverAlone.on("app:viewChanged", () => {
            Object.keys(this.#state).forEach(key => {
                document.querySelectorAll(`[bind-state="${key}"]`).forEach((el) => {
                    el.textContent = this.#state[key] || el.getAttribute(`${key}-default`) || "";
                });
            })
        })
    }

    /**
     * Binds a state key to a DOM element.
     * @param {string|HTMLElement} selector - The DOM selector or element to bind.
     * @param {string} key - The state key to bind.
     */
    bindState(selector, key) {
        if (typeof selector == "string") {
            let target = document.querySelector(selector) || document.getElementById(selector);
            if (target) {
                target.setAttribute("bind-state", key);
            } else {
                console.error(`Element not found: ${selector}, for state binding`);
            }
        } else if (selector?.nodeName) {
            selector.setAttribute('bind-state', key);
        }
    }

    /**
     * Retrieves the unique access key.
     * @returns {Symbol} The access key.
     */
    getAccessKey() {
        return this.#accessKey;
    }

    /**
     * Sets a value in the state securely.
     * @param {string} key - The key to set in the state.
     * @param {*} value - The value to assign to the key.
     * @param {Symbol} accessKey - The access key for authorization.
     * @throws Will throw an error if the access key is invalid or of the wrong type.
     */
    setState(key, value, accessKey) {
        if (accessKey !== this.#accessKey) {
            throw new Error("Unauthorized access: Invalid key.");
        }
        if (typeof accessKey !== "symbol") {
            throw new Error("Invalid access key type. Must be a symbol.");
        }
        this.#state[key] = value;
    }

    /**
     * Retrieves a value from the state securely.
     * @param {string} key - The key to retrieve from the state.
     * @param {Symbol} accessKey - The access key for authorization.
     * @param {*} [defaultValue=undefined] - A default value to return if the key is not found.
     * @returns {*} The value associated with the key, or the default value if not found.
     */
    getState(key, accessKey, defaultValue = undefined) {
        if (typeof accessKey !== "symbol") {
            throw new Error("Invalid access key type. Must be a symbol.");
        }
        if (accessKey !== this.#accessKey) {
            throw new Error("Unauthorized access: Invalid key.");
        }
        return this.#state[key] !== undefined ? this.#state[key] : defaultValue;
    }

    /**
     * Returns all state keys and values for debugging.
     * @param {Symbol} accessKey - The access key for authorization.
     * @returns {Object} The current state.
     * @throws Will throw an error if the access key is invalid.
     */
    debugState(accessKey) {
        if (accessKey !== this.#accessKey) {
            throw new Error("Unauthorized access: Invalid key.");
        }
        return { ...this.#state };
    }

    /**
     * Synchronizes the current state with local storage.
     */
    syncWithLocalStorage() {
        const key = this.getAccessKey();
        localStorage.setItem("appState", JSON.stringify(this.debugState(key)));
    }

    /**
     * Loads state from local storage.
     */
    loadFromLocalStorage() {
        const key = this.getAccessKey();
        const storedState = JSON.parse(localStorage.getItem("appState") || "{}");
        Object.entries(storedState).forEach(([k, v]) => this.setState(k, v, key));
    }

    /**
     * Registers a callback for state changes.
     * @param {Function} callback - The callback to invoke on state changes.
     */
    onChange(callback) {
        if (!changeHandlers.indexOf(callback)) {
            this.changeHandlers.push(callback);
        }
    }

    /**
     * Sets a state value and notifies registered change handlers.
     * @override
     * @param {string} key - The state key.
     * @param {*} value - The new value for the key.
     * @param {Symbol} accessKey - The access key for authorization.
     */
    setState(key, value, accessKey) {
        super.setState(key, value, accessKey);
        this.changeHandlers.forEach((handler) => handler(key, value));
    }
}

/**
 * A class for managing JSON Web Tokens (JWTs) extending application state.
 */
class _Fo_AppJWT extends _Fo_AppState {
    constructor() {
        super();
        /**
         * Placeholder for JWT token.
         * @type {string|null}
         */
        this.jwt = null;
    }

    /**
     * Sets the JWT token securely.
     * @param {string} token - The JWT token.
     * @param {Symbol} accessKey - The access key for authorization.
     * @throws Will throw an error if the access key is invalid.
     */
    setJWT(token, accessKey) {
        if (accessKey !== this.getAccessKey()) {
            throw new Error("Unauthorized access: Invalid key.");
        }
        this.jwt = token;
    }

    /**
     * Retrieves the JWT token securely.
     * @param {Symbol} accessKey - The access key for authorization.
     * @returns {string|null} The JWT token.
     * @throws Will throw an error if the access key is invalid.
     */
    getJWT(accessKey) {
        if (accessKey !== this.getAccessKey()) {
            throw new Error("Unauthorized access: Invalid key.");
        }
        return this.jwt;
    }

    /**
     * Checks if the JWT token is valid.
     * @returns {boolean} True if the JWT is valid; otherwise, false.
     */
    isJWTValid() {
        // Add validation logic (e.g., decoding, expiry check)
        return !!this.jwt; // Simplistic check
    }
}

/*=========================================================================================================================
  ================================================== APP RENDERING LOGIC ==================================================
  =========================================================================================================================
*/

/**
 * Class representing the core application logic of ForeverAlone SPA.
 * Extends the `_Fo_AppJWT` base class to include app-specific routing and middleware logic.
 */
class ForeverAlone extends _Fo_AppJWT {
    /**
     * Debugging utility for ForeverAlone class.
     * @type {Function}
     */
    static debug = _Fa_DebugHelper.debugReference("ForeverAlone");

    /**
     * Constructor for ForeverAlone class.
     * Calls the constructor of the parent `_Fo_AppJWT`.
     */
    constructor() {
        super();
    }
}

/**
 * Configure the router for the ForeverAlone app.
 * Delegates to `_Fo_AppRouter.configure`.
 * @type {Function}
 */
ForeverAlone.configure = ({ appShell, loadTime, pagesRef, middlewares })=>{
     config = { loadTime: loadTime, pagesRef: pagesRef, middlewares: middlewares }

     if(appShell){
        _Fo_AppShell.setFragment(appShell);
        config.appShell = _Fo_AppShell;
     }

    _Fo_AppRouter.configure(config);
} 

/**
 * Initialize the router for the ForeverAlone app.
 * Delegates to `_Fo_AppRouter.initApp`.
 * @type {Function}
 */
ForeverAlone.initApp = () => {
    // Construct the base URL
    let defaultAppUrl = window.location.href.split("/");
    const removePart = defaultAppUrl.indexOf(".html");
    if (removePart > -1) {
        defaultAppUrl.splice(removePart, 1);
    }
    const baseUrl = defaultAppUrl.join("/");
    ForeverAlone.debug("info", `Default App URL: ${baseUrl} (from window.location.href)`)
    // Backup the original fetch function
    const defaultFetchApi = window.fetch;

    // Override fetch
    window.fetch = (input, init) => {
        let url = typeof input === "string" ? input : input.url;

        // Resolve relative URLs
        if (url.indexOf("http") === -1 && (url.startsWith("/") || url.startsWith("./"))) {
            url = `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
            if (typeof input === "string") {
                input = url;
            } else {
                input = new Request(url, input);
            }
        }

        // Call the original fetch function
        return defaultFetchApi(input, init);
    };

    // Initialize the app router
    _Fo_AppRouter.init();
};

/**
 * Add middleware to the ForeverAlone app.
 * Delegates to `_Fo_AppRouter.use`.
 * @type {Function}
 */
ForeverAlone.use = _Fo_AppRouter.use;

/**
 * Register HTTP methods for the app.
 * Delegates to `_Fo_AppRouter.registeredMethods`.
 * @type {Function}
 */
ForeverAlone.registerMethods = _Fo_AppRouter.registeredMethods;

/**
 * Extend the app's lifecycle methods.
 * Delegates to `_Fo_AppRouter.executeLifeCycle`.
 * @type {Function}
 */
ForeverAlone.extendLifeCycle = _Fo_AppRouter.executeLifeCycle;

/**
 * Application variables or arguments for ForeverAlone app.
 * Delegates to `_Fo_AppRouter.args`.
 * @type {Object}
 */
ForeverAlone.appVar = _Fo_AppRouter.args;

/**
 * Add middleware function to the app.
 * @param {Function} middleware - Middleware function to execute during routing.
 * @throws {Error} Throws an error if the middleware is not a function.
 */
ForeverAlone.useMiddleware = (middleware) => {
    if (typeof middleware == "function") {
        _Fo_AppRouter.middlewares.push(middleware);
    } else {
        throw new Error("Invalid middleware: Expected a function.");
    }
};

/**
 * Add routes to the application using depth-first search.
 * @param {Array<Object>} routes - Array of route objects.
 * @param {string} routes[].key - Unique identifier for the route.
 * @param {string} routes[].path - URL path for the route.
 * @param {Array<Object>} [routes[].children] - Nested child routes.
 * @param {Object} [routes[].props] - Additional properties for the route.
 * @param {Object} [routes[].headers] - Optional HTTP headers for the route.
 * @param {string} [routes[].method] - HTTP method for the route.
 * @param {Object} [routes[].body] - Request body for the route.
 */
ForeverAlone.addRoutes = (routes) => {
    ForeverAlone.dfs({
        node: routes,
        predicates: [
            /**
             * Process individual routes.
             * @param {Object} node - Current route node.
             */
            (node) => {
                if (node?.path && node.key) {
                    let road = new _Fo_AppRoute(node);
                    _Fo_AppRouter.addRoute(road);
                } else ForeverAlone.debug(
                    "warn", `Invalid route: ${JSON.stringify(node)}`
                );
            },
            /**
             * Process child routes.
             * @param {Object} node - Current route node.
             */
            (node) => {
                if (node?.children) {
                    let children = node.children;
                    if (Array.isArray(children)) {
                        // Filter to keep valid shaped subroutes
                        children = children.filter((child) => {
                            if (child.key) {
                                return true;
                            } else {
                                this.debug(
                                    "warn", `Invalid children: ${JSON.stringify(children)}, skipped in execution`
                                );
                                return false;
                            }
                        });

                        // Tweak the child props based on the parent
                        children = children.map((child) => {
                            if (!child.path || child.path == null ) child.path = node.path;
                            child.key = `${node.key.replace(/\/$/, '')}/${child.key.replace(/^\//, '')}`;
                            child.props = { ...child?.props, ...node?.props };
                            return child;
                        });

                        return children;
                    } else {
                        this.debug(
                            "warn", `Invalid children: ${JSON.stringify(children)}`
                        );
                    }
                }
            },
        ],
    });
};  

/**
 * @purpose :
 *  Convert enhanced route declaration syntax 
 *  to the format that can be used by the router.
 * 
 * @from 
 * ForeverAlone.initRoutes({
 *   "/home": () => renderHome(),
 * });
 *
 *  function renderHome() {
 *       return {
 *          title: "ForeverAlone.home",
 *          content: "/doc/home.html",
 *           option: {
 *               method: "post",
 *               header: { token: "Bearer ..." },
 *               props: {
 *                   state: {}
 *               }
 *           },
 *           middleware: [
 *               () => {
 *                   if (!isUserLoggedIn) {
 *                       ForeverAlone.navigate("/login");
 *                       return false;
 *                   }
 *                   return true;
 *               }
 *           ],
 *           children: {
 *               "/u": () => _renderU(),
 *               "/:articleId": () => _renderArticleWithID()
 *           }
 *       };
 *   }
 *
 *   function _renderU() {
 *       return {
 *           title: "ForeverAlone.u",
 *           content: "/doc/u.html",
 *           option: {
 *               method: "get",
 *               header: { token: "Bearer ..." },
 *               props: {
 *                   state: {}
 *               }
 *           }
 *       };
 *  }
 *
 *   function _renderArticleWithID() {
 *       return {
 *           title: "ForeverAlone.article",
 *           option: {
 *               props: {
 *                   state: {}
 *               }
 *           },
 *           children: {
 *               "/:deprecated": () => _renderIsDeprecatedArticle()
 *           }
 *       };
 *   }
 *
 *   function _renderIsDeprecatedArticle() {
 *       return {
 *           title: "ForeverAlone.isDeprecated",
 *           path: "/doc/whoops.html",
 *           option: {
 *               method: "get",
 *               header: { token: "Bearer ..." },
 *               props: {
 *                   state: {}
 *               }
 *           }
 *       };
 *   }
 *
 *  @to 
 *
 *   let routes = [
 *       { key: "/home", path: "home-path", ...option, children:[
 *           { key: "/u", path: "u-path", ...option, children: [] },
 *           { key: `/:article type:${type}`, path: "home-path", ...option, children: [
 *               { key: "deprecated", path: "deprecated-path", ...option, children: [] }
 *           ] }
 *       ]}
 *  ]
 * 
 *  ForeverAlone.addRoutes (routes)
 * */
ForeverAlone.routeTransformer = (routes) => {

    let result = [];

    let nodes = Object.keys(routes);
    nodes
        .forEach(node => {
            if (typeof routes[node] == "function") {
                routes[node] = routes[node]();
            }
            
            routes[node].key = routes[node].type ? `${node} type:${routes[node].type}` : node;
            routes[node] = { ...routes[node], ...( routes[node].option || {} ) }

            if(routes[node].content){
                routes[node].path = routes[node].content;
            } 

            delete routes[node].type;
            delete routes[node].option;
            delete routes[node].content;

            if(routes[node].children){
                routes[node].children = parseRoutes(routes[node].children);
            }
            result.push(routes[node]);
        }
    )

    return result;
}

ForeverAlone.initRoutes = (routes) =>
    {
    ForeverAlone.addRoutes(
        ForeverAlone.routeTransformer(routes)
    )
}

_Fa_DebugHelper.toggleDebugAllTrue()

