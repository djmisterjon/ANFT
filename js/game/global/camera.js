/*:
// PLUGIN □────────────────────────────────□CAMERA CORE ENGINE□───────────────────────────────┐
* @author □ Jonathan Lepage (dimisterjon),(jonforum) 
* @plugindesc camera 2.5D engine with pixi-projection, all camera events store here
* V.0.1a
* License:© M.I.T
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
*/
// TODO: TODO: CHECK POUR CAMERA 2.5D
/*updateSkew()
{
    this._cx = Math.cos(this._rotation + this.skew._y);
    this._sx = Math.sin(this._rotation + this.skew._y);
    this._cy = -Math.sin(this._rotation - this.skew._x); // cos, added PI/2
    this._sy = Math.cos(this._rotation - this.skew._x); // sin, added PI/2
    this._localID ++;
}*/
// ┌-----------------------------------------------------------------------------┐
// GLOBAL $camera CLASS: _camera
//└------------------------------------------------------------------------------┘
/**@description camera view-port and culling */

class _camera {
    constructor() {
        /**@type {PIXI.projection.Camera3d} */
        this.view = new PIXI.projection.Camera3d();
        this.renderable = 1;
        this._screenW = 0; // screen width
        this._screenH = 0; // screen height
        this._sceneW = 0; // scene width
        this._sceneH = 0; // scene height
        this._zoom = 1; //current zoom factor
        this._ang = 0;
        this._perspective = -1//Math.PI / 2;
        this.__ang = 0; // intelicam angle
        this.__perspective = -1 // intelicam perspective
        /** plus lourd mais permet update le _focus _near _far _orthographic*/
        this._planeUpdate = false;
        this._inteliCam = false;
        this._culling = true;
        /** culling count */
        this._cullingCount = 0;
        //#plane
        this._focus = 7000; //FIXME: SINON PROBLEME AVEC TXT QUAND ZOOM BEAUCOUP
        this._near = 100000;
        this._far = -100000;
        this._orthographic = false;
        /** cache default easing */
        this._ease = Elastic.easeOut.config(1, 0.46);
        /** camera preset setup */
        this.cameraSetup = {
            default:{ _zoom:0.58, _ang:-0.2, _perspective:-0.52},
            sleepBed:{ _zoom:0.2, _ang:-0.2, _perspective:-0.4},
            movingCasesDir6:{_zoom:0.47,_ang:0.08,_perspective:-0.44 },
            movingCasesDir4:{_zoom:0.47,_ang:-0.08,_perspective:-0.44 },
            combat1:{_zoom:0.30,_ang:-0.1,_perspective:0,_focus:400, },// todo:_focus
            combat2:{_zoom:0.7,_ang:0.1,_perspective:-0.5,_focus:6000, },// todo:_focus
            combat3:{_zoom:0.5,_ang:0.1,_perspective:-0.5,_focus:4000, },// do action ?
            bubbleTxt:{_zoom:0.41,_ang:-0.026,_perspective:-0.362,_focus:3500, },// do action ?
        }
    };

    set zoom(value) { 
        TweenLite.killTweensOf(this);
        this.view.scale3d.set((this._zoom = value)); // floor car si on a des nombre bizar 0.4961565 , sa flick // todo:Math.floor(value*100)/100 
    }
    set perspective(value) { 
        TweenLite.killTweensOf(this);
        this.view.euler.x = (this._perspective = value); 
    }
    
    /** initialise the from scene
     * @param {_Scene_Base} scene - Need and compute projection for the scene?
     */
    initialize(scene) {
        this.clear();
        this.scene = scene;
        this._sceneName =  this.scene._name;
        this._screenW = $app.screen.width ;
        this._screenH = $app.screen.height;
        this._sceneW = scene._sceneWidth  || this._screenW;
        this._sceneH = scene._sceneHeight || this._screenH;
        this.view.position.set($app.screen.width / 2, $app.screen.height / 2);
        this.view.setPlanes(this._focus, this._near, this._far, this._orthographic);
        this.view.addChild(scene);
        //scene.pivot.set(this._sceneW/2,this._sceneH/2);
       this.debug();// deleteme:
    };

    /** get distance between 2 3dpoint */
    getDistanceFrom(t1,t2){
        const p1 = t1.position3d;
        const p2 = t2.position3d;
        const deltaX = p1.x - p2.x;
        const deltaY = p1.y - p2.y;
        const deltaZ = p1.z - p2.z;
        return {
            d:Math.sqrt( deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ ),
            a:-Math.atan2(p2.z - p1.z, p2.x - p1.x),
        };
    };

    /** clear child si scene et autre elements de camera*/
    clear(){
        this.scene && this.view.removeChild(this.scene);
        this.scene = null;
    };
    
