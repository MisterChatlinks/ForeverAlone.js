const doc = new ForeverAlone({
    loadDuration: 1000,
    appShellSelector: '#docAppShell'
})

doc.addAll
([ 
   { key: '#home', path: 'views/home.html'},
   { key: '#docs/:resource type:string', path: 'views/doc.html'},
   { key: '#err-spa', path: 'views/err.html'},
   { key: '#load-spa', path: 'views/load.html'},
])

doc.init()
