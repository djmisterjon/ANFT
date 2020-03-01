/*:
// PLUGIN □────────────────────────────────□MOUSE INTERACTIVITY□───────────────────────────────┐
* @author □ Jonathan Lepage (dimisterjon),(jonforum) 
* @plugindesc MOUSE ENGINE
* V.0.1a
* License:© M.I.T
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
Controle tous ce qui est associer a la sourits, interaction avec player et camera engine
Initialise avantr le loader , seulement pendant la sceneBOOT
*/
// ┌-----------------------------------------------------------------------------┐
// GLOBAL $mouse CLASS: _mouse
//└------------------------------------------------------------------------------┘

class _mouse extends PIXI.Container{
    constructor() {
        super();
        /** disable la possibiliter de scanner les elements */
        this._scanDisable = true;
        /** pinslotId si holding provien du pinBar */
        this._pinSlotId = null;
        /** freeze point true:false */
        this._freezeHold = null;
        /** is mouse holding */
        this._hold = false;
        /** indicateur si on proceed au scan des objet */
        this._proceedScan = false;
        /** child elements items,spine,trail*/
        this.child = null;
        /** Active controler */
        this._xboxController = false;
        /** disable/enable mouse event */
        this._busy = false;
        /**mouse easing in game*/
        this._ease = 0.036;
        /** @type {(_SpriteOrb|_SpriteItem|_SpriteMixOrbItem)} item hold by mouse */
        this.holding = null;
        /** global mouse ease */
        this._ease = 0.2;
        /** ease on case or element */
        this._easeCase = 0.16;
        /** */
        this.original = new PIXI.Point(0,0);

        this.follower = new PIXI.Point(0,0); // easing helper ?FIXME:
        /** follower for items hold */
        this.followerIt = new PIXI.Point(0,0); // easing helper ?FIXME:
        this.followerHolding = null; // position du item holding, sinon follower
        this.onCase = null; // easing on case ?FIXME:
        this.parentGroup = $displayGroup.group[6];
    };
    /**@returns {PIXI.interaction.InteractionManager} */
    get interaction() {
        return $app.renderer.plugins.interaction;
    }
    /** return true si le holding provient d'un pinSlot et a un _pinSlotId */
    get fromPinSlot() { return Number.isInteger(this._pinSlotId) };
    /** check if item are hold by cursor or in orb */
    get asItem(){return this.holding && this.holding.PinSlot.item };
    /** check if orb are hold */
    get asOrb(){return this.holding && this.holding.PinSlot.orb };
    /** active disable mouse follow */
    set active(value){this.interaction._active = value};
    /** active disable mouse follow */
    get active(){return this.interaction._active};
    /** return mouse glove spine  */
    get p(){return this.child.pointer};
    /** return mouse light */
    get l(){return this.child.pointerLight};
    /** return mosue trail */
    get t(){return this.child.trail};
    /** return holding objet */
    get h(){return this.holding};

   //get item(){return this.mouseTrails};
   //get isHoldItem(){return Number.isFinite(this._holdItemID) };

    get xx(){ return this.interaction.mouse.global.x }
    get yy(){ return this.interaction.mouse.global.y }

    //#region [Initialize]
    /** initialise mosue with game options */
    initialize(options) {//TODO: OPTIONS
        //setup the interaction manager
        this.initialize_light(options);
        this.initialize_pointer(options);
        this.initialize_helpBox(options);
        this.initialize_trail(options);
        this.initialize_configureInteractionEventForDOMEvent(options);
        this.child = this.childrenToName();
        this.setupInteraction();
        
        
        this.debug();//FIXME: DELETE ME

        $stage.addChild( this );
       // this.parentGroup = $displayGroup.group[6];
        this._isEnable = true; // active mouse
        this.active = true;
    };