    /**@description update from updateMain in sceneManager */
    update(){
        this.view.scale3d.set(this._zoom);
        this.view.euler.y = this._ang;
        this.view.euler.x = this._perspective;
        if(this._planeUpdate){
            this.view.setPlanes(this._focus, this._near, this._far, this._orthographic);
        }
        if(this._inteliCam && !$mouse._hold){
            //const tween = TweenLite.getTweensOf(this)[0];
           // if(!vars.vars._ang,_perspective){}
           //if(!tween){
                const speed = 60;
                const ScrollX = ((this._screenW/2)-$mouse.xx)/10 - this.view.pivot3d._x;
                const ScrollY = -((this._screenH/2)-$mouse.yy)-this.view.pivot3d._z;
                const angle = -(this.view.pivot3d.x/200)-this._ang;
                const perspective = (-Math.abs(this.view.pivot3d.z/1000)-0.8)-this._perspective;//TODO: PERMETRE SUELMENT < HALFSCREEN top ?
                this.view.pivot3d.x+=(ScrollX - this.view.pivot3d._x)/(speed);
                this.view.pivot3d.z+=(ScrollY - this.view.pivot3d._z)/(speed);
                this._ang+=(angle - this._ang)/(speed*2);
                this._perspective+=(perspective - this._perspective)/(speed*2);
                //this.view.pivot3d.x = ((this._screenW/2)-$mouse.xx)/10;
                //this.view.pivot3d.z = -((this._screenH/2)-$mouse.yy);
                //this._ang = -this.view.pivot3d.x/1000;
                //this._perspective = -Math.abs(this.view.pivot3d.z/10000)-0.4;
          // };
        }
        this._culling && this.doCulling()
    };

    /** proceed a un culling avec les bounds acutel. */
    doCulling(skipUpdate = true,visible){
        this._cullingCount = 0;
        // container.visible = true;
        for (let i=1, children = $stage.scene.children, l=children.length; i<l; i++) { //1: ignor bg
            const container = children[i];
            const bounds = container.getBounds(skipUpdate);
            const renderable = bounds.x+bounds.width >= 0 && 
            bounds.y+bounds.height>=0 && 
            bounds.x-bounds.width <= this._screenW && 
            bounds.y-bounds.height*2 <= this._screenH ;
            container.renderable = renderable;
            // en mode combat on peut hacker et forcer visibility car sinon les sa bug , les renderable:false peuvent etre interactive. fixme:
            container.visible = visible? renderable:true; // TODO: STOKER bounds, CAR VISIBLE NE FONCTIONNE PAS MAIS DONNERAIT DE SUPER PERFORMANCE.
            if(!container.renderable){this._cullingCount++};

            if(container.renderable && container.dataObj){//!test door alpha
                if(container.dataObj._type === _DataObj_Base.TYPE.door){
                    //!method 1
                    /*if(bounds.y+bounds.height/2 >= this._screenH/2 ){
                        container.alpha = 0.1;
                    }else{
                        container.alpha = 1;
                    }*/
                    //! method 2 mouse
                    const pos = $mouse.InteractionData.getLocalPosition($stage.scene.Background, new PIXI.Point(), $mouse.InteractionData.global);
                    if(bounds.y-bounds.height/3 >= pos.y ){
                        container.alpha>0.1?container.alpha-=0.02 : null;
                    }else{
                        container.alpha<1?container.alpha+=0.02 : null;
                    }

                }
            }
        };
    };

    
    
    //$camera.moveToTarget(null,f) : ex setup: default:{ _zoom:0.58, _ang:-0.2, _perspective:-0.52}
    moveToTarget(target, speed=5, ease = this._ease, setup=this.cameraSetup.default||'') {
            this.kill();
            //! selon setup, positionner les extra position3d
            let yy = 0;
            switch (setup) {
                case 'bubbleTxt': yy = -200; break;
                default:
                    break;
            }
            if(typeof setup === 'string'){
                setup = this.cameraSetup[setup];
            }
            const to = target.p?target.p.position3d : Number.isFinite(target)?$players.getSourceFromID(target).p.position3d : target.child.position3d;

            const tl = new TimelineMax({id:'moveToTarget'});
                tl.to(this, speed, {
                    ...setup,
                    ease: ease,
                    onComplete: () => {},
                },0);
                //! target position
                tl.to(this.view.position3d, speed, { // *1.5
                    x:to.x, y:to.y+yy, z:to.z, 
                    ease: ease,
                    onComplete: () => {},
                },0);
            return tl;

    };

    /** kill la camera gsap actuel */
    kill(){
        const last = gsap.getById('moveToTarget');
        last && last.kill();
    };


