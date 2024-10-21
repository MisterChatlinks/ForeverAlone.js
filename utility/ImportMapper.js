/**
 * Class responsible for loading and mapping imports dynamically.
 * This class fetches a JSON file containing import information and sets
 * up the imports on the window object for later use.
 * 
 * 
 *  * The JSON format should be:
 * {
 *   "key1": [import-function-name, alias-for-file, path],
 *   "key2": [import-function-name, alias-for-file, path],
 *   ...
 * }
 * 
 * imported file can be use by 'imports.functionName'
 * @warning
 * 
 *    this work in async so if you call imports.functionName, i might say undefiened, 
 *    so use the Wait class to couter this problem
 * 
 * @example
 *    const waitForModules = new Wait();
 *    waitForModules.allModule(() => {
 *      console.log('All modules are loaded!');
 *    });
 * 
 *    waitForModules.specificModule('moduleName1,moduleName2', () => {
 *      console.log('Specific module is loaded!');
 *    });
 * 
 * @author MisterChatlinks   
 */
class ImportMapper {
    /**
     * Constructor to initialize the ImportMapper with the source of the import map.
     * @param {string} mapOrigin - The URL or path to the JSON file containing the import map.
     */
    constructor(mapOrigin) {
        /** @type {string} */
        this.mapOrigin = mapOrigin;

        /** @type {Object|null} */
        this.imports = null;

        // Call the initialization process
        this.init();
    }

    /**
     * Fetch the import map from a JSON file asynchronously.
     * @returns {Promise<Object>} - A promise that resolves to the parsed import map object.
     */
    async getImportMap() {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', this.mapOrigin, true);
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    let importMap = JSON.parse(xhr.responseText);
                    resolve(importMap);
                } else {
                    reject(new Error('Failed to load import map.'));
                }
            };
            xhr.onerror = () => reject(new Error('XHR Request failed.'));
            xhr.send();
        });
    }

    /**
     * Load the imports by fetching the import map and storing it in the instance.
     * This method is asynchronous and logs the imports to the console once loaded.
     */
    async loadImports() {
        try {
            this.imports = await this.getImportMap();
            console.log(this.imports);
        } catch (error) {
            console.error('Error loading imports:', error);
        }
    }

    /**
     * Sets up the import map and import statements on the window object.
     * This method will create script elements for the import map and dynamically load
     * the specified modules as per the import map.
     */
    setImportMap() {
        if (window?.imports) return;

        // Create and append the import map script
        const mapScript = document.createElement('script');
        mapScript.type = 'importmap';
        mapScript.textContent = JSON.stringify({
            imports: Object.fromEntries(
                Object.values(this.imports).map(([_, alias, path]) => [alias, path])
            ),
        });
        document.head.appendChild(mapScript);

        // Create and append the import statements script
        const importScript = document.createElement('script');
        let importStmt = '';
        for (let imp in this.imports) {
            const [names, alias, path] = this.imports[imp];
            if (names.includes(',')) {
                let funcNames = names.split(',').map(name => name.trim()).join(', ');
                importStmt += `import { ${funcNames} } from '${path}';\n`;
            } else {
                importStmt += `import ${names} from '${path}';\n`;
            }
        }

        importStmt += `if (!window.imports) {
                           window.imports = {};
                       }\n`;

        for (let imp in this.imports) {
            const [names, alias, path] = this.imports[imp];
            if (names.includes(',')) {
                let funcNames = names.split(',');
                importStmt += `${funcNames.map(name => `window.imports.${name.trim()} = ${name.trim()};`).join('\n')}`;
            } else {
                importStmt += `window.imports.${names} = ${names};\n`;
            }
        }

        importStmt += `window.imports.impState = 'done';`;

        importScript.textContent = importStmt;
        importScript.type = 'module';
        document.head.appendChild(importScript);
        console.log(importStmt);
    }

    /**
     * Initialize the import mapper by first loading the imports, then setting
     * up the import map and statements.
     */
    async init() {
        await this.loadImports(); // Load imports first
        this.setImportMap(); // Set the import map and import statements
    }
}

/**
 * Class providing methods to wait for all or specific modules to load.
 * Useful when modules are dynamically loaded and need to be accessed at a later time.
 */
class Wait {
    /**
     * Wait for all modules in the import map to be loaded before executing the callback.
     * @param {Function} callback - A callback function to execute once all modules are loaded.
     */
    allModule(callback) {
        if (window?.imports?.impState) {
            return callback();
        }

        // Recursively check until the imports are loaded
        setTimeout(() => {
            this.allModule(callback);
        }, 100);
    }

    /**
     * Wait for specific modules to be loaded before executing the callback.
     * @param {Array<string>} list - An array of module names to check.
     * @param {Function} callback - A callback function to execute once all specified modules are loaded.
     */
    findSomeModules(list, callback) {
        let counter = 0;

        // Check each module in the list
        list.forEach(module => {
            if (!window?.imports?.[module]) {
                counter++;
            }
        });

        // If all modules are loaded, execute the callback; otherwise, check again
        if (counter === list.length) {
            setTimeout(() => this.findSomeModules(list, callback), 100);
        } else {
            callback();
        }
    }

    /**
     * Wait for a specific module to be loaded before executing the callback.
     * @param {string} modName - The name of the module to wait for.
     * @param {Function} callback - A callback function to execute once the specific module is loaded.
     */
    specificModule(modName, callback) {
        if (modName.includes(',')) {
            const names = modName.split(',').map(name => name.trim()).filter(name => name !== "");
            this.findSomeModules(names, callback); // Use findSomeModules for multiple modules
        } else {
            if (window?.imports?.[modName]) {
                return callback();
            }
            // Recursively check until the specific module is loaded
            setTimeout(() => {
                this.specificModule(modName, callback);
            }, 100);
        }
    }
}

// Usage example
const waitForModules = new Wait();
waitForModules.allModule(() => {
    console.log('All modules are loaded!');
});

// waitForModules.specificModule('moduleName', () => {
//     console.log('Specific module is loaded!');
// });

window.wait = Wait;
window.ImportMapper = ImportMapper;
