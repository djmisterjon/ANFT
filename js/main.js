//=============================================================================
// main.js
//=============================================================================
//PluginManager.setup($plugins);
window.onload = function() {
    function loadJS(path) {
        return new Promise((resolve, rej) => {
            const reader = eval("require('recursive-readdir')");
              reader(path, [], (err, files) => {
                files = files.filter(f => f.split('.').length<3 ); // filter(remove) les clones vscode .1.js,.2.js
                files = files.filter(f => f.split('---').length!==2 ); // filter(remove) les fichier (---)
                files.sort((a, b) => a.replace(/_/g, ' ').localeCompare(b.replace(/_/g, ' ')));  // sort file with '_' first
                console.log('onload: ', files.slice());
                const head = document.getElementsByTagName('head')[0];
                function next() {
                    const path = files.shift()
                    if(!path){ return resolve() };
                    const type = path.indexOf('.js')>-1; // true:js, false:css 
                    const el = document.createElement(type?'script':'link');
                    el.setAttribute("type", type?"text/javascript":"text/css");
                    el.setAttribute("rel",  type?"scriptSheet":"stylesheet");
                    type? el.setAttribute("src", path) : el.setAttribute("href", path);
                    el.onload = function() { next() };
                    head.appendChild(el);
                };
                next();
            });
        })
    };

    (async () => {
        //# libs
        await loadJS('js/libs/0' );
        await loadJS('js/libs/1' );
        await loadJS('js/libs/2' );
        await loadJS('js/libs/poly' );
        //# core
        await loadJS('js/game');
        //! editor
        await loadJS('js/libs/editor');
        //#TODO: Decryptor,
        await $loader.initialize();//#JSON,CSV,
        $app.initialize();
    })();
};
