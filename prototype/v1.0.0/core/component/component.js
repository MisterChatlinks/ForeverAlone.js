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
            _Fa_DebugHelper.debugLogs({
                ref: this.debug,
                type: "info",
                message: "_Fo_Component configured, initializing parsing and placeholder interpretation."
            });

            this.children = childrenTag;
            this.parseComponent();
            this.buildComponent();
            this.HandleGetComponentTag();
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
        _Fa_DebugHelper.debugLogs({
            ref: this.debug,
            type: "info",
            message: `==> Begin parsing by DFS on _Fo_Component ${this.node.nodeName}`
        });

        _Fa_DFSHelper({
            node,
            predicates: [
                (stack, current) => {
                    if (current?.getAttribute) {
                        _Fa_DebugHelper.debugLogs({
                            ref: this.debug,
                            type: "debug",
                            message: `==> Parsing by DFS, current node ${current.nodeName}`
                        });

                        current.innerHTML = new _Fo_Component_PlaceholderParser({
                            nodeOrigin: this.node,
                            node: current,
                            content: current.innerHTML
                        });

                        _Fa_DebugHelper.debugLogs({
                            ref: this.debug,
                            type: "debug",
                            message: `==> Parsing by DFS, current result ${this.node.innerHTML}`
                        });
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

        _Fa_DebugHelper.debugLogs({
            ref: this.debug,
            type: "info",
            message: `==> Parsing by DFS ended on _Fo_Component ${this.node.nodeName}`
        });
    }

    /**
     * Builds the component by setting up event listeners and a mutation observer.
     */
    buildComponent() {
        this.traverseAndSetPseudoEvent();

        _Fa_DebugHelper.debugLogs({
            ref: this.debug,
            type: "info",
            message: `Binding MutationObserver on ${this.node.nodeName}`
        });

        this.node.addEventListener(
            "node-builded",
            () => {
                const observer = new MutationObserver(() => {
                    _Fa_DebugHelper.debugLogs({
                        ref: this.debug,
                        type: "info",
                        message: `Mutation detected in _Fo_Component ${this.node.nodeName}, re-executing traverseAndSetPseudoEvent.`
                    });

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
        _Fa_DebugHelper.debugLogs({
            ref: this.debug,
            type: "info",
            message: `Parsing _Fo_Component ${this.node.nodeName} to Common HTML`
        });

        const childCopy = this.children.cloneNode(true);
        const childNodes = Array.from(childCopy.childNodes);

        this.node.innerHTML = "";
        childNodes.forEach((child) => this.node.appendChild(child));

        _Fa_DebugHelper.debugLogs({
            ref: this.debug,
            type: "success",
            message: `Parsing _Fo_Component ${this.node.nodeName} to Common HTML completed`
        });
    }

    /**
     * Traverses and sets up pseudo-events for child nodes using DFS.
     * @param {HTMLElement} [node=this.node] - Node to start traversal from.
     */
    traverseAndSetPseudoEvent(node = this.node) {
        if (!node) return;

        _Fa_DebugHelper.debugLogs({
            ref: this.debug,
            type: "info",
            message: "==> Begin Event Binding & Ignition of _Fo_Component Children by DFS"
        });

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

        _Fa_DebugHelper.debugLogs({
            ref: this.debug,
            type: "success",
            message: "==> Event Binding & Ignition of _Fo_Component Children by DFS completed"
        });
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
        _Fa_DebugHelper.debugLogs({
            ref: this.debug,
            type: "warn",
            message: `getTag called for tagname: ${tagname}, result: ${result ? "found" : "not found"}.`
        });
        return result || null;
    }

    // Static component property names
    static componentProperty = ["props", "methods", "eventMethods"];

    // Instance-specific component properties
    componentProperty = _Fo_Component_Config.componentProperty;

    /**
     * Retrieves attributes for each component property and stores them in the instance.
     */
    getProperty() {
        _Fa_DebugHelper.debugLogs({
            ref: this.debug,
            type: "debug",
            message: "Fetching component properties..."
        });

        this.componentProperty.forEach((property) => {
            const tag = _Fa_getTag({ node: this.node, tagname: property });
            const value = tag?.getAttributeNames() || [];
            this[`${property}Names`] = value;
            this.node[property] = {};

            _Fa_DebugHelper.debugLogs({
                ref: this.debug,
                type: "debug",
                message: `Property: ${property}, Attributes: ${JSON.stringify(value)}.`
            });
        });
    }

    /**
     * Assigns parsed property values to the node's property object.
     */
    setProperty() {
        _Fa_DebugHelper.debugLogs({
            ref: this.debug,
            type: "debug",
            message: "Setting component properties..."
        });

        this.componentProperty.forEach((property) => {
            this[`${property}Names`].forEach((propName) => {
                const tag = _Fa_getTag({ node: this.node, tagname: property });
                const value = tag?.getAttribute(propName);
                this.node[property][propName] = this.parseProperty(value);

                _Fa_DebugHelper.debugLogs({
                    ref: this.debug,
                    type: "debug",
                    message: `Set property: ${propName}, Value: ${value}.`
                });
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
            message: `Parsing property: ${property}, Detected format: ${isJSON ? "JSON" : isArrowFunc ? "Arrow Function" : isArrayString ? "Array String" : "Unknown"
                }.` // Log the detected format
        });

        if (isJSON) {
            try {
                return JSON.parse(props); // Parse as JSON
            } catch (e) {
                _Fa_DebugHelper.debugLogs({
                    ref: this.debug,
                    type: "error",
                    message: `JSON parsing failed for property: ${property}, error: ${e}.`
                });
                return null;
            }
        } else if (isArrowFunc) {
            try {
                return new Function("props", `return (${props})(props);`);
            } catch (e) {
                _Fa_DebugHelper.debugLogs({
                    ref: this.debug,
                    type: "error",
                    message: `Arrow function execution failed for property: ${property}, error: ${e}.`
                });
                return null;
            }
        } else if (isArrayString) {
            try {
                return JSON.parse(props); // Parse the array string into an actual array
            } catch (e) {
                _Fa_DebugHelper.debugLogs({
                    ref: this.debug,
                    type: "error",
                    message: `Array string parsing failed for property: ${property}, error: ${e}.`
                });
                return null;
            }
        }

        _Fa_DebugHelper.debugLogs({
            ref: this.debug,
            type: "error",
            message: `Invalid property format detected for: ${property}.`
        });

        return null;
    }

}

class _Fo_Component_LifecycleInterpreter {
    debug = _Fa_DebugHelper.debugReference("_Fo_Component_LifecycleInterpreter");

    constructor({ node }) {

        _Fa_DebugHelper.debugLogs({
            ref: this.debug,
            type: "info",
            message: "Initializing _Fo_Component's Lifecycle Interpretation..."
        })

        this.node = node;

        _Fa_DebugHelper.debugLogs({
            ref: this.debug,
            type: "success",
            message: "Initialization of _Fo_Component's Lifecycle ended successfully"
        })

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
            _Fa_DebugHelper.debugLogs({
                ref: this.debug,
                type: "log",
                message: `==> _Fo_Component_PlaceholderParser placeholderParser called with empty value`,
            })
            return value;
        }

        // Split the content at HTML tags while excluding placeholders inside {{ }}
        const regex = /<\/?\w+[^>]*>(?=(?:(?!(?:{{[^}]*}}))<\/?\w+[^>]*>)*$)/g;
        const parts = value.split(regex);

        _Fa_DebugHelper.debugLogs({
            ref: this.debug,
            type: "log",
            message: `==> _Fo_Component_PlaceholderParser placeholderParser called with splitted value ${parts} }`
        });

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
                            _Fa_DebugHelper.debugLogs({
                                ref: this.debug,
                                type: "log",
                                message: `==> _Fo_Component_PlaceholderParser placeholderParser called with code ${code}\nresult: ${result}`
                            });
                            return result;
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
                    _Fa_DebugHelper.debugLogs({
                        ref: this.debug,
                        type: "log",
                        message: `==> _Fo_Component_PlaceholderParser placeholderParser called with code ${code}\nresult: ${result}`
                    });
                    return result;
                })));
            } else if (trimmedPart.length > 0) {
                // Plain text
                output.push(String(trimmedPart));
            }
        }

        // Log and return final processed output
        const finalOutput = output.join("");
        _Fa_DebugHelper.debugLogs({
            ref: this.debug,
            type: "debug",
            message: `Final Processed Output: ${finalOutput}`
        });

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

        _Fa_DebugHelper.debugLogs({
            ref: this.debug,
            type: "debug",
            message: `Replacing placeholder in ${this.node.nodeName} with content: ${this.content}`
        });

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

                        _Fa_DebugHelper.debugLogs({
                            ref: this.debug,
                            type: "debug",
                            message: `Invoking method ${methodName} with args: ${args.trim() === '' ? '(no argument passed)' : args}`
                        });

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

                        _Fa_DebugHelper.debugLogs({
                            ref: this.debug,
                            type: "debug",
                            message: `Invoking forDataIn with data: ${data} and template: ${template}`
                        });

                        if (Array.isArray(data)) {
                            return data.map((item) => template.replace(/value\.(\w+)/g, (_, key) => item[key] || "")).join("");
                        }
                    }
                    throw new Error(`Invalid forDataIn expression: ${expression}`);
                }
                // Default case: Fallback if no known placeholder structure
                return this.evaluateExpression(expression);
            } catch (err) {
                _Fa_DebugHelper.debugLogs({
                    ref: this.debug,
                    type: "error",
                    message: `Error evaluating placeholder "${expression}": ${err.message}`,
                });
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
            _Fa_DebugHelper.debugLogs({
                ref: this.debug,
                type: "warn",
                message: `Error evaluating expression "${expression}" : ${err.message}`,
            });
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

    _Fa_DebugHelper.debugLogs({
        ref: debug,
        type: condition == true ? "log" : "warn",
        message: `helper func _Fa_getTag called for node "${node.nodeName}", child to find "${tagname}" \nresult: ${condition == true ? "found" : "not found"}`
    });

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

/*<=========================================================== Debugging Helper Class ============================================================>>*/


class _Fa_DebugHelper {
    static #debugStack = {};
    static #debugRegistered = [];
    static debugTrace = false;
    static #traceable = {};

    static debugReference(at) {
        if (!at) at = "Unknown";
        if (!this.#debugStack[at]) {
            this.#debugStack[at] = false;
            this.#debugRegistered.push(at);
        };
        return at;
    }

    static traceOn() {
        this.debugTrace = true;
    }

    static isTraceable(target) {
        if (typeof target === "string") {
            this.#traceable[target] = true;
        } else if (Array.isArray(target)) {
            target.forEach((item) => {
                this.#traceable[item] = true;
            });
        }
    }

    static debugLogs({ ref, type, message }) {
        if (this.#debugStack[ref] === true) {
            const style = _Fa_DebugHelper_Styles.styles[type] || _Fa_DebugHelper_Styles.styles["log"];
            const debugMode = this.debugTrace && this.#traceable[ref] ? "trace" : "log";

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
                    console[debugMode](`%c${message}`, style);
                    break;
                default:
                    console.log(`%c${message}`, style);
            }
        }
    }

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

class _Fa_DebugHelper_Styles {
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
    {ref: "_Fo_AppRoute_UrlParameter", debug: true, trace: false}
];


_Fa_UseDebugHelper(debuggable);