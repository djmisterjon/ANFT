
class _PME_TOAST extends PIXI.Container{
    constructor() {
        super();

    };

    izit_loading1 (stage) { // load all sprites dependency for editor gui only
        console.log('stage: ', stage);
        return{
            transitionOut: 'fadeOutUp',
            id:'izit_loading1',
            timeout:3600,
            theme: 'dark',
            icon: 'icon-person',
            title: 'PLEASE WAIT:',
            message: `Converting Engine for editor in scene:=> ${stage.constructor.name}`,
            position: 'topLeft', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
            progressBarColor: 'rgb(0, 255, 184)',
            backgroundColor: '#3f3f3f',
            progressBarColor:'#f44242',
        };
    };

    savedComplette (){
        return{
            transitionOut: 'fadeOutUp',
            id:'izit_loading1',
            timeout:1000,
            theme: 'dark',
            icon: 'icon-person',
            title: 'SAVED JSON:',
            message: `COMPLETTE`,
            position: 'topCenter', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
            progressBarColor: 'rgb(0, 255, 184)',
            backgroundColor: '#3f3f3f',
            progressBarColor:'#f44242',
        };
    };

    izifactoryUpdate (dataObj){
        return{
            transitionOut: 'fadeOutUp',
            id:'izit_loading1',
            timeout:1000,
            theme: 'dark',
            icon: 'icon-person',
            title: 'FACTORY:UPDATED',
            message: `${dataObj._textureName} gid:${dataObj._globalId}`,
            position: 'topLeft', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
            progressBarColor: 'rgb(0, 255, 184)',
            backgroundColor: '#3f3f3f',
            progressBarColor:'#f44242',
        };
    };

    iziMessage (title,message){
        return{
            transitionOut: 'fadeOutUp',
            id:'izit_loading1',
            timeout:1000,
            theme: 'dark',
            icon: 'icon-person',
            title: title,
            message: message,
            position: 'topLeft', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
            progressBarColor: 'rgb(0, 255, 184)',
            backgroundColor: '#3f3f3f',
            progressBarColor:'#f44242',
        };
    };






     //#region [rgba(100, 100, 100, 0.25)]
 

    /** setup de la scene, background ... */
    create_datGui_sceneSetup(){
        const name = 'SCENE_SETUP';
        const div = document.createElement("div");
        div.setAttribute("id", name);
        div.style.position = "absolute";
        div.style.top = "300px";
        div.style.left = "200px";
        div.style.opacity = 0.95;
        document.body.appendChild(div);
        
        //#gui
        const bgList = Object.values($loader.DATA2).filter(c =>  { return c.isBackground}).map(c => c._dataBaseName);
        const gui = this._debug = new Inspectors({ resizable:true, autoPlace: false, name:name, closeOnTop:true });
        gui.x(85).y(400);
        const f0 = gui.addFolder('Setup');
        const data = {
            background:$stage.scene.Background._dataBaseName,// default background name
            goto:$stage.scene.constructor.name, // class scene constructor name
        }; 
        
        f0.add(data, 'background',{select:bgList}).onChange((data)=>{
            $stage.scene.initialize_background(data.background);
        })
        f0.add(data, 'goto',{select:$loader.scenesKits.flat()}).onChange((data)=>{
            $stage.goto(data.goto);
        })

    };


    remove_Inspector(dataObj){
        const NAME = `${dataObj.constructor.name}_${dataObj._globalId}-${dataObj._localId}`;
        return Inspectors.DESTROY(NAME);
    };