    onMouseWheel(e){
        if(e.ctrlKey){
            if(this._perspective-e.wheelDeltaY/1000 > -0.1){
                TweenMax.to(this, 1, {_perspective:-0.1, ease: Back.easeOut.config(1.4) });
            }else
            if(this._zoom-e.wheelDeltaY/1000 < -Math.PI/2){
                TweenMax.to(this, 1, {_perspective:-Math.PI/2, ease: Back.easeOut.config(1.4) });
            }else{
                TweenMax.to(this, 2, {_perspective:`-=${e.wheelDeltaY/1000}`, ease: Back.easeOut.config(1.4) });
            }
        }else
        if(this._zoom-e.wheelDeltaY/1000 > 3){
            TweenMax.to(this, 1, {_zoom:3, ease: Back.easeOut.config(1.4) });
        }else
        if(this._zoom-e.wheelDeltaY/1000 < 0.1){
            TweenMax.to(this, 1, {_zoom:0.1, ease: Back.easeOut.config(1.4) });
        }else{
            TweenMax.to(this, 2, {_zoom:`-=${e.wheelDeltaY/1000}`, ease: Back.easeOut.config(1.4) });
        }
    };
    
    
    /**@description debug camera for test pixi-projections, also need move ticker and update to $app update */
    debug(force=false) {
        if(!force && this._debug){return};
        this._debug = true;
        /*const gui = new Inspectors('CAMERA');
        const f1 = gui.addFolder('SCREEN');
        f1.add(this, '_sceneName').listen().disable();
        f1.add(this, '_screenW').disable();
        f1.add(this, '_screenH').disable();
        f1.add(this, '_sceneW').listen().disable();
        f1.add(this, '_sceneH').listen().disable();
       const f2 = gui.addFolder('FACTOR');
       f2.add(this, '_inteliCam')
       f2.add(this, '_zoom').min(0).max(3).step(0.1).slider().listen();
       f2.add(this, '_ang').min(-Math.PI/2).max(Math.PI/2).step(0.02).slider().listen();
       //
       const f3 = gui.addFolder('CAMERA.VIEW');
       f3.add(this.view, 'position3d', ['x','y','z'] ).max(100).slider();
       f3.add(this.view, 'pivot3d', ['x','y','z'] ).max(100).slider();
       const f4 = gui.addFolder('Array Matrix');
       f4.add(this, 'renderable',{ select:{'NONE': 0, 'FREE': 1, 'AXIS_X': 2, 'AXIS_Y': 3, 'POINT': 4, 'AXIS_XR': 5}  });
       f4.add(this, 'tint',{ color:{}  })*/
       //!debug line
        const line = new PIXI.Graphics();
        line.lineStyle(1, 0xFFFFFF,0.3).moveTo(1920/2, 0).lineTo(1920/2, 1080).moveTo(0, 1080/2).lineTo(1920, 1080/2);
        this.view.parent.addChild( new PIXI.Sprite($app.renderer.generateTexture(line)) );

       const gui = new Inspectors('CAMERA','view-port and culling controlers');
       //TODO: BREADCUM styte scan les parent et children
       const f1 = gui.addFolder('CAMERA INFORMATIONS').disable().close();
       f1.add(this, '_sceneName').listen();
       f1.add(this, '_screenW'  ).listen();
       f1.add(this, '_screenH'  ).listen();
       f1.add(this, '_sceneW'   ).listen();
       f1.add(this, '_sceneH'   ).listen();
       const f2 = gui.addFolder('camera.TRANSFORM').listen().slider();
       f2.add(this, '_inteliCam');
       f2.add(this, '_orthographic');
       f2.add(this, '_culling').listen();
       f2.add(this, '_cullingCount').listen().disable();
       f2.add(this, '_zoom'        ).min (0.1).max(3).step(0.01);
       f2.add(this, '_ang'         ).min (-Math.PI/2).max(Math.PI/2).step(0.02);
       f2.add(this, '_perspective' ).min (-1.4).max(-0.1).step(0.02);
       f2.addLine('view.setPlanes change focal');
       const onChangePlane = ()=>{ this.view.setPlanes(this._focus, this._near, this._far, this._orthographic) };
       f2.add(this, '_focus' ).step(5).onChange(onChangePlane);
       f2.add(this, '_near'  ).step(10).onChange(onChangePlane);
       f2.add(this, '_far'   ).step(10).onChange(onChangePlane);
       const f3 = gui.addFolder('camera.view.TRANSLATE').listen().slider();
       f3.add(this.view, 'position3d', ['x','y','z'] ).step(1);
       f3.add(this.view, 'pivot3d', ['x','y','z'] ).step(1);
    };
};
let $camera = new _camera();
console.log1('$camera.', $camera);

//document.onwheel = $camera.onMouseWheel.bind($camera); //TODO: proceder grace au emit, verifier lelement targeted pour diferent zoom de diferent element, aussi compatible pour lediteur
//document.onmousemove = $camera.onMouseCheckBorderCamera.bind($camera); //TODO:




