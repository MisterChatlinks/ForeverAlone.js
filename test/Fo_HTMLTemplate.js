/**
 * @info
 * 
 * Represents an HTTP request configuration.
 * 
 * This type defines the structure of an HTTP request configuration object,
 * which includes the URL, HTTP method, and headers for the request.
 * 
 * @typedef {Object} HttpRequestConfig
 * @property {string} url - The URL to which the request will be made.
 * @property {("GET"|"POST"|"PUT"|"DELETE")} method - The HTTP method to use for the request. It must be one of: "GET", "POST", "PUT", or "DELETE".
 * @property {Object} header - The headers for the request. This is an object that can include various HTTP headers.
 * 
 * @example
 * const requestConfig = {
 *     url: 'https://api.example.com/resource',
 *     method: 'GET',
 *     header: { 'Authorization': 'Bearer token' }
 * };
 * 
 * The data origin can be an empty object or an array of HTTP request configurations.
 * This defines where and how data should be fetched from, either through static data
 * or by sending HTTP requests as specified in `HttpRequestConfig[]`.
 * 
 * @type {{} | HttpRequestConfig[]}
 * 
 * @example
 * // Data Origin as an Array of HTTP Request Configurations
 * const dataOrigin = [
 *     { url: 'https://api.example.com/resource', method: "GET", header: {} },
 *     { url: 'https://api.example.com/resource', method: "POST", header: { 'Content-Type': 'application/json' } },
 *     { url: 'https://api.example.com/resource', method: "PUT", header: { 'Authorization': 'Bearer token' } },
 *     { url: 'https://api.example.com/resource', method: "DELETE", header: {} }
 * ];
 * 
 * // Data Origin as an Empty Object
 * const emptyDataOrigin = {};
 * 
 * @documentation 
 * 
 * Class to handle HTML template rendering and dynamic data fetching.
 * 
 * This class allows you to render HTML templates with dynamic data. It fetches
 * data from specified sources (either static objects or via HTTP requests) and
 * interpolates the data into the HTML template.
 */
class _Fo_HTMLTemplate {
    /**
     * Creates an instance of the template handler.
     * 
     * @param {Object} params - The parameters to initialize the template.
     * @param {string} params.content - The HTML template to be rendered.
     * @param {Array|Object} [params.dataOrigin=[]] - The source of data for the template, either an array of HTTP request configurations or a static object.
     */
    constructor({ content, dataOrigin = [] }) {
        this.content = content;
        this.dataOrigin = dataOrigin;
        this.data = { _fo_test: "_Fo_HTMLTemplate testing data" }; // Default test data
    }

