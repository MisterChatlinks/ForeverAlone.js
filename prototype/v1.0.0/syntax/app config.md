```html
<app 
    load="load.html"
    error="err.html"
>

    <!-- Navigation -->
    <nav>
        <a href="#home"> Home </a>
        <a href="#article"> Article </a>
    </nav>

    <!-- Home Page Route -->
    <page hash="home" src="./home.html">
        <!-- Sub-route with dynamic parameter and middleware -->
        <page 
            hash="u/:id type:number"
            middleware='[
                () => foreveralone.getState("isUserConnected") ? true : false
            ]'
            lifeCycle='{
                "onload": () => console.log("User page loaded"),
                "onunload": () => console.log("User page unloaded")
            }'
        ></page>
    </page>   

    <!-- Article Page Route -->
    <page hash="article" src="./article.html">
        <!-- Dynamic sub-routes -->
        <page hash="/:id type:number"></page>
        <page hash="/:factory type:string"></page>
    </page>

</app>
```