    /**create spine sprite pointer */
    initialize_pointer(options){
        const pointer = new PIXI.spine.Spine($loader.DATA2.gloves.spineData);
        pointer.scale.set(0.7);
        pointer.name = 'pointer';
        pointer.stateData.defaultMix = 0.1;
        pointer.state.setAnimation(0, 'idle', true);
        this.addChild(pointer);
        this.pointer = pointer;
    };
    /**connection with pointer light */
    initialize_light(options){
        //[{"lightHeight":-0.1},{"brightness":4.8},{"falloff":[["0",-0.55],["1",7],["2",-0.7]]}]
        const light =  new PIXI.lights.PointLight()//$stage.LIGHTS.PointLight_mouse;
        light.name = "pointerLight";
        light.lightHeight = -0.2;
        light.brightness = 4.8;
        light.falloff = [-0.55,7,-0.7];
        this.addChild(light);
    };
    /**box pour les description ou help*/
    initialize_helpBox(options){
        const HelpBoxContainer = new PIXI.Container().setName('HelpBoxContainer');
        const HelpBoxBox = new PIXI.Sprite(PIXI.Texture.WHITE).setName('HelpBoxBox'); // radius pour le mouseOut
            HelpBoxBox.scale.set(2);
            HelpBoxBox.anchor.set(0.5);
        const HelpBoxBG = new PIXI.Sprite(PIXI.Texture.WHITE).setName('helpBoxBG');
        const HelpBoxTxt = new PIXI.Text('',$systems.styles[7]).setName('HelpBoxTxt'); //TODO: TEXT MANAGER :
        HelpBoxContainer.addChild(HelpBoxBox,HelpBoxBG,HelpBoxTxt);
        HelpBoxContainer.renderable = false;
        this.addChild(HelpBoxContainer);
    };


    
    /** ini la trails FX du pointer */
    initialize_trail(options){
        let trailTexture = $loader.DATA2.Trails.textures.trail_1//PIXI.Texture.fromImage('img/trail.png')
        let historyX = []; var historyY = [];
        let historySize = 30;//historySize determines how long the trail will be.
        let ropeSize = 200; //ropeSize determines how smooth the trail will be.
        let points = [];
        //Create history array.
        for( var i = 0; i < historySize; i++){
            historyX.push(0); historyY.push(0);
        }
        //Create rope points.
        for(var i = 0; i < ropeSize; i++){points.push(new PIXI.Point(0,0))};
        //Create the rope
        let rope = new PIXI.mesh.Rope(trailTexture, points);
        rope._filters = [ new PIXI.filters.BlurFilter (4, 2)];
        //rope.filterArea = new PIXI.Rectangle(0,0,500,500);//TODO:
        rope.alpha = 0.6;
        rope.name = 'trail';
        
        const trailTiker = PIXI.ticker.shared.add((delta) => {
            historyX.pop();
            historyX.unshift(this.follower.x);
            historyY.pop();
            historyY.unshift(this.follower.y);
            for(let i = 0; i < ropeSize; i++){
                let p = points[i];
                let ix = cubicInterpolation( historyX, i / ropeSize * historySize);
                let iy = cubicInterpolation( historyY, i / ropeSize * historySize);
                p.x = ix; p.y = iy;
            }
        });
        function clipInput(k, arr){
            if (k < 0){k = 0;}
            if (k > arr.length - 1){  k = arr.length - 1;}
            return arr[k];
        };
        function getTangent(k, factor, array){return factor * (clipInput(k + 1, array) - clipInput(k - 1,array)) / 2;}
        function cubicInterpolation(array, t, tangentFactor){
            if (tangentFactor == null) tangentFactor = 1;
            var k = Math.floor(t);
            var m = [getTangent(k, tangentFactor, array), getTangent(k + 1, tangentFactor, array)];
            var p = [clipInput(k,array), clipInput(k+1,array)];
            t -= k;
            var t2 = t * t;
            var t3 = t * t2;
            return (2 * t3 - 3 * t2 + 1) * p[0] + (t3 - 2 * t2 + t) * m[0] + ( -2 * t3 + 3 * t2) * p[1] + (t3 - t2) * m[1];
        };
        $stage.addChild(rope); //TODO METTRE DANS SCENE ?
    };

    /** hack le dom mouse event et scope pour easing */
    initialize_configureInteractionEventForDOMEvent(){
        const interaction = this.interaction;
        const InteractionData = this.InteractionData = interaction.activeInteractionData['1']; //interaction.getInteractionDataForPointerId('1');
        
        interaction.moveWhenInside = true; // 'pointermove' fire only when inside the currentTarget
        interaction.interactionFrequency = 20;
        interaction.cursorStyles.default = "none";
        interaction.cursorStyles.pointer = "none";
      
        interaction.setCursorMode('none'); // InteractionEvent
        /*const mouse = this;
        //TODO: VOIR SI ON PEUT MIXER CA AVEC TweenMax.ticker.addEventListener("tick", myFunction);
        //! hack the configureInteractionEventForDOMEvent
        const configureInteractionEventForDOMEvent = interaction.configureInteractionEventForDOMEvent.bind(interaction);
        interaction.configureInteractionEventForDOMEvent = function(interactionEvent, pointerEvent, interactionData) {
            if(this._active ){
                mouse.follower.copy(interactionData.global);// save last mouse position
                configureInteractionEventForDOMEvent(interactionEvent, pointerEvent, interactionData); // run real configure method
                mouse.update(interactionData,this.didMove); // update easing
            }
            return interactionEvent;
        };*/
    };
    //#endregion