    /**
     * Interprets placeholders in the HTML template and evaluates the associated expressions.
     * 
     * This method searches for placeholders in the form `{{ ... }}` within the template,
     * and evaluates the JavaScript code inside the brackets. The result is then injected
     * into the final HTML string.
     * 
     * @param {string} HTMLTemplate - The HTML template string containing placeholders.
     * @returns {string} - The rendered HTML template with evaluated placeholders.
     * @throws {Error} Throws an error if the argument is not a string.
     * 
     * @example
     * const renderedTemplate = template.interpretCode('Hello, {{name}}!');
     * // If `this.data.name = "Alice"`, the result will be: 'Hello, Alice!'
     */
    interpretCode(HTMLTemplate) {
        const codeRegex = /\{\{(.*?)\}\}/g;
    
        if (typeof HTMLTemplate !== "string") {
            throw new Error("interpretCode() expects a string as argument.");
        }
    
        return HTMLTemplate.replace(codeRegex, (match, code) => {
            // Trim and handle the code block
            const trimmedCode = code.trim();
    
            // Check for fallback pattern using || (e.g., {{ key || "default" }})
            if (/\w+\s*\|\|/.test(trimmedCode)) {
                try {
                    const [key, fallback] = trimmedCode.split(/\|\|/).map(str => str.trim());
                    const value = this.data[key]; // Try to fetch the key from data
                    return value !== undefined ? value : fallback.replace(/'|"/g,""); // Use fallback if key doesn't exist
                } catch (error) {
                    console.error(`Error processing fallback expression: ${trimmedCode}`, error);
                    return ""; // Return an empty string on failure
                }
            }
    
            // Default execution path (for expressions)
            try {
                const func = new Function("data", `with ({...data}) { return (${trimmedCode}); }`);
                return func(this.data); // Safely execute the code with scoped data
            } catch (error) {
                console.error(`Error evaluating: ${trimmedCode}`, error);
                return ""; // Return an empty string on failure
            }
        });
    }
    
    /**
     * Helper function to send an HTTP request.
     * 
     * This method sends an HTTP request using `XMLHttpRequest` with the specified
     * URL, method, and headers. It returns a promise that resolves with the response
     * or rejects with an error.
     * 
     * @param {Object} params - The request parameters.
     * @param {string} params.url - The URL for the request.
     * @param {Object} [params.header={}] - The headers to include in the request.
     * @param {("GET"|"POST"|"PUT"|"DELETE")} params.method - The HTTP method to use.
     * @returns {Promise} - A promise that resolves with the response text or rejects with an error.
     * 
     * @example
     * const response = await selfHttpHelper({ url: 'https://api.example.com', method: 'GET' });
     * console.log(response); // Response text from the server.
     */
    async selfHttpHelper({ url, header = {}, method }) {
        return await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url, true);
            Object.keys(header).forEach(key => {
                xhr.setRequestHeader(key, header[key]);
            });
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.responseText);
                } else {
                    reject(new Error(`HTTP Error: ${xhr.status} - ${xhr.statusText}`));
                }
            };
            xhr.onerror = function () {
                reject(new Error("Network error occurred"));
            };
            xhr.send();
        });
    }

    /**
     * Fetches data from the configured `dataOrigin` and merges the results into `this.data`.
     * 
     * This method handles both static objects and HTTP requests. If the `dataOrigin`
     * is an array, it will send multiple HTTP requests and merge their responses.
     * 
     * @param {Array|Object} [dataOrigin=this.dataOrigin] - The source of data. This can either be an array of HTTP request configurations or a static object.
     * @returns {Promise} - A promise that resolves when all data has been fetched and merged.
     * @throws {Error} - Throws an error if `dataOrigin` is neither an array nor an object.
     * 
     * @example
     * await template.getDataFrom();
     * // Merges fetched data from HTTP requests or static data into `this.data`.
     */
    async getDataFrom(dataOrigin = this.dataOrigin) {
        if (Array.isArray(dataOrigin)) {
            try {
                const responses = await Promise.all(
                    dataOrigin.map(item => {
                        if (item.url && item.method) {
                            return this.selfHttpHelper(item).then(JSON.parse).catch(error => {
                                console.error("Error fetching data:", error);
                                return {};
                            });
                        } else {
                            return item; // Return static object
                        }
                    })
                );

                // Merge all responses into `this.data`
                responses.forEach(response => {
                    if (typeof response === "object") {
                        this.data = { ...this.data, ...response };
                    }
                });
            } catch (error) {
                console.error("Error in getDataFrom:", error);
            }
        } else if (typeof dataOrigin === "object") {
            this.data = { ...this.data, ...dataOrigin };
        } else {
            throw new Error("getDataFrom() expects an object or an array of objects as argument.");
        }
    }

    /**
     * Renders the template with the current data.
     * 
     * This method ensures that all data is fetched before rendering the template.
     * It uses the `interpretCode` method to process placeholders and returns
     * the final rendered HTML.
     * 
     * @param {string} [content=this.content] - The HTML template content to render.
     * @returns {Promise<string>} - A promise that resolves to the rendered HTML string.
     * 
     * @example
     * const renderedHtml = await template.render();
     * // Returns the HTML with placeholders replaced by dynamic data.
     */
    async render(content = this.content) {
        await this.getDataFrom(); // Ensure data is fetched before rendering
        let template = this.interpretCode(content);
        template = new _Fo_HTMLTemplate_NodeBuilder(template);
        template = new _Fo_HTMLTemplate_TreeToHtml(template);
        return template;
    }
}

class _Fo_HTMLTemplate_NodeBuilder {
    constructor(HTMLTemplate) {
        this.stack = [];
        this.tree = {};
        return this.buildNodes(HTMLTemplate)
    }

    /**
     * Helper function to create a new node 
     */
    createNode(tag, attr) {
        return {
            tagName: tag,
            attributes: attr,
            children: [],
            parent: null
        };
    }

