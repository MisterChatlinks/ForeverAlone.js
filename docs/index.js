const doc = new ForeverAlone({
    loadDuration: 1000,
    appShellSelector: '#docAppShell'
})

doc.addAll
([ 
   { key: '#home', path: '/docs/views/home.html'},
   { key: '#docs/:resource type:string', path: '/docs/views/doc.html'},
   { key: '#err-spa', path: '/docs/views/err.html'},
   { key: '#load-spa', path: '/docs/views/load.html'},
])

doc.init()