    /**inspector pour dataObj, showButton en mode edit click gauche */
    create_Inspector(dataObj,showButtons){
        const NAME = `${dataObj.constructor.name}_${dataObj._globalId}-${dataObj._localId}`;
        if(Inspectors.GUI[NAME]){return};
        const dataBase = dataObj.dataBase;
        const gui = new Inspectors(NAME).x(Math.max(window.innerWidth-310,0));
        gui.onChange = (e)=>{this.update_debug(dataObj,e)};
        //TODO: fair un BREADCUM styte scan les parent et children
        // les information sont choisis avec presision car si le dataObj est super() cases,door,light... les props sont inclu au meme endroit
        const f0 = gui.addFolder('[G] FACTORY').disable().close();
        const DataObj_Base_keys = Object.getOwnPropertyNames( new _DataObj_Base() );
        const dataObj_Base = ['_type','_globalId','_localId','_dataBaseName','_textureName'];
        dataObj_Base.forEach(k=> k!=='factory' && f0.add(dataObj,k));
        ['_url','_type','_category'].forEach(k=>f0.add(dataBase,k));
        
        const options = {
            syncDN:true,
            set preset(value){//# LES PRESET PERMET DE FORMATER DES VALEURS PROCHE DU TYPE OBJET VOULUE
                if(value === 'Cases'){
                    dataObj._type = 'Cases';
                    dataObj.child.euler.x = -Math.PI/2;
                    dataObj.child.scale3d.set(0.5);
                    dataObj.child.pivot3d.y = -100;
                };
                if(value === 'Door-Left'){
                    dataObj.child.d.anchor.set(0.95);
                    dataObj.child.n.anchor.set(0.95);
                };
                if(value === 'size@0.4'){
                    dataObj.child.scale3d.set(0.4);
                };
                //! reBuild with preset
                setTimeout(function(){
                    dataObj.initializeFactory();
                    dataObj.removeFromRegister();
                    $PME.remove_toMouse(dataObj);
                    const _dataObj = $objs.createFrom(dataObj.clone(true));
                    $objs.addToGlobalRegister(_dataObj,$objs.GLOBAL.findEmptyIndex());
                    $objs.addtoLocalRegister (_dataObj,$objs.LOCAL .findEmptyIndex());
                    _dataObj.asignFactory(dataObj.factory);
                    $PME.add_toMap(_dataObj);
                    $PME.add_toMouse(_dataObj);
                }, 20);
            },
            get preset(){ return 'none' },
        }; // synconisation des oversable pour diffuse et normal
        const F1 = gui.addFolder('INSPECTORS OPTIONS');
        F1.add(options, 'syncDN').name('Syncronize diffuse-Normal');
        F1.add(options, 'preset',{select:['none','Cases','Door-Left','size@0.4']});

        const onChange = (target,prop)=>{ // observable change , update diffuse normal if need
            if(options.syncDN){
                if(target.parent.d === target){
                    target.parent.n[prop].copy(target[prop])
                }else
                if(target.parent.n === target){
                    target.parent.d[prop].copy(target[prop])
                }
            };
            this.update_debug(dataObj);
        };
        function addData(folder,target,key,mapper) {
            switch (key) {
                case 'tint':
                    folder.add(target, key,{ color:{}  })
                    break;
                case 'parentGroupId':
                    folder.add(target ,key,{ select:{'[-1]-NONE': -1, '[0]-bg': 0, '[1]-map': 1, '[2]-map': 2, '[3]-mapGui': 3, '[4]-menueGui': 4, '[5]-txt': 5  }});
                    break;
                case 'blendMode':
                    folder.add(target ,key,{ select:{'[0]-NORMAL': 0, '[1]-ADD': 1, '[2]-MULTIPLY': 2, '[3]-SCREEN': 3, '[4]-OVERLAY': 4, '[5]-DARKEN': 5, '[6]-LIGHTEN': 6  }}).listen()
                    break;
                case 'alpha':
                    folder.add(target ,key).listen().min(0).max(2).step(0.05).slider();
                    break;
                case 'rotation':
                    folder.add(target ,key).listen().min(-Math.PI).max(Math.PI).step(0.001).slider();
                    break;
                case 'position3d':case 'pivot3d': case'position':case 'pivot':
                    folder.add(target,key,mapper).listen().step(2);
                    break;
                case 'affine':
                    folder.add(target,key,{ select:{'[0]-NONE': 0, '[1]-FREE': 1, '[2]-AXIS_X': 2, '[3]-AXIS_Y': 3, '[4]-POINT': 4, '[5]-AXIS_XR': 5, '[6]-ISO': 6 }})
                    break;
                case 'scale3d':case 'scale':case 'skew':
                    folder.add(target,key,mapper).listen().step(0.01);
                    break;
                case 'euler':
                    folder.add(target,key,mapper).listen().step(0.01);
                    break;
                case 'anchor':
                    folder.add(target,key,mapper).listen().min(0).max(1).step(0.01);
                    break;
                case 'pathConnexion':
                    folder.add(target,key,Object.keys(target[key])).disable()
                    break;
                case 'bounty':
                    folder.add(target ,key,{ select:$systems.gameBounties.keys})
                    break;
                case 'color':
                    folder.add(target ,key,{ select:$systems.colorsSystem.keys})
                    break;
                default: 
                    folder.add(target ,key).listen() 
                ;break;
            }
        };
        const KEYS = ['p','s','a','l','d','n'];
        for (let i=0, l=KEYS.length; i<l; i++) {
            const KEY = KEYS[i];
            const target = dataObj.child[KEY];
            if(!target){ continue };//!continue next folders
            const F = gui.addFolder(`[${KEY.toUpperCase()}] FACTORY`).slider(); // ex: P FACTORY
            ['s','a','l','d','n'].contains(KEY) && F.close();
            //!propreties
            Factory.FLATTERS.propreties.base.concat(Factory.FLATTERS.propreties.layers).forEach(key=>{
                if(target[key] !==undefined){
                    addData(F,target,key);
                };
            });
            let FF; //subfolders
            //!proj
            FF = F.addFolder(`${KEY}.PROJECTIONS`).slider().close();
            addData(FF,target.proj,'affine');
            addData(FF,target.proj,'affinePreserveOrientation');
            addData(FF,target.proj,'cameraMode');
            addData(FF,target.proj,'scaleAfterAffine');
            
            //!obeservable
            FF = F.addFolder(`${KEY}.OBSERVABLES`).slider().onChange(onChange);
            Factory.FLATTERS.Observable.ALL.sort((a, b) => a.localeCompare(b)).forEach(key=>{
                if(target[key] !==undefined){
                    addData(FF,target,key,['x','y','z']);
                };
            });
        };
        //!DATABASE TYPE. Si ces un data_base special [cases,door,light..] filtrer stocker les extra information ici.
        //FIXME: trouver un moyen de onChange , rebuild tous ? ou inclure les getter setter ?
        if(dataObj._type !== 'base'){
            const F = gui.addFolder(`[B] FACTORY ${dataObj._type}`);
            const keys = ['color','bounty'];//Object.keys(dataObj).filter(k=>!dataObj_Base.contains(k));
            keys.forEach(k=>{
                addData(F,dataObj,k);
            });
        }
        
        

        /** buttons seulement en mode click droit lorsque deja sur map */
        if(showButtons){
            gui.addButton('SAVE',(e)=>{
                iziToast.warning( this.izifactoryUpdate(dataObj) );
                dataObj.initializeFactory();
                Inspectors.DESTROY(NAME);
    
            },'btn-success');
            gui.addButton('CANCEL',(e)=>{
                dataObj.asignFactory();
                Inspectors.DESTROY(NAME);
            },'btn-danger');
            gui.addButton('RESTOR',(e)=>{ 
                dataObj.asignFactory();
            },'btn-warning');
        };


    };
    /** creer les dat.gui permanent  */
    create_datGui(dataObj){
        const NAME = dataObj.constructor.name;
        const dataBase = dataObj.dataBase;
        const gui = new DatGuiExtra({ autoPlace: false, name:NAME, closeOnTop:true ,closed:false});
        const mouseDown_insideGui = ()=>{
            gui.domElement.style.opacity = 1;
            this._busyDatGui = true;
            $stage.interactiveChildren = false;
        };
        const mouseUp_insideGui = ()=>{
            gui.domElement.style.opacity = '';
            this._busyDatGui = false;
            $stage.interactiveChildren = true;
        };
        const debugUpdat = ()=>{this.update_debug(dataObj)};
        gui.addListeners(gui.domElement,'mousedown',mouseDown_insideGui);
        gui.addListeners(gui.domElement,'mouseup',mouseUp_insideGui);
        const f0 = gui.addFolder('Information',["disable"]);
        f0.closed = false;
        Object.keys(dataObj).forEach(k=>f0.add(dataObj,k));
        ['_url','_type','_category'].forEach(k=>f0.add(dataBase,k));
        
      
        function addData(folder,KEY,key,mapper) {
            switch (key) {
                case 'tint':
                    folder.addColor(dataObj.child[KEY] ,key).name(`${KEY}.${key}`).listen()
                    break;
                case 'parentGroupId':
                    folder.add(dataObj.child[KEY] ,key,{ '[-1]-NONE': -1, '[0]-bg': 0, '[1]-map': 1, '[2]-map': 2, '[3]-mapGui': 3, '[4]-menueGui': 4, '[5]-txt': 5  }).name(`${KEY}.${key}`).listen()
                    break;
                case 'blendMode':
                    folder.add(dataObj.child[KEY] ,key,{ '[0]-NORMAL': 0, '[1]-ADD': 1, '[2]-MULTIPLY': 2, '[3]-SCREEN': 3, '[4]-OVERLAY': 4, '[5]-DARKEN': 5, '[6]-LIGHTEN': 6  }).name(`${KEY}.${key}`).listen()
                    break;
                case 'alpha':
                    folder.add(dataObj.child[KEY] ,key).name(`${KEY}.${key}`).listen().min(0).max(2).step(0.05);
                    break;
                case 'rotation':
                    folder.add(dataObj.child[KEY] ,key).name(`${KEY}.${key}`).listen().min(-Math.PI).max(Math.PI).step(0.001);
                    break;
                case 'position3d':case 'pivot3d': case'position':case 'pivot':
                    folder.add(dataObj.child[KEY][key] ,mapper).name(`.${mapper}`).listen().step(2);
                    break;
                case 'scale3d':case 'scale':case 'skew':
                    folder.add(dataObj.child[KEY][key] ,mapper).name(`.${mapper}`).listen().step(0.01);
                    break;
                case 'euler':
                    folder.add(dataObj.child[KEY][key] ,mapper).name(`.${mapper}`).listen().step(0.01);
                    break;
                case 'anchor':
                    folder.add(dataObj.child[KEY][key] ,mapper).name(`.${mapper}`).listen().min(0).max(1).step(0.01);
                    break;
                default: 
                    folder.add(dataObj.child[KEY] ,key).name(`${KEY}.${key}`).listen() 
                ;break;
            }
        };

        ['p','s','a','l','d','n'].forEach(KEY => {
            if(dataObj.child[KEY]){
                const F = gui.addFolder(`[${KEY.toUpperCase()}] FACTORY`); // ex: P FACTORY
                let FF;
                //! sub foldering.
                //# display
                FF = F.addFolder(`${KEY}.display`);
                Factory.FLATTERS.propreties.base.concat(Factory.FLATTERS.propreties.layers).forEach(key=>{
                    if(dataObj.child[KEY][key] !==undefined){
                        addData(FF,KEY,key);
                    };
                })
                if(dataObj.dataBase.isSpineSheets){
                    //# spines
                    FF = F.addFolder(`${KEY}.spine`);
                    Factory.FLATTERS.propreties.spines.forEach(key=>{
                        if(dataObj.child[KEY][key] !==undefined){
                            addData(FF,KEY,key);
                        };
                    })
                };

                if(dataObj.dataBase.isAnimationSheets){
                    //# animations
                    FF = F.addFolder(`${KEY}.animations`);
                    Factory.FLATTERS.propreties.animations.forEach(key=>{
                        if(dataObj.child[KEY][key] !==undefined){
                            addData(FF,KEY,key);
                        };
                    })
                };

                //# obeservacle
                Factory.FLATTERS.Observable.ALL.sort((a, b) => a.localeCompare(b)).forEach(key=>{
                    if(dataObj.child[KEY][key] !==undefined){
                        var FF = F.addFolder(`.${key}`);
                        FF.closed = false;
                        addData(FF,KEY,key,'x');
                        addData(FF,KEY,key,'y');
                        addData(FF,KEY,key,'z');
                    };
                })

            }
            /*if(dataObj.child[KEY]){
                const F = gui.addFolder(`[${KEY.toUpperCase()}] FACTORY`);
                //!Base
                let Base = ['alpha','tint','blendMode','rotation','parentGroupId'];
                var f = F.addFolder(`${KEY}.Base`);
                Base.forEach(key => {
                    if(dataObj.child[KEY][key] !==undefined){
                        addData(f,KEY,key);
                    };
                });
                //!ObservablePoint3d
                let ObservablePoint3d = ['position3d','pivot3d','scale3d'];
                var f = F.addFolder(`${KEY}.ObservablePoint3d`);
                ObservablePoint3d.forEach(key => {
                    if(dataObj.child[KEY][key] !==undefined){
                        var ff = f.addFolder(`.${key}`);
                        ff.closed = false;
                        addData(ff,KEY,key,'x');
                        addData(ff,KEY,key,'y');
                        addData(ff,KEY,key,'z');
                    };
                });
                //!ObservablePoint
                let ObservablePoint = ['position','pivot','scale','skew','anchor'];
                var f = F.addFolder(`${KEY}.ObservablePoint`);
                ObservablePoint.forEach(key => {
                    if(dataObj.child[KEY][key] !==undefined){
                        var ff = f.addFolder(`.${key}`);
                        ff.closed = false;
                        addData(ff,KEY,key,'x');
                        addData(ff,KEY,key,'y');
                    };
                });
            };*/
            
        });
     

    
        /*const fSplitter = ['ObservablePoint','Projection3d','ObservableEuler'];
        const [p,d,n] = [dataObj.factory.p, dataObj.factory.d, dataObj.factory.n];
        const KEYS = dataObj.factory.p.extractKeys();
        const f1 = gui.addFolder('FACTORY .container');
        f1.closed = false;
        KEYS.values.forEach(key => {
            f1.add(dataObj.child ,key).name(`.${key}`).listen();
        });
        KEYS.points.forEach(key => {
            const fName = dataObj.child[key].constructor.name;
            const _f1 = f1.__folders[fName] || f1.addFolder(fName);
            _f1.closed && (_f1.closed = false);
            for (const _key in dataObj.factory.p[key]) {
                const prop = _f1.add(dataObj.child[key] ,_key).name(`.${key}.${_key}`).listen();
                if(['scale','skew','euler'].contains(key)){
                    prop.step(0.01);
                }
                if('pivot'){
                    prop.onChange(debugUpdat);
                }
            }
           
        });*/

            /*
            f1.add(p ,"renderable");
            f1.add(p ,"zOrder");
            
            f1.add(p.euler ,"x"    ).step(0.01).name(".euler.x"    );
            f1.add(p.euler ,"y"    ).step(0.01).name(".euler.y"    );
            f1.add(p.euler ,"z"    ).step(0.01).name(".euler.z"    );
            f1.add(p.euler ,"pitch").step(0.01).name(".euler.pitch");
            f1.add(p.euler ,"roll" ).step(0.01).name(".euler.roll" );
            f1.add(p.euler ,"yaw"  ).step(0.01).name(".euler.yaw"  );
            f1.add(p.euler ,"_quatUpdateId");
            f1.add(p.position3d ,"x").name(".position3d.x");
            f1.add(p.position3d ,"y").name(".position3d.x");
            f1.add(p.position3d ,"z").name(".position3d.x");
            f1.add(p.pivot3d ,"x").name(".pivot3d.x");
            f1.add(p.pivot3d ,"y").name(".pivot3d.y");
            f1.add(p.pivot3d ,"z").name(".pivot3d.z");
            f1.add(p.scale3d ,"x").name(".scale3d.x");
            f1.add(p.scale3d ,"y").name(".scale3d.y");
            f1.add(p.scale3d ,"z").name(".scale3d.z");
            const _f1_0 = f1.addFolder('.d :DIFFUSE');
                _f1_0.add(d ,"renderable");
                _f1_0.add(d ,"zOrder");
                _f1_0.add(d.position3d ,"x").name(".position3d.x");
                _f1_0.add(d.position3d ,"y").name(".position3d.y");
                _f1_0.add(d.position3d ,"z").name(".position3d.z");
            const _f1_1 = f1.addFolder('.n :NORMAL');
           _f1_1.add(n ,"renderable");
           _f1_1.add(n ,"zOrder");
           _f1_1.add(n.position3d ,"x").name(".position3d.x");
           _f1_1.add(n.position3d ,"y").name(".position3d.y");
           _f1_1.add(n.position3d ,"z").name(".position3d.z");
           */

        const buttons = {
            CANCEL:()=>{ gui.destroy() },
            SAVEFACTORY:()=>{
                iziToast.warning( this.izifactoryUpdate(dataObj) );
                dataObj.initializeFactory();
                gui.destroy();
            },
        };
        gui.add(buttons,'CANCEL');
        gui.add(buttons,'SAVEFACTORY').name('SAVE');

        gui.addToDraggableDiv(void 0,void 0,Math.max(window.innerWidth-gui.width,0));
        gui.propretyToClass();
    };

