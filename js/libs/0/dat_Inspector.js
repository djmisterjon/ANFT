/** Inspecteur d'objet javascript */
class Inspectors {
    //#region [Static]
    /**@param Timeline {TimelineLite} */
    static Timeline = function(Timeline){
        const id = "TL"+Object.keys(Timeline.labels).sum().hashCode();
        const gui = new Inspectors(id, 'Gsap TimeLine editor');
            Timeline.addLabel('._end',Timeline.totalDuration()) // duration ? ou ////totalDuration
        const f1 = gui.addFolder('CONTROLER').listen().slider();
        //!__time
        Object.defineProperty(Timeline, "__time", { // on defeni un get set temporaire car time est une fonction
            get : function(){ return Timeline.time(); }, // ou _time ?
            set : function(v){ Timeline.pause(v) },
        });
        //!__timeScale
        Object.defineProperty(Timeline, "__timeScale", { // on defeni un get set temporaire car time est une fonction
            get : function(){ return Timeline.timeScale(); },
            set : function(v){ Timeline.timeScale(v) },
        });
        //!__gotoLabel
        Object.defineProperty(Timeline, "__gotoLabel", { // on defeni un get set temporaire car time est une fonction
            set : function(v){ Timeline.pause(v) },
        });
        f1.add(Timeline, '__time').min(0).max(Timeline.totalDuration()).step(0.01).listen().slider().name('time').label(Timeline);
        f1.add(Timeline, '__timeScale').min(0.01).max(10).step(0.01).listen().slider().name('timeScale');
        f1.add(Timeline,'__gotoLabel',{ select:{...Timeline.labels}})
        //!buttons
        gui.addButton('Resume',(e)=>{
            Timeline.resume();
        },'btn-success');
        gui.addButton('Restart',(e)=>{
            Timeline.restart();
        },'btn-danger');
        gui.addButton('Pause',(e)=>{ 
            Timeline.pause();
        },'btn-warning');
    };
    //#endregion

    //#region [Static]
    /** create inspector with from a pixi filter */ //ex: Inspectors.filters(ShockwaveFilter);
    static Filters = function(pixiFilter,options=Object.getOwnPropertyNames( pixiFilter.__proto__ )){
        const gui = new Inspectors(pixiFilter.constructor.name, 'filters inspector');
        const f1 = gui.addFolder('OPTIONS').listen().slider();
        for (let i=0, l=options.length; i<l; i++) {
            const key = options[i];
            if(key==="constructor"){continue};
            if(key==="apply"){continue};
            if(pixiFilter[key] && pixiFilter[key].constructor.name === "ObservablePoint"){
                f1.add(pixiFilter, key, ['x','y','z'] ).step(1);
                continue;
            }
            if(pixiFilter[key] && pixiFilter[key].constructor.name === "Float32Array"){
                f1.add(pixiFilter, key, ['0','1'] ).step(0.1);
                continue;
            }
            let prop;
            prop = f1.add(pixiFilter, key).listen();
            if(pixiFilter[key]<10){ prop.step(0.1) } // ctrlKey for slowdown
            /*if(pixiFilter.hasOwnProperty(key)){
            }else{
                prop = f1.add(pixiFilter.uniforms, key).listen();
                if(pixiFilter.uniforms[key]<10){ prop.step(0.01) }
            }*/
        };
        return gui;
    };
    //#endregion
    
      //#region [Static]
    /** create inspector with from a pixi filter */ //ex: Inspectors.filters(ShockwaveFilter);
    static Light = function(Light){
        const gui = new Inspectors(Light.constructor.name, ' inspector');
        const f1 = gui.addFolder('LIGHT').listen().slider();
        f1.add(Light, "falloff" ).step(0.1);
        f1.add(Light, "lightHeight" ).step(0.001);
        f1.add(Light, "radius" ).step(0.01);
        f1.add(Light, "brightness" ).step(0.01);
        console.log('Light: ', Light);
       
        f1.add(Light, "color",{color:true} )
        f1.add(Light, "indices" ).step(0.1);
        f1.add(Light, "alpha" ).step(0.1);
        f1.add(Light ,'blendMode',{ select:{'[0]-NORMAL':0, '[1]-ADD':1, '[2]-MULTIPLY':2, '[3]-SCREEN':3, '[4]-OVERLAY':4, '[5]-DARKEN':5, '[6]-LIGHTEN':6  }}).listen()
        Light.position && f1.add(Light, "position",['x','y'] ).step(10);
        return gui;
    };

    static Combats = function(){
        const Combat = _Combats.Active;
        const gui = new Inspectors('Combat Debugger');
        const options = {
            Culling:false,
        }
        const f1 = gui.addFolder('options').listen().slider();
        f1.add(options, "Culling" ).onChange((context,input,value)=>{
            if(context.Culling){//!debugCulling
                const cull = new PIXI.Graphics();
                cull.lineStyle(4, 0xFEEB77, 1).beginFill(0xfff,0).drawRect(0, 0, 1920, 1080).endFill();
                const spriteCull = new PIXI.projection.Sprite3d( $app.renderer.generateTexture(cull) );
                spriteCull.scale3d.set(0.5);
                spriteCull.anchor.set(0.5);
                spriteCull.position3d.copy($players.p0.p.position3d);
                Combat.___spriteCull = $stage.scene.addChild(spriteCull);
            }else{
                $stage.scene.removeChild(Combat.___spriteCull);
            }
        })
        return gui;
    };
    //#endregion

