//PIXI.settings.PRECISION_FRAGMENT=PIXI.PRECISION.HIGH
//PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
//PIXI.settings.ROUND_PIXELS = true; //v5
PIXI.Graphics.CURVES.adaptive = true;
gsap.defaults({ //https://greensock.com/docs/v3/GSAP/gsap.config()
    ease: Power4.easeOut, 
    duration: 0.2,
  });
gsap.defaults({overwrite:'auto'})

class _app extends PIXI.Application {
    constructor(option) {
        super({
            width: 1920, 
            height: 1080,                       
            antialias: true, 
            transparent: false,
            resolution: 1,
            sharedTicker:true,
            backgroundColor: 0x4f4f4f,

            // powerPreference: SLI&CrossFire GPU, TODO: study me
          });
          document.body.appendChild(this.view);
    };

    isNwjs() {
        return typeof eval(require) === 'function' && typeof process === 'object';
    };

    /** ini basic app stuf (debug.. listener ..) */
    initialize(){
        /*
        try {  } 
        catch (e) { throw console.error(e.stack) };
        */
        this.initialize_listener();
        this.initialize_nwjs();
        this.stage = $stage.initialize(); // return PIXI.display.Stage
        this.requestFullScreen();
        this.stage.goto('Scene_Boot');
    };

    /** setup window app nwjs and debugger */
    initialize_nwjs() {
        if(this.isNwjs){
              //this.nwjs.win.showDevTools() //auto-start devTool chromium
            let dw = 800 - window.innerWidth;
            let dh = 600 - window.innerHeight;
            let win = nw.Window.get();
            //win.showDevTools()
            win.maximize()
            win.focus();
        };
    };

    /** initialise global listener app */
    initialize_listener(){
        document.body.onresize = () => { this.scaleToWindow() };

        document.addEventListener('contextmenu', event => {
            event.path[0] === $app.renderer.view && event.preventDefault(); // FIXME: premet enpecher right click dans editeur ,mais autorise les html
         }); 
         // disable nwjs right click
         document.addEventListener('keydown', (event) => {
             if(event.code === "F12"){return};
             if(event.target.type){return}; // si dans un div input, cancel
             if(event.keyCode === 115){ // F4
                 return $app._fullScreen && $app.cancelFullScreen() || $app.requestFullScreen();
             };
             if(event.keyCode === 116){ // F5 refresh
                nw.Window.get().reloadIgnoringCache(); //document.location.reload(true);
             };
           
             /*if(event.keyCode === 101){ // numpad 5 copy //todo: change key
                 window.prompt("Copy this to $camera.cameraSetup", 
                 `{_zoom:${$camera._zoom.toFixed(2)},_ang:${$camera._ang.toFixed(2)},_perspective:${$camera._perspective.toFixed(2)} }`
                 );
             }*/
         });
    };

    requestFullScreen() {
        var element = document.body;
        if (element.requestFullScreen) {
            element.requestFullScreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullScreen) {
            element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
        this._fullScreen = true;
    };

    cancelFullScreen() {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        this._fullScreen = false;
    };
    

    scaleToWindow() {
        const canvas = this.view;
        let scaleX, scaleY, scale, center;
        scaleX = window.innerWidth / canvas.offsetWidth;
        scaleY = window.innerHeight / canvas.offsetHeight;
        scale = Math.min(scaleX, scaleY);
        canvas.style.transformOrigin = "0 0";
        canvas.style.transform = "scale(" + scale + ")";
        if (canvas.offsetWidth > canvas.offsetHeight) {
        if (canvas.offsetWidth * scale < window.innerWidth) { center = "horizontally" }
        else { center = "vertically" };
        } else {
        if (canvas.offsetHeight * scale < window.innerHeight) { center = "vertically" }
        else { center = "horizontally"; };
        };
        let margin;
        if (center === "horizontally") {
            margin = (window.innerWidth - canvas.offsetWidth * scale) / 2;
            canvas.style .marginTop = 0 + "px";canvas.style .marginBottom = 0 + "px";
            canvas.style .marginLeft = margin + "px";canvas.style .marginRight = margin + "px";
        };
        if (center === "vertically") {
            margin = (window.innerHeight - canvas.offsetHeight * scale) / 2;
            canvas.style .marginTop  = margin + "px";canvas.style .marginBottom = margin + "px";
            canvas.style .marginLeft = 0      + "px";canvas.style .marginRight  = 0      + "px";
        };
        canvas.style.paddingLeft = 0 + "px";canvas.style.paddingRight  = 0 + "px";
        canvas.style.paddingTop  = 0 + "px";canvas.style.paddingBottom = 0 + "px";
        canvas.style.display = "-webkit-inline-box";
        return scale;
    }; 
   

    /** get a scale ratio from width,height */
    getRatio(obj, w, h) {
        let r = Math.min(w / obj.width, h / obj.height);
        return r;
    };


    /** check entre 2 objet la colision? calcule le bounds automatic */
    hitCheck(a, b){ // colision
        var ab = a.getBounds();//a._boundsRect || 
        var bb = b.getBounds();//b._boundsRect || 
        return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
    };

    
}; //END CLASS
/** @global - Application manager */
let $app = new _app({});
console.log1('$app: ', $app);




//! TEMP REMOVEME
/** ajoute un spriteSheet json au boot perma, path window
 *  shift + click droit sur fichier json.
 *  valid aussi pour les audio
 */
 var updateJSONBOOT = function(remove){
    const clipboard = nw.Clipboard.get();
    const link =  clipboard.get().replace(/"/g,'');
    const array = link.split('\\').slice(6);
    if(array[0] !== "data2" ||!array[3].contains('.json') ){
        return console.error("invalide path register check:",link );
    };
    
    const png = array.join('/').replace('.json','.png');
    const root = array.join('/');
    const dir = array.slice(0,array.length-1).join('/');
    const base = array.slice(array.length-1).join('/');
    const ext = base.split('.')[1];
    const name = base.split('.')[0];
    const dirArray = array.slice(0,array.length-1);

    const fs = eval("require('fs')");
    const boot = JSON.parse(fs.readFileSync('data/Scene_Boot.json'));
    let add = !remove;
    let json;
    if(add && boot._sheets[name]){ add = confirm("EXISTE DEJA, REPLACE ?") };
    if(add){
        boot._sheets[name] = { png,root,dir,base,ext,name,dirArray}
    }
    if(remove){
        add = delete boot._sheets[name];
    }
    function writeFile(path,content){
        // backup current to _old.json with replace() rename()
        fs.rename(`${path}`, `${path.replace(".","_OLD.")}`, function(err) {
            if ( err ) { console.log('ERROR:rename ' + err) };
            fs.writeFile(path, content, 'utf8', function (err) { 
                if(err){return console.error(path,err) }
                return console.log9("WriteFile Complette: "+path,JSON.parse(content));
            });
        });
    };
    add && writeFile(`data/Scene_Boot.json` , JSON.stringify(boot, null, '\t') );
};