    setupInteraction(){
        const HelpBoxContainer = this.child.HelpBoxContainer;
            HelpBoxContainer.on('pointerout'  , this.pointerout_HelpBoxContainer ,this);
        // GLOBAL INTERACTIONS ?
        this.interaction.on('pointerover' , this.pointerover_global ,this);
        this.interaction.on('pointerout'  , this.pointerout_global  ,this);
        this.interaction.on('pointerdown' , this.pointerdown_global ,this);
        this.interaction.on('pointerup'   , this.pointerup_global   ,this);
        this.interaction.on('pointermove' , this.pointermove_global ,this);
    };
    /**@param {PIXI.interaction.InteractionEvent} e */
    pointerout_HelpBoxContainer(e){
        const HelpBoxContainer = e.currentTarget;
        HelpBoxContainer.interactive = false;
        HelpBoxContainer.renderable = false;
    };

    /**@param {PIXI.interaction.InteractionEvent} e */
    pointerover_global(e){
        if(this._busy){return console.log(console.log('this._busy: ', this._busy) ); };

    };
    /**@param {PIXI.interaction.InteractionEvent} e */
    pointerout_global(e){
        if(this._busy){return console.log(console.log('this._busy: ', this._busy) ); };

    };
    /**@param {PIXI.interaction.InteractionEvent} e */
    pointerdown_global(e){
        const scanSelector = this.createScanSelector();
        TweenLite.to(scanSelector.scale3d, 0.2, {x:0.1,y:0.1,ease:Power4.easeOut});
        TweenLite.to(scanSelector.euler, 0.4, {z:Math.PI*2,ease:Power4.easeIn}).eventCallback("onComplete",()=>{
            this._hold = e.data.global.clone();
            if(this.canScan()){
                this._proceedScan = true;
                scanSelector.alpha = 0.5;
                TweenLite.to(scanSelector.euler, 0.6, {z:-Math.PI*2,ease:Power3.easeInOut});
                TweenLite.to(scanSelector.scale3d, 0.6, {x:scanSelector._radius,y:scanSelector._radius,ease:Power3.easeInOut});
            }else{
                return TweenLite.to(this.scanSelector, 1, {alpha:0,ease:Power4.easeOut}) 
            }
        });
    };
    /**@param {PIXI.interaction.InteractionEvent} e */
    pointerup_global(e){
        if(e.isRight){
            this._hold = null;
        }
        const scanSelector = this.scanSelector || {};
        this.scanSelector = null;
        TweenLite.killTweensOf(scanSelector.euler);
        if(this._proceedScan){
            this._proceedScan = false;
            this.proceedScanSelector(scanSelector);
            
        };
        TweenLite.to(scanSelector, 1, {alpha:0,ease:Power4.easeOut}).eventCallback("onComplete",()=>{
            scanSelector.parent && scanSelector.parent.removeChild(scanSelector);
        });
        
        this._hold = false;
        if(this._busy){return console.log(console.log('this._busy: ', this._busy) ); };
        const isClickL = e.data.button === 0; // clickLeft <==
        const isClickR = e.data.button === 2; // clickRight ==>
        const isClickM = e.data.button === 1; // clickMiddle =|=
        if(isClickR && this.holding){
            $audio._sounds.BT_A.play("BT_A015");
            $audio._sounds.BT_A.play("BT_A03").speed = 0.8;
            return this.clear();
        }; // remove item in mouse
        if($systems._inCombat){ return _Combats.pUP_global(e) }; // si en combat et mode selectionner.
        if(isClickR && $gui._inMenue){$gui.hide()};
    };
    /**@param {PIXI.interaction.InteractionEvent} e */
    pointermove_global(e){
        if(this.interaction._active ){
            this.follower.copy(this.InteractionData.global);// save last mouse position
            this.update(e,this.didMove); // update easing
        };

    //  return;
    //  const x = this.interaction.mouse.global._x;
    //  const y = this.interaction.mouse.global._y;
    //  const ease = this._ease;
    //  const inerty = (x - this.position.x) * ease;
    //  console.log('inerty: ', inerty);
    //  this.position.x += (x - this.position.x) * ease;
    //  this.position.y += (y - this.position.y) * ease;
    //  this.rotation= (0 - inerty)*ease


    //  if(this.holding && this._holdingFellow){
    //      this.holding.x += (x - this.holding.x) * ease;
    //      this.holding.y += (y - this.holding.y) * ease;
    //      //this.holding.position.copy(this.followerIt);
    //     //this.holding.rotation = ((x - this.holding.x.x) * this._ease)/20;
    //     //this.p.rotation = ((x - this.holding.x) * this._ease)/60;
    //  }
    };