    //#region [Static]
    /** Inspect un simple Obj pour Debug (genre options)
     * @param {object} Obj
     */
    static Objects(Obj,name=Math.random().toFixed(3)){
        if(this.GUI[name]){return};
        const gui = new Inspectors(name);
        const f1 = gui.addFolder('OPTIONS').listen().slider();
        Object.keys(Obj).forEach(key=>{
            if(Obj[key].constructor.name === "Object"){
                const select = Obj[key].select;
                f1.add(Obj ,key,{ select });
            }else{
                f1.add(Obj, key );
            }
        })
        return gui;
    };

 //#region [Static]
 /** Inspect un display Obj pour Debug 
  * @param {PIXI.DisplayObject} DisplayObj
  * @param {Array.<string>} Debug
 */
    static DisplayObj(DisplayObj,Debug){
        const gui = new Inspectors(DisplayObj.constructor.name+" - "+DisplayObj.name, ' inspector Debug');
        const f1 = gui.addFolder('DisplayObj').listen().slider();
        DisplayObj.position && f1.add(DisplayObj, "position",['x','y'] ).step(1);
        DisplayObj.scale && f1.add(DisplayObj, "scale",['x','y'] ).step(0.01);
        DisplayObj.pivot && f1.add(DisplayObj, "pivot",['x','y'] ).step(0.01);
        DisplayObj.euler && f1.add(DisplayObj, "euler",['x','y','z'] ).step(0.01);
        f1.add(DisplayObj, 'rotation').step(0.01);
        f1.add(DisplayObj, 'alpha').step(0.01);
        if(Debug){
            if(Array.isArray(Debug)){
                Debug.forEach(key => {
                    f1.add(DisplayObj, key).step(0.01);
                })
            }else{ // sinon true ? utilise tous les key
                Object.keys(DisplayObj).forEach(key => {
                    const subKeys = Object.keys(DisplayObj[key]);
                    f1.add(DisplayObj, key,subKeys).step(1);
                });
            }
        };
        return gui;
    };
    //#endregion


