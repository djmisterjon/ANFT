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
       
        f1.add(Light, "color",{color:true} )
        f1.add(Light, "indices" ).step(0.1);
        f1.add(Light, "alpha" ).step(0.1);
        return gui;
    };
    //#endregion

 //#region [Static]
 /** Inspect un display Obj pour Debug */
    static DisplayObj(DisplayObj,Debug){
        const gui = new Inspectors(DisplayObj.constructor.name+" - "+DisplayObj.name, ' inspector Debug');
        const f1 = gui.addFolder('DisplayObj').listen().slider();
        f1.add(DisplayObj, "position",['x','y'] ).step(1);
        f1.add(DisplayObj, "scale",['x','y'] ).step(0.01);
        return gui;
    };
    //#endregion


    //#region [Static]
    static DataObj(DataObj = new DataObj_Case() ){
        const name = `${DataObj.constructor.name}_${DataObj._globalId}-${DataObj._localId}`;
        if(this.GUI[name]){return console.error('Un inspector est deja ouvert avec ce Id: ',name)};
        const Gui = new Inspectors(name);
        const onChange = DataObj.child.Debug? Gui.onChange( ()=>{$PME.update_debug(DataObj)} ) : void 0;

        //Gui.onChange() = (e)=>{ this.update_debug(dataObj,e) }; TODO:
        //![P] ParentContainer
        if(DataObj.child){
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
                    case '_identifiable':
                        F.add(DisplayObject ,k).listen()
                    break;
                        
                    default: return F.add(DisplayObject ,k).listen();  break;
                }
            }
            //![G] DataObj_Base 
            const f0 = Gui.addFolder('[B] FACTORY GLOBAL').close(); //.disable()
            const DataObj_Base_keys = Object.keys( new _DataObj_Base() );
                DataObj_Base_keys.forEach(k=>{
                    const el = add(f0,DataObj,k);
                    ['_globalId','_localId','_url','_type','_category'].contains(k) && el.disable(); //lock et protege certaines props
                });
            //![C] [DataObj_Case,DataObj_Wall,DataObj_Chara.....] from category
            if(DataObj.constructor.name !== '_DataObj_Base'){
                const f1 = Gui.addFolder('[C] FACTORY CATEGORY').close();
                const DataObj_CategoryKeys = Object.keys( new DataObj.constructor() );
                DataObj_CategoryKeys.remove(...DataObj_Base_keys);
                DataObj_CategoryKeys.forEach(k=>{
                    const el = add(f1,DataObj,k);
                    [].contains(k) && el.disable(); //lock et protege certaines props
                });
            };

            const CKeys = ['p','s','a','l','d','n']; // _Container_Base keys
            for (let i=0, l=CKeys.length; i<l; i++) {
                const key = CKeys[i];
                const DisplayObject = DataObj.child[key];
                if(DisplayObject){
                    const F = Gui.addFolder(`[${key.toUpperCase()}] FACTORY DisplayObject`).slider();
                    //!propreties Container
                    if(DisplayObject instanceof _Container_Base){
                        Factory.FLATTERS.propreties.container.forEach(k=>{
                            add(F,DisplayObject,k);
                        });
                    };
                    //!propreties Sprites ,d,n
                    if(DisplayObject instanceof PIXI.Sprite){
                        Factory.FLATTERS.propreties.sprite.forEach(k=>{
                            add(F,DisplayObject,k);
                        });
                    };
                    //!propreties Spine
                    if(DisplayObject instanceof _Container_Spine){
                        Factory.FLATTERS.propreties.spines.forEach(k=>{
                            add(F,DisplayObject,k);
                        });
                    };
                    //!propreties Animation
                    if(DisplayObject instanceof _Container_Animation){
                        Factory.FLATTERS.propreties.animations.forEach(k=>{
                            add(F,DisplayObject,k);
                        });
                    };
                    //!propreties proj
                    if(DisplayObject.proj){
                        const FF = F.addFolder(`${key}.PROJECTIONS`);
                        Factory.FLATTERS.propreties.proj.forEach(k=>{
                            add(FF,DisplayObject,k);
                        });
                    };
                    //!obeservable
                    if(DisplayObject instanceof PIXI.DisplayObject){
                        const FF = F.addFolder(`${key}.OBSERVABLES`).slider();
                        Factory.FLATTERS.Observable.ALL.sort((a, b) => a.localeCompare(b)).forEach(k=>{
                            add(FF,DisplayObject,k);
                        });
                    }
                };
            };
            //!button
            /** buttons seulement en mode click droit lorsque deja sur map */
            Gui.addButton('SAVE',(e)=>{
                //iziToast.warning( this.izifactoryUpdate(DataObj) ); //todo: si editor PME
                DataObj.initializeFactory();
                Inspectors.DESTROY(name);
    
            },'btn-success');
            Gui.addButton('CANCEL',(e)=>{
                DataObj.asignFactory();
                Inspectors.DESTROY(name);
            },'btn-danger');
            Gui.addButton('RESTOR',(e)=>{ 
                DataObj.asignFactory();
            },'btn-warning');
                
        };

        
    };
    //#endregion
    
    /** when drag from slider is busy */
    static get pixiApp(){return window.PIXI && window.app || (typeof $app !== void 0+'') && $app; }
    static __busySlider = false;
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
    constructor(name,descriptions,options={frequency:200}) {
        Inspectors.GUI[name] = this;
        Inspectors.EVENTS[name] = [];
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

        /** bottom buttons */
        this.__buttons = [];

        this.initialize();
        this.initializeListeners();
        
        const update = ()=>{this.update(this.__elements)};
        this.__update = setInterval(update, options.frequency||100);
        this.x(300*(Object.keys(Inspectors.GUI).length-1));
    };
    get parentInspectors() {return Inspectors.GUI[this._name]};

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
    
        //#draggable
        function limit(x, y, x0, y0) {
            x<0?x=0:x>window.innerWidth-120?x=window.innerWidth-120:x;
            y<0?y=0:y>window.innerHeight-120?y=window.innerHeight-120:y;
            return {
              x: x||0,
              y: y||0
            };
          };
          const preventDrag = (e)=>{
              return e.classList[1] === 'slideIn';
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
       
    };

    /** listen elements */
    update(elements){
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

        add(target,proprety,selects){
            const el = new Inspectors.ELEMENT(target,proprety,selects,this._NAME,this._name);
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
                case "color"  :return this.create_color ()  ; break;
                case "select" :return this.create_select (value,id) ; break;
                case "string" :return this.create_string (value,id) ; break;
                case "number" :return this.create_number (value,id) ; break;
                case "boolean":return this.create_boolean(value,id) ; break;
                case "object" :return this.create_objet()   ; break;
                default: return null ;break; // simple text si null ou undefined
            };
        };
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
            input.classList.add('custom-select');
            input.setAttribute("type", "select");
            const select = Array.isArray(this.options.select)? Object.entries(this.options.select).map(i=>[i[1],i[1]]) : Object.entries(this.options.select);
            select.forEach(entry => {
                var opt = document.createElement("option");
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
                    Inspectors.onDragSliders_end();
                    this.input = null;
                    window.removeEventListener('mousemove', updateDrag)
                    window.removeEventListener('mouseup', endUpdateDrag)
                }
               
            };
            const startpdateDrag = (e,input = e.target)=>{
                if(!this.input){ // if no currently drag someting
                    Inspectors.__busySlider = true;
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
                input._props?this.target[this._proprety][input._props] = value : this.target[this._proprety] = value;
                if(this.__sliders[input.id]){ // update progress bar
                    const percent = ((value - this._min) * 100) / (this._max - this._min)
                    this.__sliders[input.id].firstElementChild.style.width = `${percent}%`;
                };
       
                this._onchange (this.target,this._proprety);
                this.parentInspectors.__folders[this._folderName]._onchange (this.target,this._proprety);
                this.parentInspectors._onchange (this.target,this._proprety);
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