    /** crer inspecteur pour la thumbs library */
    create_Inspector_thumbsLibs(close){
        const NAME = `ALTLAS LIBRARY`;
        if(close){ return Inspectors.DESTROY(NAME)};
        if(Inspectors.GUI[NAME]){return};
        const gui = new Inspectors(NAME).x(1220);
        const f1 = gui.addFolder('Total').disable()//.inline();
            f1.add(this.LIBRARY_BASE.THUMBS.children, 'length' ).name('TOTAL LIBS'     );
            f1.add(Object.keys(this.categoryFilters), 'length' ).name('TOTAL CATEGORY' );

        const f2 = gui.addFolder('FILTERS BY TYPE').table(['Types','counts']);
        Object.keys(this.thumbsfilters).forEach((type,i) => {
            f2.addRow(i,this.thumbsfilters, type);
        });
        Object.keys(this.thumbsfilters).forEach((type,i) => {
            f2.addRow(i,null, `(${ this.LIBRARY_BASE.THUMBS.children.filter((t)=>t.data._type===type  ).length })`);
        });
        const f3 = gui.addFolder('FILTERS BY CATEGORY').table(['Category','counts']);
        const cb_check = (e)=>{
            this.filtering_LIBRARY_BASE()
        };
        Object.keys(this.categoryFilters).forEach((cat,i) => {
            f3.addRow(i,this.categoryFilters, cat);
        });
        Object.keys(this.categoryFilters_total).forEach((cat,i) => {
            f3.addRow(i,null, `(${this.categoryFilters_total[cat]})`);
        });

//
// f2.add(this.thumbsfilters, 'spriteSheets'    ).name(`SpriteSheets  `  ).addColum(info.isSpriteSheets    ).listen().onChange(updateThumbs);
// f2.add(this.thumbsfilters, 'spineSheets'     ).name(`SpineSheets   `  ).addColum(info.isSpineSheets     ).listen().onChange(updateThumbs);
// f2.add(this.thumbsfilters, 'animationSheets' ).name(`AnimationSheets` ).addColum(info.isAnimationSheets ).listen().onChange(updateThumbs);
// f2.add(this.thumbsfilters, 'multiPacks'      ).name(`MultiPacks    `  ).addColum(info.isMultiPacks      ).listen().onChange(updateThumbs);
// f2.add(this.thumbsfilters, 'video'           ).name(`Video         `  ).addColum(info.isVideo           ).listen().onChange(updateThumbs);
// f2.add(this.thumbsfilters, 'Background'      ).name(`Background    `  ).addColum(info.isBackground      ).listen().onChange(updateThumbs);
// f2.add(this.thumbsfilters, 'Light'           ).name(`Light         `  ).addColum(info.isLight           ).listen().onChange(updateThumbs);
    };