    //#region [Static]
    /**
     * @static
     * @param {_DataObj_Base} [DataObj=new _DataObj_Case()]
     * @param {_PME_ObjMapDebug} buttonContext
     * @returns {Inspectors}
     */
    static DataObj(DataObj, buttonContext){
        const name = DataObj.constructorId;
        if(this.GUI[name]){return console.error('Un inspector est deja ouvert avec ce Id: ',name)};
        const Gui = new Inspectors(name);
        //![P] ParentContainer
        if(DataObj.p){
            function add(F,DisplayObject,k) {
                switch (k) {
                    case 'position3d':case 'pivot3d':
                            F.add(DisplayObject,k,["x","y","z"]).listen().step(2);
                        break;
                    case 'scale3d':
                            F.add(DisplayObject,k,["x","y","z"]).listen().step(0.01);
                        break;
                    case'position':case 'pivot':
                            F.add(DisplayObject,k,["x","y"]).listen().step(2);
                        break;
                    case 'scale':case 'skew':
                            F.add(DisplayObject,k,["x","y"]).listen().step(0.01);
                        break;
                    case 'anchor':
                            DisplayObject.anchor && F.add(DisplayObject,k,["x","y"]).listen().min(0).max(1).step(0.01);
                        break;
                    case 'euler':
                            F.add(DisplayObject,k,["x","y","z","pitch","roll","yaw"]).listen().step(0.01);
                        break;
                    case 'alpha':
                            F.add(DisplayObject ,k).listen().min(0).max(2).step(0.005).slider();
                        break;
                    case 'rotation':
                            F.add(DisplayObject ,k).listen().min(-Math.PI).max(Math.PI).step(0.005).slider();
                        break;
                    case 'parentGroupId':
                            F.add(DisplayObject ,k,{ select:{'[-1]-NONE':-1, '[0]-bg':0, '[1]-map':1, '[2]-map':2, '[3]-mapGui':3, '[4]-menueGui':4, '[5]-txt':5, DiffuseGroup:'DiffuseGroup',NormalGroup:'NormalGroup',LightGroup:'LightGroup'} });
                        break;
                    case 'blendMode':
                            F.add(DisplayObject ,k,{ select:{'[0]-NORMAL':0, '[1]-ADD':1, '[2]-MULTIPLY':2, '[3]-SCREEN':3, '[4]-OVERLAY':4, '[5]-DARKEN':5, '[6]-LIGHTEN':6  }}).listen()
                        break;
                    case '_transfer':
                        const select = {};
                        $objs.CASES_G.map(c=>c._globalId).forEach(key => {
                                select[key] = +key;
                        });
                        F.add(DisplayObject ,k, { select }).listen()
                    break;
                    case 'pathConnexion':
                        return F.add({pathConnexion:Object.keys(DisplayObject[k]).join()} ,k);
                    break;
                    case '_color':
                        F.add(DisplayObject ,k,{ select: Object.fromEntries(Object.keys($systems.colorsSystem).map(k=>[k,k])) }).listen()
                        .onChange((context,input,value)=>{ context.update() });
                    break;
                    case '_bounty':
                        F.add(DisplayObject ,k,{ select: Object.fromEntries($systems.gameBounties.keys.map(k=>[k,k])) }).listen()
                        .onChange((context,input,value)=>{ context.update() });
                    break;
                    case '_identifiable':
                        F.add(DisplayObject ,k).listen()
                    break;
                        
                    default: return F.add(DisplayObject ,k).listen();  break;
                }
            }
            //! SETTING OPTIONS 
            const ff = Gui.addFolder('[AUTO]').close();
                function presetCase() { // change to mode cases
                    DataObj.p.euler.x = -Math.PI/2.4; //2.4 car les case son deja un peut iso
                    DataObj.p.scale3d.set(0.55);
                    DataObj.p.pivot3d.y = -76;
                }
                ff.add({preset:'default'} ,'preset',{ select:{'default':null, 'Case':'Case',  }})
                .onChange((context,input,value)=>{
                    switch (value) {
                        case 'Case':presetCase(); break;
                    }
                    DataObj.update();
                });
            //![G] DataObj_Base 
            const f0 = Gui.addFolder('[B] FACTORY GLOBAL').close(); //.disable()
            const DataObj_Base_keys = Object.keys( new _DataObj_Base() );
                DataObj_Base_keys.forEach(k=>{
                    const el = add(f0,DataObj,k);
                    ['_globalId','_localId','_url','_type','_category','_dataBaseName','_textureName'].contains(k) && el.disable(); //lock et protege certaines props
                });
            //![C] [DataObj_Case,DataObj_Wall,DataObj_Chara.....] from category
            if(DataObj.constructor.name !== '_DataObj_Base'){
                const f1 = Gui.addFolder('[C] FACTORY CATEGORY').close();
                const DataObj_CategoryKeys = Object.keys( new DataObj.constructor() );
                DataObj_CategoryKeys.remove(...DataObj_Base_keys);
                DataObj_CategoryKeys.forEach(k=>{
                    const el = add(f1,DataObj,k);
                    ['_globalCaseId','_localCaseId','pathConnexion'].contains(k) && el.disable(); //lock et protege certaines props
                });
            };

            const CKeys = ['p','s','a','l','d','n']; // _Container_Base keys
            for (let i=0, l=CKeys.length; i<l; i++) {
                const key = CKeys[i];
                const DisplayObject = DataObj.p[key];
                if(DisplayObject){
                    const F = Gui.addFolder(`[${key.toUpperCase()}] FACTORY DisplayObject`).slider();
                    //!propreties Container
                    if(DisplayObject instanceof _Container_Base){
                        _Factory.FLATTERS.propreties.container.forEach(k=>{
                            add(F,DisplayObject,k);
                        });
                    };
                    //!propreties Sprites ,d,n
                    if(DisplayObject instanceof PIXI.Sprite){
                        _Factory.FLATTERS.propreties.sprite.forEach(k=>{
                            add(F,DisplayObject,k);
                        });
                    };
                    //!propreties Spine
                    if(DisplayObject instanceof _Container_Spine){
                        _Factory.FLATTERS.propreties.spines.forEach(k=>{
                            add(F,DisplayObject,k);
                        });
                    };
                    //!propreties Animation
                    if(DisplayObject instanceof _Container_Animation){
                        _Factory.FLATTERS.propreties.animations.forEach(k=>{
                            add(F,DisplayObject,k);
                        });
                    };
                    //!propreties proj
                    if(DisplayObject.proj){
                        const FF = F.addFolder(`${key}.PROJECTIONS`);
                        _Factory.FLATTERS.propreties.proj.forEach(k=>{
                            add(FF,DisplayObject.proj,k);
                        });
                    };
                    //!obeservable
                    if(DisplayObject instanceof PIXI.DisplayObject){
                        const FF = F.addFolder(`${key}.OBSERVABLES`).slider();
                        _Factory.FLATTERS.Observable.ALL.forEach(k=>{ //.sort((a, b) => a.localeCompare(b))
                            add(FF,DisplayObject,k);
                        });
                    }
                };
            };
            //!button
            if(buttonContext){
                /** buttons seulement en mode click gauche lorsque deja sur map */
                Gui.addButton('SAVE',(e)=>{
                    //iziToast.warning( this.izifactoryUpdate(DataObj) ); //todo: si editor PME
                    buttonContext.saveToMap();
                    buttonContext.clearTrack();
                    Inspectors.DESTROY(name);
        
                },'btn-success');
                Gui.addButton('RESTOR',(e)=>{
                    buttonContext.restorData();
                },'btn-warning');
                Gui.addButton('DELETE',(e)=>{
                    buttonContext.removeToMap();
                    Inspectors.DESTROY(name);
                },'btn-danger');
            }
        };
        return Gui;
    };
    
    /** when drag from slider is busy */
    static get pixiApp(){return window.PIXI && window.app || (typeof $app !== void 0+'') && $app; }
    static __busySlider = false;
    /** Pool contien les Inspector par id */
    static GUI = {};
    static EVENTS = {};
    static onDragSliders_start = function(){
        const app = this.pixiApp;
        if(app){
            this.__holdInteractiveChildren = app.stage.interactiveChildren;
            app.stage.interactiveChildren = false;
        }
    };
    static onDragSliders_end = function(){
        const app = this.pixiApp;
        if(app){
            app.stage.interactiveChildren = this.__holdInteractiveChildren;
        }
    };
    /** callBack when update props */
    static onUpdate = function(){};
    static RegisterEvents = (from,target,type,cb)=>{
        target.addEventListener(type, cb);
        this.EVENTS[from].push({target,type,cb});
    };
    static clearEventsRegister = (from)=>{
        this.EVENTS[from].forEach(e=>{
            e.target.removeEventListener(e.type,e.cb);
        })
        this.EVENTS[from] = [];
    };
    /** destroy gui id and all listeners elements */
    static DESTROY = (id,closeFromIzi)=>{
        if(closeFromIzi){
            this.GUI[id].destroy();
            delete this.GUI[id];
        }else if(this.GUI[id]){ // force close by id
             iziToast.hide({}, this.GUI[id].__gui.toast, 'button');
             delete this.GUI[id];
             return true;
        };
        return false;
    };
    //#endregion