    /** Pass un recBounds, calcule si hit !
     * @param {PIXI.Rectangle} a
     * @param {PIXI.Rectangle} b
    */
    hitTest(a,b){
        return  a.x + a.width > b.x && a.x < b.x + b.width && a.y + a.height > b.y && a.y < b.y + b.height;
    };

    /** Test si on peut fair un scan */
    canScan(){
        //$huds.GameSteps._currentMode!==1 || e.isRight || e.target || e.currentTarget || this.holding )
        return !this._scanDisable && !this.holding;
    }

    /** creer un scan click */
    createScanSelector(){
        //!data2/System/Selectors/SOURCE/images/selector_bigCircle.png
        const radius = $players.p0.EXPL/10 + $players.p1.EXPL/10; // obtien le scale limit
        const pos = this.InteractionData.getLocalPosition($stage.scene.Background, undefined, this.InteractionData.global); //Background.child? sprite
        const dataBase = $loader.DATA2.Selectors;
        const Selector = new PIXI.projection.Sprite3d(dataBase.textures.selector_scan);
        Selector.parentGroup = $displayGroup.group[5];
        Selector._radius = radius;
        Selector.anchor.set(0.5);
        Selector.position3d.set(pos.x,0,-pos.y);
        $stage.scene.addChild(Selector);
        Selector.scale3d.set(radius);
        Selector.getBounds();
        Selector.scale3d.set(0);
        Selector.alpha = 0.2;
        //Selector.zOrder = 999999;
        //Selector.euler.x = -0.15;
        // Selector.proj.euler.pitch = 0.2;
        return this.scanSelector = Selector;
    }

    proceedScanSelector(scanSelector){
        //!hit test
        let touch = [];
        for (let i=1, l=$stage.scene.children.length; i<l; i++) {
            /**@type {_Container_Base} */
            const o = $stage.scene.children[i];
            //TODO REFACTORISER CA pour identifier les objet events et interactivable
            if(o.renderable){ // renderable par culling
                if(this.hitTest(scanSelector._boundsRect,o.getBounds())){ //succed
                    if(o.DataObj&& o.DataObj._identifiable){ // si obj peut etre identifier
                        //todo: call system identification
                        o.DataObj.doIdentification();
                    }
                }
            }
        };
        console.log('touch: ', touch);
      //const pos = this.InteractionData.getLocalPosition($stage.scene, undefined, this.InteractionData.global);
      ////let pos = this.mouse.getLocalPosition($stage.scene.bg, void 0, this.mouse.global);
      //Selector.position3d.set(pos.x*2,0,-pos.y);
      //console.log('pos.x: ', pos.x,-pos.y);
      //console.log('this.xx: ', this.xx,this.yy);

       //TweenLite.fromTo(Selector.scale3d, 0.2, {x:0,y:0},{x:1,y:1, ease:Back.easeOut.config(1.7)})
       //TweenMax.to(Selector.proj.euler, 4, {z:Math.PI*2, ease:Linear.easeNone, repeat:-1});

       //$audio._sounds.BT_A.play('BT_A014').Speed(0.9+Math.random()/10).Volume(0.2)
    };
    // update spine mouse display only
    update(e,didMove){
        this.child.pointer.position.set(this.InteractionData.global.x,this.InteractionData.global.y);
        this.child.pointerLight.position.set(this.InteractionData.global.x,this.InteractionData.global.y);
        if(this.holding){//TODO: METTRE AND U N UPDATE TIKCS
            if(!this._freezeHold){
                const from = this.holding.position
                const to = this.child.pointer.position
                gsap.killTweensOf(from);
                gsap.to(from, 0.5, { x:to.x,y:to.y, ease: Elastic.easeOut.config(1.2, 1.1) });
            };
            TweenLite.killTweensOf(this.holding);
            const moveX = e.data.originalEvent.movementX / 200;
            this.holding.rotation = Math.abs(this.holding.rotation+moveX)>1.9? this.holding.rotation+moveX/10 : this.holding.rotation+moveX;
            TweenLite.to(this.holding, 4, { rotation: 0, ease: Elastic.easeOut.config(2, 0.2) });
        };
    };

    getMouseDirection(e) {
        //deal with the horizontal case
        if (oldX < e.pageX) {
            xDirection = "right";
        } else {
            xDirection = "left";
        }
    };