    // Method to build nodes from a template
    buildNodes(HTMLTemplate) {
        const nodeRegexConstructor = /(<[a-zA-Z0-9]+(?:\s+[a-zA-Z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'))*\s*\/?>)|(<\/[a-zA-Z0-9]+>)/g;
        HTMLTemplate = HTMLTemplate.trim().split(nodeRegexConstructor).filter(Boolean);
        return this.createASP(HTMLTemplate);
    }

    // Create the AST (Abstract Syntax Tree) from the node array
    createASP(array) {
        let stack = [];
        let current = () => stack[stack.length - 1];
        let previous = () => stack.length > 1 ? stack[stack.length - 2] : null;

        let regexStartNode = /<([a-zA-Z0-9]+)(?:\s+[^<>]*?)?>/; // Matches opening tags with optional attributes
        let regexEndNode = /<\/([a-zA-Z0-9]+)>/; // Matches closing tags
        let regexSelfClosing = /<([a-zA-Z0-9]+)(.*?)(\/>)/

        let regexNodeName = /<([a-zA-Z0-9_-]+)\s*/;
        let regexNodeAttr = /([a-zA-Z0-9_-]+)\s*=\s*["']([^"']+)["']/g; // Matches all attributes as key-value pairs

        array.forEach((item, index) => {
            let caseIndex;

            if (item.match(regexStartNode) && !item.match(regexSelfClosing)) {
                caseIndex = "openingTag";
            } else if (item.match(regexSelfClosing)) {
                caseIndex = "selfClosingTag";
            } else if (item.match(regexEndNode)) {
                caseIndex = "closingTag";
            } else {
                caseIndex = "textNode";
            }

            switch (caseIndex) {
                case "openingTag":
                    let tag = item.match(regexNodeName)[1]; // Extract tag name
                    let attr = item.match(regexNodeAttr);

                    if (attr != null) {
                        attr = attr.map(attribute => {
                            let attributeParts = attribute.split("=").map(val => val.trim());
                            return { [attributeParts[0]]: attributeParts[1].trim().replace(/^"|"$|^'|\'$/g, "") };
                        });
                    }

                    let node = this.createNode(tag, attr);
                    stack.push(node);

                    if (index === 0) {
                        this.tree = node; // First node is the root
                    }

                    if (previous()) {
                        previous().children.push(node);
                        node.parent = previous(); // Set parent-child relationship
                    }
                    break;

                case "selfClosingTag":
                    let tag2 = item.match(regexNodeName)[1];
                    let attr2 = item.match(regexNodeAttr);

                    if (attr2 != null) {
                        attr2 = attr2.map(attribute => {
                            let attributeParts = attribute.split("=").map(val => val.trim());
                            return { [attributeParts[0]]: attributeParts[1].trim().replace(/^"|"$|^'|\'$/g, "") };
                        });
                    }

                    let node2 = this.createNode(tag2, attr2);
                    if (current()) current().children.push(node2);
                    break;

                case "closingTag":
                    stack.pop(); // End the current node
                    break;

                case "textNode":
                    let parent = current()?.children;
                    if (parent) parent.push(item); // Add text node as child
                    break;

                default:
                    console.error("Unhandled case:", caseIndex);
            }
        });

        return this.tree;
    }
}

class _Fo_HTMLTemplate_TreeToHtml {
    constructor(tree) {
        this.tree = tree;
        return this.convertToHtmlNode();
    }
    convertToHtmlNode(tree = this.tree) {
        if (tree == null) return null;

        let htmlNode;

        typeof tree !== "string"
            ? htmlNode = document.createElement(tree.tagName)
            : htmlNode = document.createTextNode(tree)

        if (tree?.attributes) {
            console.log(tree.attributes)
            tree.attributes.forEach(attr => {
                Object.keys(attr).forEach(key => htmlNode.setAttribute(key, attr[key]));
            })
        }

        if (tree?.children) {
            tree.children.forEach(child => {
                let childHtmlNode = this.convertToHtmlNode(child);
                htmlNode.appendChild(childHtmlNode);
            })
        }
        return htmlNode;
    }
}

// // Initialize template with content that includes placeholders
// const template = new _Fo_HTMLTemplate({
//     content: 'Hello, [[ _fo_test }} !'
// });

// // Test interpreting the template with the default data
// const result = template.interpretCode(template.content);
// console.log(result); // Expected output: 'Hello, _Fo_HTMLTemplate testing data!'

// // Example of usage:
// const HTMLTemplate = '<div class="container"><p>Hello World</p><img src="image.jpg" /></div>';
// console.log(new _Fo_HTMLTemplate_NodeBuilder(HTMLTemplate))
// console.log(
//     new _Fo_HTMLTemplate_TreeToHtml(
//         new _Fo_HTMLTemplate_NodeBuilder(HTMLTemplate)
//         )
// )

const sanitizeHTML = (html) => {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
};


const newTemplate = new _Fo_HTMLTemplate({
    content: `<h1> Hello, my name is {{ myName || 'great' }} 
                <br/>
                    I am from {{ myCountry }} 
                <br/>
                    I am {{ myAge }} years old {{ myAge < 20 ? 'i am a minor' : 'i am a major' }} so {{ canDrink(myAge) }} {{ setUl(myAge) }}
                <br/>
                    My favorite color is {{ myColor }} 
                <br/>
                    My favorite food is {{ myFood || 'pasta' }}
                <br/>
                <button onclick="console.log(\`clicked\`)">click me</button>
              </h1>`,
    dataOrigin: [{
        myCountry: 'Ivory',
        myAge: 19,
        myColor: 'purple-blue',
        canDrink: (age) => {
            return age >= 18 ?
                'i can drink' : 'i cannot drink'
        },
        setUl: (myAge) => {
            return myAge > 18
                ? '<ul><li>we can drink at <a href="some bar.html"></li></ul>'
                : ""
        },
        onclick: ()=> {return function call(){alert(this)}}
    }]
});

(async () => {
    const result = await newTemplate.render();
    console.log("Here is your result:", result);
    document.body.appendChild(
        result
    )
})();