    constructor(name,descriptions,options={frequency:200}) {
        Inspectors.EVENTS[name] = [];
        /** indique si le inspector est minized pour enpecher els listen */
        this._isMinimized = false;
        /** options pass to inspector gui */
        this.options = options;
        this._name = name;
        this._descriptions = descriptions || '';
        /** stock gui izitoats dom element */
        this._onchange = function (e){};
        this.__gui = null;
        /** folder */
        this.__folders = {};
        /**element update */
        this.__elements = [];
        /**store draggers */
        this.__drag = null;
        /**bottom div for button */
        this.buttons = null;
        /** permet double click sur title pour masker rapidemnet */
        this._doubleClickTitle = false;

        /** bottom buttons */
        this.__buttons = [];
        this.initialize();
        this.initialize_position();
        this.initialize_draggable();
        this.initializeListeners();
        const update = ()=>{this.update(this.__elements)};
        this.__update = setInterval(update, options.frequency||100);
        Inspectors.GUI[name] = this;
    };
    //#region [GetterSetter]
    get parentInspectors() {return Inspectors.GUI[this._name]};
    //#endregion

    CLOSE() {
        Inspectors.DESTROY(this._name);
    }
    //#region [Initialize]
    initialize(){
        const gui = this.__gui = iziToast.show({
            id: this._name, 
            class: '',
            title: `Inspector: ${this._name}`,
            titleColor: '',
            titleSize: '',
            titleLineHeight: '',
            message: this._descriptions,
            messageColor: '',
            messageSize: '',
            messageLineHeight: '',
            backgroundColor: '',
            theme: 'black', // dark,black // .iziToast.iziToast-theme-dark
            color: '', // blue, red, green, yellow
            icon: '',
            iconText: '',
            iconColor: '',
            iconUrl: null,
            image: '',
            imageWidth: 50,
            maxWidth: null,
            zindex: null,
            layout: 2,//!
            balloon: false,
            close: true,
            closeOnEscape: false,
            closeOnClick: false,
            displayMode: 0, // once, replace
            position: 'topLeft', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter, center
            target: '',
            targetFirst: true,
            timeout: false,//!
            rtl: false,
            animateInside: true,
            drag: false,//!
            pauseOnHover: true,
            resetOnHover: false,
            progressBar: true,
            progressBarColor: '',
            progressBarEasing: 'linear',
            overlay: false,
            overlayClose: false,
            overlayColor: 'rgba(0, 0, 0, 0.6)',
            //bounceInLeft, bounceInRight, bounceInUp, bounceInDown, fadeIn, fadeInDown, fadeInUp, fadeInLeft, fadeInRight or flipInX.
            transitionIn: 'flipInX',
            transitionOut: 'flipOutX',
            transitionInMobile: 'fadeInUp',
            transitionOutMobile: 'fadeOutDown',
            buttons: {},
            inputs: {},
           // onOpening: function () {},
           // onOpened: function () {},
            onClosing: function (e) {Inspectors.DESTROY(e.id,true)},
           // onClosed: function () {console.log('CLOSED END');}
        });
          //#foldering body ,where we put all new folder
          const div = this.__gui.FOLDERS_BODY = document.createElement("div");
          div.classList.add('FOLDERS-BODY');
          this.__gui.toastBody.appendChild(div);
          //# copyClipbar
          const btnCopyClipbar = this.copyClibarButton = document.createElement("button");
          btnCopyClipbar.value = 'C';
          btnCopyClipbar.onclick = ()=>{
              if(window.nw || global.nw){
                const clipboard = nw.Clipboard.get();
                const dc = this.__elements.map( e=> {
                    let v = e.getValue(); 
                    return { [e._proprety]:isFinite(v)?v : v&&Object.entries(v).filter(k=>!['cb','scope'].contains(k[0])) } 
                });
                clipboard.set(JSON.stringify(dc));
              }
          }
          btnCopyClipbar.classList.add('BUTTONS-clipbar');
          this.__gui.FOLDERS_BODY.appendChild(btnCopyClipbar)

          //#buttons div for bottom
          const btn = this.buttons = document.createElement("div");
          btn.classList.add('BUTTONS-BOTTOMS');
          this.__gui.FOLDERS_BODY.appendChild(btn)
    };