    /** creer les dat.gui permanent library */
    create_datGuidaadad(dataObj){
        const NAME = dataObj.constructor.name;
        const gui = new DatGuiExtra({ autoPlace: false, name:NAME, closeOnTop:true ,closed:false});
        gui.addToDraggableDiv();

        return dataObj;
        // custom div camera position
        const name = 'THUMBS';
        const div = document.createElement("div");
            div.setAttribute("id", name);
            div.style.position = "absolute";
            div.style.top = "2px";
            div.style.left = "1100px";
            div.style.opacity = 0.95;
        document.body.appendChild(div);

        //#gui
        const updateThumbs = ()=>{ this.filtering_LIBRARY_BASE() };
        const info = {
            isSpriteSheets   :this.LIBRARY_BASE.THUMBS.children.filter((t)=>t.data.isSpriteSheets   ).length,
            isSpineSheets    :this.LIBRARY_BASE.THUMBS.children.filter((t)=>t.data.isSpineSheets    ).length,
            isAnimationSheets:this.LIBRARY_BASE.THUMBS.children.filter((t)=>t.data.isAnimationSheets).length,
            isMultiPacks     :this.LIBRARY_BASE.THUMBS.children.filter((t)=>t.data.isMultiPacks     ).length,
            isVideo          :this.LIBRARY_BASE.THUMBS.children.filter((t)=>t.data.isVideo          ).length,
            isBackground     :this.LIBRARY_BASE.THUMBS.children.filter((t)=>t.data.isBackground     ).length,
            isLight          :this.LIBRARY_BASE.THUMBS.children.filter((t)=>t.data.isLight          ).length,
        };
       // const gui = this.datGui.THUMBS = new dat.GUI({ resizable:true, autoPlace: false, name:name, closeOnTop:true });
        const f1 = gui.addFolder('Total');
            f1.closed = false;
            f1.add(this.LIBRARY_BASE.THUMBS.children, 'length' ).name('TOTAL LIBS'     ).disable(true).cell();
            f1.add(Object.keys(this.categoryFilters), 'length' ).name('TOTAL CATEGORY' ).disable(true).cell();
        const f2 = gui.addFolder('FILTER BY TYPE');
            f2.closed = false;
            gui.toggleCheckType= ()=>{
                gui.__checkType = !gui.__checkType;
                for (const key in this.thumbsfilters) { this.thumbsfilters[key] = gui.__checkType };
                this.filtering_LIBRARY_BASE();
            };
            f2.add(gui, 'toggleCheckType').name(`[check/uncheck]`);
            f2.add(this.thumbsfilters, 'spriteSheets'    ).name(`SpriteSheets  `  ).addColum(info.isSpriteSheets    ).listen().onChange(updateThumbs);
            f2.add(this.thumbsfilters, 'spineSheets'     ).name(`SpineSheets   `  ).addColum(info.isSpineSheets     ).listen().onChange(updateThumbs);
            f2.add(this.thumbsfilters, 'animationSheets' ).name(`AnimationSheets` ).addColum(info.isAnimationSheets ).listen().onChange(updateThumbs);
            f2.add(this.thumbsfilters, 'multiPacks'      ).name(`MultiPacks    `  ).addColum(info.isMultiPacks      ).listen().onChange(updateThumbs);
            f2.add(this.thumbsfilters, 'video'           ).name(`Video         `  ).addColum(info.isVideo           ).listen().onChange(updateThumbs);
            f2.add(this.thumbsfilters, 'Background'      ).name(`Background    `  ).addColum(info.isBackground      ).listen().onChange(updateThumbs);
            f2.add(this.thumbsfilters, 'Light'           ).name(`Light         `  ).addColum(info.isLight           ).listen().onChange(updateThumbs);
        const f3 = gui.addFolder('FILTER BY CATEGORY');
            gui.toggleCheckCategory = ()=>{
                gui.__checkCategory = !gui.__checkCategory;
                for (const key in this.categoryFilters) { this.categoryFilters[key] = gui.__checkCategory };
                this.filtering_LIBRARY_BASE()
            };
            f3.add(gui, 'toggleCheckCategory').name(`[check/uncheck]`);
            Object.keys(this.categoryFilters).forEach(cat => {
                f3.add(this.categoryFilters, cat).addColum(this.categoryFilters_total[cat]).listen().onChange(updateThumbs);
            });
        gui.hide(); // hide, show only when open thumbs libs
        document.getElementById(name).appendChild(gui.domElement);
    };

