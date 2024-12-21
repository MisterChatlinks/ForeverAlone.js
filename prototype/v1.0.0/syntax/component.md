

```html
<!-- Standalone Component -->
<div stand-alone>
    <!-- Component Properties -->
    <props
        state='{ "count": 0 }'
        root='[ { "prop1": "value1" }, { "prop2": "value2" } ]'
    />
    
    <!-- Component Methods -->
    <methods
        method1='() => console.log("Method 1 called")'
    />
    
    <!-- Event-driven Methods -->
    <eventMethods
        changeColor='() => {
            this.style.color = "blue";
        }'

        increment='(step) => {
            let state = this.useAncestorProp({ prop: "state" })
                state.count += step 
        }'
    />
    
    <!-- Component Children -->
    <children>
        <div lone-event="click:changeColor">
            <h1>Click me to change color</h1>
        </div>
        <button lone-event="click:increment" lone-args="[1]">
            Increment Count
        </button>
    </children>
</div>
```