    initialize_draggable(){
        const gui = this.__gui;
             //#draggable
             function limit(x, y, x0, y0) {
                x<0?x=0:x>window.innerWidth-120?x=window.innerWidth-120:x;
                y<0?y=0:y>window.innerHeight-120?y=window.innerHeight-120:y;
                return {
                  x: x||0,
                  y: y||0
                };
              };
              const preventDrag = (e)=>{ // doit return true pour autoriser drag
                  return e.classList[1] === 'slideIn';
              }
              const onDragEnd = (e,ee)=>{ // doit return true pour autoriser drag
                //e.getBoundingClientRect()
            }
              const DraggableOptions = {
                grid: 10,
                useGPU:true,
                limit: limit,
                filterTarget:preventDrag,
                //onDragEnd:onDragEnd,
                //onDrag: function(){ }
              };
              this.__drag = new Draggable ( gui.toastCapsule ,DraggableOptions);
    }
    initialize_position(){
        //!position auto collide
        this.x(0);
        this.y(0);
        function isCollide(aRect, bRect) {
            return !(
                ((aRect.top + aRect.height) < (bRect.top)) ||
                (aRect.top > (bRect.top + bRect.height)) ||
                ((aRect.left + aRect.width) < bRect.left) ||
                (aRect.left > (bRect.left + bRect.width))
            );
        }
        for (let i=0,x=0,y=0,list = Object.values(Inspectors.GUI), l=list.length; i<l; i++) {
            const e = list[i];
            const A = this.__gui.toastCapsule.getBoundingClientRect();
            const B = e.__gui.toastCapsule.getBoundingClientRect();
            A.height = A.height || 450;
            if(isCollide(A,B)){
                x+=20;
                this.x(x);
                i--;
            }
        };
    }

    //#endregion

    /** position x from left*/
    x(x=0){
        this.__gui.toastCapsule.style.left = `${x}px`;
        return this;
    };
    /** position y from top*/
    y(y=0){
        this.__gui.toastCapsule.style.top = `${y}px`;
        return this;
    };

    initializeListeners(){
        //! si mouse down on a input disable drag
        const __toastCapsule_mouseover = (e)=>{
            this._busyIn = true;
        }
        const __toastCapsule_mouseout = (e)=>{
            this._busyIn = false;
        }
        Inspectors.RegisterEvents(this._name,this.__gui.toastCapsule, "mouseover", __toastCapsule_mouseover);
        Inspectors.RegisterEvents(this._name,this.__gui.toastCapsule, "mouseout", __toastCapsule_mouseout);
        
        //! double click togggle hideshow
        this.__gui.toastTexts.addEventListener('click',  (e)=> {
            if(this._doubleClickTitle){
                const value = this.__gui.FOLDERS_BODY.style.display;
                this.__gui.FOLDERS_BODY.style.display = value? '' : 'none'
                this.__gui.toastCapsule.style.transform = value?null : `scale3d(0.6,0.6,0.6)`;
                this._isMinimized = !value;
            }
            this._doubleClickTitle = true;
            setTimeout(() => {
                this._doubleClickTitle = false;
            }, 200);
        });

    };

    /** listen elements */
    update(elements){
        if(this._isMinimized){ return };
        elements.forEach(el => {
            for (let i=0, l=el.__input.length; i<l; i++) {
                const input = el.__input[i];
                if(input !== document.activeElement){
                    let value = el.getValue(input._props);
                    if(input.type === 'number'){ //el._fixedValue !== null){
                        value = value.toFixed(el._fixedValue)
                    }
                    if(el._proprety === "__time" && el.__SliderTline){
                        el.__SliderTline.setValue(value); // update les timeLine gsap 
                    }
                    (value==="Infinity")? undefined : input.value = value; //do nothin if infinity
                }
            };
        });
    };
    /** on change callback */
    onChange(cb){
        this._onchange = cb;
        return this;
    };

    addFolder(name,cols=3){
        if(!this.__folders[name]){
            const folder = this.__folders[name] = new Inspectors.FOLDER(name,this._name);
            this.__gui.FOLDERS_BODY.appendChild(folder.__item);
            return folder;
        }else{ console.error('Folder alrealy exist',name) };
    };

    
    /** add button function to bottom 
     * @param {String} style - 'btn-primary','btn-secondary','btn-success','btn-danger','btn-warning','btn-info','btn-light btn-dark'
    */
    addButton(title,cb,style='btn-primary'){
        var btn = document.createElement("BUTTON");
        btn.classList.add('btn',style);
        btn.innerHTML = title;
        btn.onclick = function (e) {cb(e)};
        this.__buttons.push(btn);
        this.buttons.appendChild(btn);
       
    };

            
    destroy(){
        this._onchange = null;
        clearInterval(this.__update);
        this.__update = null;
        Inspectors.clearEventsRegister(this._name);
        this.__drag.destroy();
        Object.values(this.__folders).forEach(folder=>folder.destroy());
        this.__buttons.forEach(btn => { btn.onclick = null });
        this.__buttons = null;
        this.buttons = null;
        this.__gui = null;
        this.__folders = null;
        this.__elements = null;
        this.__drag = null;
        this.options = null;
        this._name = null;
    };