    /** add to mouse item id or from ref 
     * @param {_SpriteItem | _SpriteOrb | _SpriteMixOrbItem} sprite
    */
    add(sprite,fromPos){
        this.clear(); //TODO: RENDU ICI
        //! si ces un item ou un orb
        fromPos && sprite.position.copy(fromPos);
        sprite.pivot.set(0,-40)
        this.addChild(sprite);
        this.p.state.setAnimation(0, 'point_up', true); // animation cursor mode hold     
        this.holding = sprite;
    };

    /** ajout un item jumeler a son orb selon le pinSlotId */
    addFromPinSlot(pinSlotId,globalPosition){
        this.clear();
        this.p.state.setAnimation(0, 'point_up', true); // animation cursor mode hold
        // clone Container
        this._pinSlotId = pinSlotId;
        const Orb = this.holding = $gui.PinBar.pinnedOrbs[pinSlotId].Data.createSprite(0.5,0);
        const Item =  $gui.PinBar.pinnedItems[pinSlotId].Data.createSprite();
        Orb.position.set(globalPosition.x,globalPosition.y-Orb.height);
        Orb.scale.set(0.65);
        Orb.addItem(Item);
        this.addChild(Orb);
    };

    /** remove item from mouse */
    clear(destroy){
        const holding = this.holding;
        if(holding){
            this.holding = null;
            this.removeChild(holding);
            gsap.killTweensOf(holding);
            gsap.killTweensOf(holding.position);
            this.p.state.setAnimation(0, 'idle', true);
        };
    };

    /** affiche le helpBox info 
     * @param {String} txtId - passe un text id
    */
    showHelpBox(txtId){
        const txt = $texts.getStringById(txtId) || 'todo id: '+txtId;
        const HelpBoxContainer  = this.child.HelpBoxContainer;
        const helpBoxBG  = this.child.helpBoxBG;
        const HelpBoxTxt = this.child.HelpBoxTxt;
            HelpBoxTxt.text = txt;
            helpBoxBG.scale.set((HelpBoxTxt.width+10)/10, (HelpBoxTxt.height+10)/10 );
        const [x,y] = [this.xx, this.yy];
        gsap.fromTo(HelpBoxContainer, 0.4, { x:x,y:y-40,alpha:0 }, { x:x,y:y,alpha:1, ease: Power4.easeOut })
        .eventCallback('onStart', ()=>{
            HelpBoxContainer.renderable  = true;
            HelpBoxContainer.interactive = true;
        });
        //# pivot selon la sourit sur screen marge
        const px = (x+HelpBoxTxt.width  +20>$camera._screenW) ?helpBoxBG.width  :0;
        const py = (y+HelpBoxTxt.height +10>$camera._screenH) ?helpBoxBG.height :0;
            HelpBoxContainer.pivot.set(px,py);
    }

    //add a mouse position debugger
    debug() {
        
        const coor = new PIXI.Text("",{fill:'#ffffff',fontSize:28,strokeThickness:3,stroke:0x000000});
        const [coorX,coorY] = [
            new PIXI.Text("",{fontSize:28,strokeThickness:2,stroke:0x000000}),
            new PIXI.Text("",{fontSize:28,strokeThickness:2,stroke:0x000000}),
            ];
        const point = new PIXI.Sprite(PIXI.Texture.WHITE);
        point.anchor.set(0.5);
        point.tint = 0x000000;
        coor.y = -10;
        coor.x = 10;
        this.child.pointer.addChild(coor,coorX,coorY,point);
        coorX.position.set(10,85);
        coorY.position.set(10,85+30);
        setInterval(() => {
            const hold = this._hold || {x:0,y:0};
            if($stage.scene.Background){
                const pos = this.InteractionData.getLocalPosition($stage.scene.Background, new PIXI.Point(), this.InteractionData.global);
                coorX.style.fill = Math.abs(~~pos.x)>$stage.scene.Background.width/2?"#ff0000":"#ffffff";
                coorY.style.fill = Math.abs(~~pos.y)>$stage.scene.Background.height/2?"#ff0000":"#ffffff";
                coorX.text = `x:${~~pos.x}`;
                coorY.text = `z:${~~pos.y}`;
            }
            coor.text = `x:${~~this.xx}, y:${~~this.yy}\n_x:${~~(this.xx-hold.x)}, _y:${~~(this.yy-hold.y)}`;
        }, 80);
    };
  
};// end class

let $mouse = new _mouse();
console.log1('$mouse. ', $mouse);