# **ForeverAlone.js**  

> _"Because coding for SPAs feels lonely sometimes."_  

Welcome to **ForeverAlone.js**, the ultimate toolkit for managing Single Page Applications (SPAs) while embracing the sweet isolation of modular development. Think of it as the **Ctrl+Alt+Del** of web frameworks:  

- Works alone.  
- Doesn’t complain.  
- Gets the job done.  

---

## **The Squad**  

ForeverAlone.js isn’t _entirely_ lonely—it’s got a trusty team of misfits:  

| Class/Singleton   | Purpose                             | Vibes                       |  
|--------------------|-------------------------------------|-----------------------------|  
| **Router**         | Handles navigation and lifecycle   | 🧭 "This way, traveler!"    |  
| **appShell**       | Renders and manages components     | 🖼️ "I make things pretty." |  
| **Route**          | Defines each route like a boss     | 🛣️ "Stay in your lane."    |  
| **UrlParameter**   | Extracts URL magic ✨               | 🔍 "I see all."             |  
| **SpaBundle**      | Ties the pieces together           | 🎁 "All in one package."    |  
| **ForeverAlone**   | The name speaks for itself         | 😭 "Existential crisis."    |  

---

## **1. appShell: The Renderer That Never Complains**  

### **Why It Exists**  

The `appShell` class is the SPA equivalent of a blank canvas. It:  

- Manages what shows up on the screen.  
- Runs your scripts like a loyal intern.  
- Pretends bad routes are just misunderstood (with a default error page).  

### **How It Works**  

#### **Constructor**  

When you summon `appShell`, it:  

1. Claims a fragment of the DOM.  
2. Joins the router's lifecycle cult (`onBeforeRendering`, `onAfterRendering`).  
3. Logs itself in `Router.useArgs` because sharing is caring.

#### **Key Features**  

1. **Dynamic Rendering:**  
   The `render(component)` method replaces your fragment’s `innerHTML` with a new view.  
   It even runs `<script>` tags like a pro and binds custom pseudo-events.  

2. **Pseudo-events:**  
   _Why settle for boring `addEventListener`s?_ Use the `data-event` attribute instead!  

   ```html
   <div data-event="load:logLoad;click:logClick"></div>
   <script>
       function logLoad() { console.log("Loaded:", this); }
       function logClick() { console.log("Clicked:", this); }
   </script>
   ```

3. **Error Handling:**  
   When all else fails, `renderDefaultComponent()` swoops in with a “Whoopsie Daisy” page.  

---

## **2. Router: The Travel Guide**  

> _"Lost? Not on my watch."_  

The `Router` is the heart of your SPA, making sure every hashbang (#️⃣) leads somewhere meaningful.

### **Key Responsibilities**  

- **Life Coach:** Manages route lifecycle hooks like `onBeforeRendering` and `onError`.  
- **Traffic Cop:** Directs hash changes to the right views.  
- **Security Guard:** Enforces route authentication like a nightclub bouncer.

---

### **Router Lifecycle Hooks**  

Hooks are like a therapist for your app:  

- **onLoading:** "Take a deep breath; it’s loading."  
- **onError:** "Oops, something broke."  
- **onBeforeRendering:** "Are you ready for this?"  
- **onAfterRendering:** "You did great, champ."

**Pro Tip:** Add custom hooks to inject even more chaos (or structure, your call).  

```javascript
Router.routerLifeCycleHooks.extendCycle("onFeelingsUpdate");

Router.routerLifeCycleHooks.onFeelingsUpdate["selfCare"] = () => {
    console.log("How’s everyone feeling today?");
};
```

---

## **3. Route Class: The Overachiever**  

A `Route` is your golden ticket to define what happens at every URL. Think of it as:  

- A map.  
- A bossy map that refuses to let you wander off.  

**Properties:**  

- `url`: Where do you want to go?  
- `component`: What should you see when you get there?

---

## **UrlParameter: The Detective**  

Every good app needs a snoop. The `UrlParameter` class sniffs out query strings, hash fragments, and all the little breadcrumbs users leave behind.  

- **get**: "What’s the value of this parameter?"
- Filters? ✔️  
- Pagination? ✔️  
- Spying on URLs like a pro? Absolutely.

---

## **Building the ForeverAlone Dream**  

ForeverAlone.js is more than just a framework—it’s a _lifestyle_. To deploy your SPA empire:

1. **Create Routes:** Give your app structure.  
2. **Define Components:** Bring the visuals.  
3. **Set Hooks:** Add some flair.  
4. **Deploy:** Flex your lonely, self-sufficient code in the wild.

---

## **FAQs (Frequently Asked Queries)**  

### _Why is it called ForeverAlone.js?_  

Because we're all alone in this digital void, and this framework is here to help you cope.
Because it’s an independent framework designed for independent developers. _#StrongAndSolo_

### _Is it suitable for production?_  

Yes, but also… proceed with caution. It’s like wearing Crocs to a formal event—it works, but be ready for some side-eyes.

### _Can I contribute?_  

Of course! Drop a PR and join the loner coder revolution.  

---

_And remember: With ForeverAlone.js, you're never truly alone. You have the Router, appShell, and a deep sense of existential dread by your side._