    //#region [rgba(60, 60, 60, 0.3)]
    /**@class FOLDER*/
    static FOLDER = class FOLDER {
        constructor(name,NAME) {
            this._NAME = NAME;
            this._name = name;
            /** if create bootstrape table */
            this.__table = null;
            /** acordeon  */
            this.__acc = null;
            /** accordions */
            this.__item = null;
            /** content div for elements */
            this.__content = null
            /** strore elements for this folder */
            this.__elements = [];
            this._onchange = function (e){};
            this.initialize();
        };
        /** return the parent inspectors hold current class */
        get parentInspectors() { return Inspectors.GUI[this._NAME] };

        initialize(){
            const item = this.__item = document.createElement('div');
            item.classList.add('mn-accordion', 'scrollable');
            item.setAttribute('id', `accordion_${this._NAME+this._name}`);
            item.innerHTML = `
            <div class="accordion-item">
                <div class="accordion-heading">
                    <h3>${this._name}</h3>
                    <div class="icon">
                        <i class="arrow right"></i>
                    </div>
                </div>
            </div>`;
            const content = this.__content =document.createElement('div');
            content.classList.add('accordion-content');
            item.lastElementChild.appendChild(content);
            this.__acc = new Accordion(item, { collapsible: true, multiple:true, defaultOpenedIndexes:0 });
        };

        addFolder(name){
            if(!this.parentInspectors.__folders[name]){
                const folder = new Inspectors.FOLDER(name,this._NAME);
                this.parentInspectors.__folders[name] = folder;
                this.__content.appendChild(folder.__item);
                return folder;
            }else{ console.error('Folder alrealy exist',name) };
        };

        add(target,proprety,options){
            const el = new Inspectors.ELEMENT(target,proprety,options,this._NAME,this._name);
            this.__content.appendChild(el.__el);
            this._disable && el.disable();
            this._listen  && el.listen ();
            this._sliders && el.slider ();
            this.__elements.push(el);
            return el;
        };

        addRow(thIndex,target,proprety,selects){
            let tr = this.__table.tBodies[0].children[thIndex] || this.__table.tBodies[0].insertRow(thIndex);
            const el = new Inspectors.ELEMENT(target,proprety,selects,this._NAME,this._name);
            const td = document.createElement('td');
            td.appendChild(el.__el);
            tr.appendChild(td);
            this._disable && el.disable();
            this._listen  && el.listen ();
            this._sliders && el.slider ();
            this.__elements.push(el);
            return el;
        }

        /** add memo line with theme
        * @param {String} theme - light,info,warning,danger,success,secondary,primary
        */
        addLine(memo='',theme='dark'){
            const div = document.createElement("div");
            div.innerHTML = `<div class="alert alert-${theme}" role="alert"> ${memo} </div>`
            this.__content.appendChild(div);
            return this;
        };
        
        /** make bootstrape table */
        table(TH=['#','value']){ //TODO: RENDU ICI
            const table = this.__table = document.createElement('table');
            table.classList.add('table','table-hover');
            table.innerHTML = `  
            <thead>
                <tr> </tr>
                <tbody> </tbody>
            </thead>`;
             TH.forEach(_th => {
                 const th = document.createElement('th');
                 th.scope = 'col';
                 th.innerHTML = _th;
                 table.tHead.lastElementChild.appendChild(th);
             });
            this.__content.appendChild(table);
            return this;
        };

        /** close folder */
        close(){
            this.__acc.closeAccordionItemByIndex(0);
            return this;
        };
        /** on change callback */
        onChange(cb){
            this._onchange = cb;
            return this;
        };

        /** disable all elements in folder */
        disable(value = true){
            this._disable = value;
            return this;
        };
        /** listen all eleent in folder */
        listen(value = true){
            this._listen = value;
            return this;
        };

        /** add sliders to all elements */
        slider(value = true){
            this._sliders = true;
            return this;
        };

        destroy(){
            this._onchange = null;
            this.__acc.destroy();
            this.__acc = null;
            this.__elements.forEach(el => {
                el.destroy();
            });
            this.__elements = null;
        };
    };
    //#endregion

