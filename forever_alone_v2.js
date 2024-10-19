// Copyright 2024 Original Author's Github username : tombailey
// Copyright 2024 Rework Author's Github username : MisterChatlinks
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


/**
 * A singleton class that manages routing and view loading based on the URL hash.
 */
class ForeverAlone {
    // Step 1: Private static instance (only accessible inside the class)
    static #instance = null;

    static signPost = {};
    static config = null;
    static view = null;

    /**
     * Creates an instance of ForeverAlone.
     * Ensures that only one instance can exist (singleton pattern).
     */
    constructor() {
        if (ForeverAlone.#instance) {
            return ForeverAlone.#instance; // Return the existing instance if it already exists
        }
        ForeverAlone.#instance = this;
    }

    /**
     * Static method to access the singleton instance.
     * Initializes hash change event listener.
     * @returns {ForeverAlone} The singleton instance of the ForeverAlone class.
     */
    static getInstance() {
        if (!ForeverAlone.#instance) {
            new ForeverAlone(); // Create a new instance if it doesn't exist
        }
        window.addEventListener("hashchange", ForeverAlone.#instance.onHashChanged.bind(ForeverAlone.#instance));
        return ForeverAlone.#instance;
    }

    /**
     * Initializes the class with provided configuration.
     * Loads view contents from specified URLs and sets up the callbacks.
     * @param {HTMLElement} viewSection - The section of the page to load views into.
     * @param {string} loadViewUrl - URL to load the main view content.
     * @param {string} errorViewUrl - URL to load the error view content.
     * @param {Object} [callback={}] - Callback functions for load and error events.
     */
    async init(viewSection, loadViewUrl, errorViewUrl, callback = {}) {
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

    /**
     * Handles changes to the URL hash.
     * Loads the appropriate view based on the current hash or shows an error view if no match is found.
     */
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

    /**
     * Finds the destination for a given hash.
     * @param {string} hash - The hash from the URL.
     * @returns {string|null} The destination if found; otherwise, null.
     */
    findDestinationForHash(hash) {
        for (var destination in ForeverAlone.signPost) {
            var route = ForeverAlone.signPost[destination];

            if (typeof route != "function" && new RegExp(destination, "i").test(hash)) {
                return destination;
            }
        }
        return null;
    }

    /**
     * Changes the content of the view section.
     * @param {string} view - The HTML content to display.
     */
    changeView(view) {
        ForeverAlone.view.innerHTML = view; // Corrected to innerHTML
    }

    /**
     * Displays an error view when a destination cannot be found.
     * @param {string} errorMessage - The error message to display.
     */
    showErrorView(errorMessage) {
        console.error(errorMessage);
        const error = ForeverAlone.config.error || `Error: ${errorMessage}`;
        this.changeView(error);
    }

    /**
     * Loads a view based on the specified route.
     * @param {string} route - The route to load.
     */
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

    /**
     * Adds a new destination and its associated route to the sign post.
     * @param {string} destination - The destination identifier.
     * @param {string} route - The route associated with the destination.
     */
    add(destination, route) {
        console.log(`Adding ${destination} in ${JSON.stringify(ForeverAlone.signPost)}`);
        ForeverAlone.signPost[destination] = route;
    }
}

/**
 * A helper class for making HTTP requests.
 */
class HttpHelper {
    // Helper methods

    /**
     * Performs a GET request to the specified URL.
     * @param {string} url - The URL to send the GET request to.
     * @returns {Promise<string>} The response body as text.
     * @throws {Error} Throws an error if the response is not successful.
     */
    static async get(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    }

    /**
     * Performs a GET request to the specified URL with a minimum wait time.
     * @param {string} url - The URL to send the GET request to.
     * @param {number} minTime - Minimum time to wait before resolving the request (in seconds).
     * @returns {Promise<string>} The response body as text.
     */
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

    /**
     * Calculates the wait time based on the time elapsed since the start.
     * @param {number} start - The start time in milliseconds.
     * @param {number} minTime - The minimum wait time in seconds.
     * @returns {number} The calculated wait time in milliseconds.
     */
    static calculateWaitTime(start, minTime) {
        const delta = new Date().getTime() - start;
        const waitTime = (minTime * 1000) - delta;
        return waitTime > 0 ? waitTime : 0;
    }

    /**
     * Waits for a specified amount of time.
     * @param {number} waitTime - The time to wait in milliseconds.
     * @returns {Promise<void>} A promise that resolves after the wait time.
     */
    static wait(waitTime) {
        return new Promise(resolve => setTimeout(resolve, waitTime));
    }
}
