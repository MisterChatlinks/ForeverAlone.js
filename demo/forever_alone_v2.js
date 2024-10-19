// Copyright 2024 Original Author's Github username : tombailey
// Copyright 2024 Rework Author's Github username MisterChatlinks
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

class ForeverAlone {
    // Step 1: Private static instance (only accessible inside the class)
    static #instance = null;

    static signPost = {};
    static config = null;
    static view = null;

    constructor() {
        if (ForeverAlone.#instance) {
            return ForeverAlone.#instance; // Return the existing instance if it already exists
        }
        ForeverAlone.#instance = this;
    }

    // Step 4: Static method to access the singleton instance
    static getInstance() {
        if (!ForeverAlone.#instance) {
            new ForeverAlone(); // Create a new instance if it doesn't exist
        }
        window.addEventListener("hashchange", ForeverAlone.#instance.onHashChanged.bind(ForeverAlone.#instance));
        return ForeverAlone.#instance;
    }

    async init(viewSection, loadViewUrl, errorViewUrl, callback = {} ) {
        let loadViewContent;
        let errorViewContent;
    
        try {
            loadViewContent = await HttpHelper.get(loadViewUrl);
            errorViewContent = await HttpHelper.get(errorViewUrl);
        } catch (error) {
            console.error("Error loading views:", error);
            if (typeof callback.error === "function") {
                callback.error(error);
            }
            return; // Exit if loading views fails
        }
    
        ForeverAlone.view = viewSection;
        ForeverAlone.config = { load: loadViewContent, error: errorViewContent, callback };
    
        if (typeof callback.load === "function") {
            callback.load();
        }
    
        this.onHashChanged(); // 1st call
    }

    // Method to handle hash changes
    onHashChanged() {
        if (typeof ForeverAlone.config.callback.hashChanged !== "function" || !ForeverAlone.config.callback.hashChanged()) {
            const hash = window.location.hash.substr(1);
            const destination = this.findDestinationForHash(hash);
            if (destination == null) {
                this.showErrorView("Hash destination not found.");
            } else {
                let route = ForeverAlone.signPost[destination];
                const matches = hash.match(new RegExp(destination, "i"));
                for (let index = 1; index < matches.length; index++) {
                    const match = matches[index];
                    route = route.replace("{" + (index - 1) + "}", match);
                }

                this.loadView(route);
            }
        }
    }

    findDestinationForHash(hash) {
        for (var destination in ForeverAlone.signPost) {
            var route = ForeverAlone.signPost[destination];

            if (typeof route != "function" && new RegExp(destination, "i").test(hash)) {
                return destination;
            }
        }
        return null;
    }

    changeView(view) {
        // Set the inner HTML of the view
        ForeverAlone.view.innerHTML = view;
    
        // Find and execute all script tags in the new view
        const scripts = ForeverAlone.view.getElementsByTagName('script');
        
        for (let script of scripts) {
            const newScript = document.createElement('script');
            newScript.type = script.type || 'text/javascript'; // Default to 'text/javascript'
            newScript.src = script.src; // If there’s a src, set it
            newScript.text = script.innerHTML; // Set the inner HTML if there's no src
    
            // Append the new script to the body to execute it
            document.body.appendChild(newScript);
        }
    }    

    showErrorView(errorMessage) {
        console.error(errorMessage);
        const error = ForeverAlone.config.error || `Error: ${errorMessage}`;
        this.changeView(error);
    }

    async loadView(route) { // Renamed `toLoad` to `route`
        console.log("Loading view for route:", route);
        this.changeView(ForeverAlone.config.load || "Loading...");

        try {
            const responseText = await HttpHelper.getWithMinTime(route, 1);
            this.changeView(responseText);
        } catch (error) {
            console.error("Error loading view:", error);
            this.showErrorView(error.message); // Pass the error message for context
        }
    }

    add(destination, route) {
        console.log(`Adding ${destination} in ${JSON.stringify(ForeverAlone.signPost)}` );
        ForeverAlone.signPost[destination] = route;
    }
}

class HttpHelper {
    // Helper methods
    static async get(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    }

    static async getWithMinTime(url, minTime) {
        const start = new Date().getTime();

        try {
            const data = await this.get(url);
            const waitTime = this.calculateWaitTime(start, minTime);

            // Wait for the minimum time if necessary
            await this.wait(waitTime);

            return data;
        } catch (error) {
            throw error; // Re-throw for handling in loadView
        }
    }

    static calculateWaitTime(start, minTime) {
        const delta = new Date().getTime() - start;
        const waitTime = (minTime * 1000) - delta;
        return waitTime > 0 ? waitTime : 0;
    }

    static wait(waitTime) {
        return new Promise(resolve => setTimeout(resolve, waitTime));
    }
}