    //#region [rgba(60, 120, 60, 0.1)]
    /**@class ELEMENT
     * @param {Object} options - {select:{},color:{}}
    */
    static ELEMENT = class ELEMENT {
        constructor(target,proprety,options,NAME,folderName) {
            // si pass un Array, et pas option!, creer les keys arrays
            if(target && Array.isArray(target[proprety]) && !options){
                options = Object.keys(target[proprety]);
            };

            this._folderName = folderName;
            this._NAME = NAME;
            /** target elements */
            this.target = target;
            /** special otpions */
            this.options = options;
            /** proprety name in target */
            this._proprety = proprety;
            /** html div propre for change name or color*/
            this.__proprety = null;
            /** store the current input */
            this.__input = [];
            /**drag input for listener */
            this.input = null;
            /** add and store sliders id progress if need */
            this.__sliders = {};
            /** if number check fixed value */
            this._fixedValue = null;
            /** store parent of container element */
            this.__el = null;
            this._initialValue = target && target[proprety];
            this._type = target && typeof target[proprety];
            this._max = null;
            this._min = null;
            this._step = 1;
            this._isFakevalue = this.getValue()?.constructor.name === 'Object'; // si on passe des options sans pros, mais utilise onchange.
            this._onchange = function (e){};
            this.initialize();
        };
        /** get target value */;
        get id(){ return `${this._NAME}.${this._proprety}.`};
        get hasMin() { return this._min  !==null         };
        get hasMax() { return this._max  !==null         };
        get parentInspectors() {return Inspectors.GUI[this._NAME]};

        initialize(){
            // split in 2 case folder[element[ proprety | input ]]
            const elContainer = this.create_containerGroup();
            const elProprety =  this.create_Propreties();
            const elInput = this.create_input();
            elContainer.appendChild(elProprety)
            elInput && elContainer.appendChild(elInput);
            this.__el = elContainer;
            elInput && this.initializeListerner()
        };

        /** get value, pass extend prop for special objet only */
        getValue(prop) {
            return prop? this.target[this._proprety][prop] :this.target[this._proprety];
        };
        /** create container thats hold all stuff */
        create_containerGroup(){
            const div = document.createElement("div");
            div.setAttribute("id", this._proprety);
            div.classList.add('input-group',this._type);
            return div;
        };

        /** create div for hold proprety name*/
        create_Propreties(){
            const div = this.__proprety = document.createElement("div");
            this._type && div.classList.add('input-group-prepend',this._proprety);
            div.innerHTML = /*html*/`<span class="input-group-text">${this._proprety}</span>`;
            return div;
        }

        /** create a input from type */
        create_input(type=this._type,value,id){
            if(this.options){  //special select case but keep _type
                this.options.select? type = 'select' : this.options.color? type = 'color' : void 0;
            };
            switch (type) {
                case "color"    :return this.create_color    (        ) ; break;
                case "select"   :return this.create_select   (value,id) ; break;
                case "string"   :return this.create_string   (value,id) ; break;
                case "number"   :return this.create_number   (value,id) ; break;
                case "boolean"  :return this.create_boolean  (value,id) ; break;
                case "object"   :return this.create_objet    (        ) ; break;
                case "function" :return this.create_function (        ) ; break;
                default: return null ;break; // simple text si null ou undefined
            };
        };

        create_function(){
            var btn = document.createElement("BUTTON");
            btn.classList.add('btn');
            btn.innerHTML = 'click';
            btn.onclick = this._initialValue
            this.__input.push(btn);
            return btn;
        }
        /** create select tool */
        create_color(value=this.getValue(),options=this.options.color){
            const input = document.createElement("INPUT");
            input.classList.add('form-control');
            input.setAttribute("type", "text");
            this.__input.push(input);
            const color = new jscolor(input,{'zIndex': 99999});
            color.onFineChange = ()=>{
                this.target[this._proprety] = Number(`0x${input.value}`);
            };
            return input;
        };
        /** create select tool */
        create_select(value=this.getValue()){
            const input = document.createElement("SELECT");
            input.setAttribute('id', this._proprety);
            input.classList.add('custom-select');
            input.classList.add('select-'+this._proprety);
            input.setAttribute("type", "select");
            const select = Array.isArray(this.options.select)? Object.entries(this.options.select).map(i=>[i[1],i[1]]) : Object.entries(this.options.select);
            select.forEach(entry => {
                if(this._isFakevalue){
                    value = this._proprety;
                }
                
                var opt = document.createElement("option");
                opt.classList.add('option-'+value);
                const l = entry.length-1;
                opt.text = entry[0];
                opt.value = entry[l];
                opt.selected = entry[l] === value;
                input.options.add(opt);
            });
            this.__input.push(input);
            return input;
        };
        /** setup lelement pour un type string */
        create_string(value=this.getValue()){
            const input = document.createElement("INPUT");
            input.classList.add('form-control');
            input.setAttribute("type", "text");
            input.placeholder = value;
            input.value = value;
            input.classList.add('form-control');
            this.__input.push(input);
            return input;
        };
        /** setup lelement pour un type string */
        create_number(value=this.getValue(), id=this.id){
            this.toFixed(value,true);
            const input = document.createElement("INPUT");
            input.classList.add('form-control');
            input.setAttribute("type", "number");
            input.id = id; //need for sliders attach
            input.placeholder = value;
            input.value = value;
            input.step = this._step;
            this.__input.push(input);
            return input;
        };
        /** setup lelement pour un type string */
        create_boolean(value=this.getValue(),id=this.id){
            const div = document.createElement("div");
            div.classList.add('custom-control', 'custom-checkbox');
            const input = document.createElement("INPUT");
            input.classList.add('custom-control-input');
            input.setAttribute("type", "checkbox");
            input.setAttribute("id", id);
            input.checked = value;
            input.value = value;
            const lbel = document.createElement('label');  // CREATE LABEL.
            lbel.classList.add('custom-control-label');
            lbel.setAttribute('for', id);
            div.appendChild(input);
            div.appendChild(lbel);
            this.__input.push(input);
            return div;
        };
        /** objet contien */
        create_objet(){
            const container = document.createElement("div");
            this.options && this.options.forEach(prop => {
                if(this.target[this._proprety][prop] !== undefined ){
                    const type = typeof this.target[this._proprety][prop]; // le type de la sub proprety
                    const div = document.createElement("div");
                        div.classList.add('input-group');
                    const divGroup = document.createElement("div");
                        divGroup.innerHTML = `<span class="input-group-text formateAttribut">${prop}</span>`
                    const input = this.create_input(type,this.getValue(prop),this.id+prop);
                    this.toFixed(this.getValue(prop),true);
                    input._props = prop;
                    div.appendChild(divGroup);
                    div.appendChild(input);
                    container.appendChild(div)
                };
            });
    
            return container;
        };

        onChange(cb){
            this._onchange = cb;
            return this;
        }

        /** ajoute labels linked a une time line slider debuger */
        label(Timeline){
            const labelSlider = document.createElement('div');
            labelSlider.classList.add('divLabel');
            labelSlider.innerHTML = `<input id="timeLineSlider" type="text"'/>`;
            this.__el.appendChild(labelSlider);
            var slider = this.__SliderTline = new Slider("#timeLineSlider", {
                ticks: Object.values(Timeline.labels),//[0, 100, 200, 300, 400],
                ticks_labels: Object.keys(Timeline.labels),//['$0', '$100', '$200', '$300', '$400'],
                step: 0.01,
                ticks_tooltip: true,
            });
            //!info label (sans les child)
          /*  slider.tickLabels.forEach(DIVTick => {
                const labelId = DIVTick.textContent;
                DIVTick.id = 'tlabel_'+labelId;
                

            const infoLabel = document.createElement('div')
            infoLabel.textContent = `${Timeline.labels[labelId]}`
            infoLabel.setAttribute("style", `
            background: #ffffff78;
            color: brown;
            text-align: initial;
            display: inline-table;
            position: absolute;
            margin-top: -44px;`);
            DIVTick.appendChild(infoLabel);
        });*/

        /*'slide' |'slideStart' |'slideStop' |'change' |'slideEnabled' |'slideDisabled';*/
        slider.on("slide", (value)=>{
            this.target[this._proprety] = value;
        });
    };

        /** definex fixed value, check if > */
        toFixed(value,check){
            let v = value.toString().split('.')[1];
            if(v && check){
                if(!this._fixedValue || v.length>this._fixedValue ){
                    this._fixedValue = v.length;
                }
            }this._fixedValue = v? v.length : 0;
            return this;
        };

        /** make element listent if target objet change value */
        listen(){
            this.parentInspectors.__elements.push(this);
            return this;
        };

        /** define a max value */
        max(value){
            const currentPercent = ((this.getValue() - this._min) * 100) / (this._max - this._min);
            this._max = value;
            return this;
        }
        /** define a min value */
        min(value){
            this._min = value;
            return this;
        };

        /** define step for sliders and inputs */
        step(value){
            this._step = value;
            this.__input.forEach(input => { input.step = value });
            this.toFixed(value);
            return this;
        };
        /** disable interaction with elements */
        disable(value = true){
            this.__input.forEach(input => { value? input.classList.add('disable') : input.classList.remove('disable') });
            return this;
        };
        /** rename the html lements name */
        name(value){
            this.__proprety.lastElementChild.innerHTML = value;
            return this;
        };
        onChange(cb){
            this._onchange = cb;
            return this;
        };
        /** add a slider to input */
        slider(value = true){
            this.__sliders = {};
            const updateDrag = (e,input = this.input)=>{ // position / maxposition * maxvalue
                const smooth = e.ctrlKey && 10 || 1;
                const diff = ~~((this.__dragX-e.screenX)/smooth);
                let value =  +(this.__iniTargetX + (diff*(-input.step)));
                this.hasMax && (value = Math.min(value,this._max));
                this.hasMin && (value = Math.max(value,this._min));
                value = +value.toFixed(this._step.toString().length-1);
                input.value = value+'';
                input.oninput(e,input);
                document.getSelection().empty()
                //this.target[this._proprety]+=(+e.step)
            };
            const endUpdateDrag = (e)=>{
                if(this.input){ // if no currently drag someting
                    Inspectors.__busySlider = false;
                    $app.view.style.pointerEvents = ''; // enable canvas interaction
                    Inspectors.onDragSliders_end();
                    this.input = null;
                    window.removeEventListener('mousemove', updateDrag)
                    window.removeEventListener('mouseup', endUpdateDrag)
                }
               
            };
            const startpdateDrag = (e,input = e.target)=>{
                if(!this.input){ // if no currently drag someting
                    Inspectors.__busySlider = true;
                    $app.view.style.pointerEvents = 'none'; // disable canvas interaction
                    Inspectors.onDragSliders_start();
                    this.__dragX = e.screenX;
                    this.__iniTargetX = this.getValue(input._props);
                    this.input = input;
                    window.addEventListener('mousemove', updateDrag)
                    window.addEventListener('mouseup', endUpdateDrag)
                }
      
            };
            this.__input.forEach(input => {
                if(input.type ==="number"){
                    const div = this.createElement_progress(input.id);
                    const currentPercent = ((this.getValue(input._props) - this._min) * 100) / (this._max - this._min);
                    div.lastElementChild.style = `width: ${currentPercent}%`;
                    input.parentElement.appendChild(div);
                    !this.__sliders[input.id]? this.__sliders[input.id] = div : throws(console.error('id error existe'));
                    Inspectors.RegisterEvents(this._NAME,input,'mousedown',startpdateDrag);
                };
            });
            return this;
        };

        createElement_progress(id){
            const div = document.createElement("div");
            div.id = id
            div.classList.add('progress');
            div.innerHTML = `<div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>`
            return div;
        }
        /**add basic listener from type element */
        initializeListerner(){
            const updateTarget = (e,input = e.target )=>{
                let value;
                switch (input.type) {
                    case 'checkbox': value = input.checked; break;
                    case 'number': value=JSON.parse(input.value); break;
                    case 'select-one': value = isFinite(input.value)?+input.value:input.value; break;
                    default:value=input.value;break;
                }
                input._props? this.target[this._proprety][input._props] = value : this.target[this._proprety] = value;
                if(this.__sliders[input.id]){ // update progress bar
                    const percent = ((value - this._min) * 100) / (this._max - this._min)
                    this.__sliders[input.id].firstElementChild.style.width = `${percent}%`;
                }
                this._onchange (this.target, this._proprety,input.value);
                this.parentInspectors.__folders[this._folderName]._onchange (this.target,this._proprety);
                this.parentInspectors._onchange (this.target,this._proprety,value);
            };

             this.__input.forEach(input => {
                input.oninput = updateTarget;
            });
        };


        destroy(){
            this._onchange = null;
            this.target = null;
            this.options = null;
            this._proprety = null;
            /**drag input for listener */
            this.input = null;
            this.__input = null;
            /** add and store sliders id progress if need */
            this.__sliders = null;
            /** store parent of container element */
            this.__el = null;
        };
    };
    //#endregion

};