    /** creer les dat.gui permanent  */
    create_Inspector_save(){
        const NAME = `SAVEJSON`;
        if(Inspectors.GUI[NAME]){return};
        const gui = new Inspectors(NAME).x(500);
        const mu = process.memoryUsage()

        function formatBytes(bytes, decimals = 2) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        };

        const options = {
            isSpriteSheets    :$stage.scene.children.filter((t)=>t.dataObj && t.dataObj.dataBase.isSpriteSheets    ).length,
            isSpineSheets     :$stage.scene.children.filter((t)=>t.dataObj && t.dataObj.dataBase.isSpineSheets     ).length,
            isAnimationSheets :$stage.scene.children.filter((t)=>t.dataObj && t.dataObj.dataBase.isAnimationSheets ).length,
            mem:{
                external :formatBytes(mu.external ),
                heapTotal:formatBytes(mu.heapTotal),
                heapUsed :formatBytes(mu.heapUsed ),
                rss      :formatBytes(mu.rss      ),
            },
            options: {
                rebootWithThisScene  :false,
                checkHash32Integrity :false,
                exportPhotoshopLayers:false,
            }
        };
        const f1 = gui.addFolder('MEMORY').disable();
        f1.add(options, 'mem', ['external','heapTotal','heapUsed','rss'] );
        const f2 = gui.addFolder('ELEMENTS').disable();
        f2.add(options, 'isSpriteSheets'    )//.name('TOTAL.SpriteSheets'    );
        f2.add(options, 'isSpineSheets'     )//.name('TOTAL.SpineSheets'     );
        f2.add(options, 'isAnimationSheets' )//.name('TOTAL.AnimationSheets' );
        const f3 = gui.addFolder('OPTIONS');
        f3.add(options.options, 'rebootWithThisScene'  )
        f3.add(options.options, 'checkHash32Integrity' )
        f3.add(options.options, 'exportPhotoshopLayers')

        gui.addButton('SAVE',(e)=>{
            //iziToast.warning( this.izifactoryUpdate(dataObj) );
            Inspectors.DESTROY(NAME);
            this.startSaveDataToJson(options)

        },'btn-success');
        gui.addButton('CANCEL',(e)=>{ 

        },'btn-danger');
        gui.addButton('CLEAR',(e)=>{ 
            confirm("ARE YOU SURE TO CLEAR SCENES AND ALL EVENTS") && this.clearScene();
        },'btn-warning');
        gui.addButton('LOAD',(e)=>{ 

        },'btn-light');
        
    }
    

    //#endregion
};