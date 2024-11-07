# ForeverAlone Class Documentation

## Overview

The ForeverAlone class handles the singleton pattern and manages dynamic page content based on hash changes in the URL. This is useful in Single Page Applications (SPAs) where different content needs to be displayed without refreshing the entire page.

## Properties

### *instance*

A private static variable that holds the instance of the ForeverAlone class to enforce the singleton pattern. It ensures only one instance of the class exists.
signPost: A static object that maps destinations (e.g., URL segments or page names) to corresponding routes (view templates or content).

### *config*

 Stores configuration data, including the loaded views (main and error) and any callback functions.

### *view*

 The reference to the HTML element where content views will be displayed.

## Methods

### constructor()

Ensures that only one instance of the ForeverAlone class is created. If an instance already exists, it returns the existing instance.

### static getInstance()

A static method that provides access to the singleton instance of the ForeverAlone class. It also adds a hashchange event listener to detect URL hash changes.

### async init( viewSection, loadViewUrl, errorViewUrl, callback = {})

Initializes the class with configuration settings. It loads the main and error view content via HTTP requests to the provided URLs and sets up optional callback functions.
#### Arguments:
##### viewSection: The HTML element where the views will be displayed.
##### loadViewUrl: The URL to load the main content.
##### errorViewUrl: The URL to load the error content.
##### callback: Optional callback functions for load and error events.

### onHashChanged():

Handles URL hash changes. It loads the appropriate content based on the current hash value or shows an error view if no destination matches.
findDestinationForHash(hash)

Searches through signPost to find a matching route based on the URL hash.
Returns the destination string if found, or null if no match is found.
### changeView(view)

Changes the content of the view section by updating its innerHTML with the provided content.
It also handles the execution of embedded scripts and binds pseudo-events defined in the content.
bindPseudoEvents(viewer)

Binds events defined in the data-event attributes of HTML elements. These events include load and other custom events. It ensures that event handlers are executed when the DOM is ready.
showErrorView(errorMessage)

Displays an error view when a destination cannot be found. The error message is logged to the console for debugging purposes.
async loadView(route)

Loads a view based on the specified route. It first shows a loading view and then tries to fetch the content. If an error occurs, it shows the error view.

#### Arguments:
route: The route to fetch content for.


### add(destination, route)

Adds a new destination and its corresponding route to the signPost object.

#### Arguments:

destination: The destination name or identifier.
route: The route or URL pattern to associate with the destination.
HttpHelper Class Documentation
The HttpHelper class is a utility class for making HTTP requests.

### Helper Methods

#### static async get(url)

Performs a GET request to the provided URL.
Returns the response body as text.
Throws an error if the response status is not ok.
static async getWithMinTime(url, minTime)

Performs a GET request with a minimum wait time after the request is completed.
This ensures that the response time is consistent, even if the request completes quickly.
Arguments:
url: The URL to fetch.
minTime: The minimum wait time in seconds.
Returns the response body as text.

#### static calculateWaitTime(start, minTime)

Calculates the wait time based on how much time has elapsed since the start of the request.
Arguments:
start: The start time of the request (in milliseconds).
minTime: The minimum time to wait (in seconds).
Returns the calculated wait time in milliseconds.

#### static wait(waitTime)

Pauses the execution for the specified amount of time.
Arguments:
waitTime: The time to wait in milliseconds.
Returns a promise that resolves after the wait time.

### Helper Functions

##### loadViewWithScripts(element)

Replaces \<script> tags in the provided HTML element with cloned script elements to ensure they execute after the content is loaded.

##### _fa_nodeScriptReplace(node)

Recursively traverses through child nodes of an element and replaces any \<script> tags with cloned script elements for execution.
##### _fa_nodeScriptClone(node)

Creates a new \<script> element and copies the source from the provided script node. It replaces the original script node with the cloned one to ensure it executes correctly.

## Usage Example

```javascript

// Get the singleton instance
const app = ForeverAlone.getInstance();

// Initialize the app with a view section, view URLs, and callback functions
app.init(
    document.getElementById("view-container"),
    "main-view.html",
    "error-view.html",
    {
        load: () => console.log("View loaded"),
        error: (error) => console.log("Error occurred:", error)
    }
);

// Add new destinations
app.add("home", "/home");
app.add("about", "/about");

// Handle hash change manually
app.onHashChanged();

