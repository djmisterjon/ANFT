//TODO: SEPARER PAR MAP, SINON TROP FREAK


/** Les events sont sois appeller directement, sois apeller sur un update */
class _events{
    //#region [Static]
    /** TODO: pourrait contenie un pool events ?  */
    static pool = [];
    //#endregion

    constructor() {
        this._autoSwitch = [];
    };

    /** verefi si un self events a deja eu lieux grace au autoVars */
    checkAutoVar(autoSwitch){
        if(this._autoSwitch.indexOf(autoSwitch) >-1) return true;
        this._autoSwitch.push(autoSwitch);
    };


    //#region [Initialize]
    /** Intro sleep events*/
    introSleep(autoSwitch = 'introSleep'){
        if(this.checkAutoVar(autoSwitch)) return;
        $mouse._scanDisable = true;
        $stage.scene.interactiveChildren = false; // disable la scene, mais keep messages interactive
        gsap.getTweensOf($stage.scene)[0].kill(); // on desactive le start scene
        const master = new TimelineMax();
        //TODO: ajouter au events, des id string unique, pour pouvoir les retrouver
        const bed = $objs.LOCAL[20]; // lit de la scene
        const table = $objs.LOCAL[12]; // table de la scene
        const p0 = $players.p0;
        const p1 = $players.p1;
        function iniSetup() {
            const tl = new TimelineMax({id:'iniSetup'});
            const bedPos = bed.child.p.position3d;
            const tablePos = table.child.p.position3d;
            tl.add(() => { //FIXME: OK FUCK HELL .CALL MAKE BAD SHIT HERE
                //gsap.killTweensOf($camera.view.position3d);
                //gsap.killTweensOf($camera);
                $camera.kill(); // just en ca de debugage
                p0.s.state.setAnimation(4, "sleep", true);//TODO: REFACTORING BIENTOT
                gsap.set(p0.p.position3d, {x:bedPos.x,y:-60,z:bedPos.z-1 });
                gsap.set(p1.p.position3d, {x:tablePos.x,y:0,z:bedPos.z })
                gsap.set($camera.view.position3d, {x:p0.p.position3d.x,y:-60,z:p0.p.position3d.z })
                gsap.set($camera, $camera.cameraSetup.sleepBed );
            })
            tl.fromTo($stage.scene, 1, {alpha:0},{alpha:1})
            return tl;
        };
        function wakeUp() {
            const tl = new TimelineMax({id:'wakeUp'});
            tl.add(() => {
                const entry = p0.s.state.setAnimation(4, "sleepWakeUp", false);
            })
            tl.to($camera, 0.7, $camera.cameraSetup.movingCasesDir4, 0 );
            return tl;
        };

        function moveToP1() {
            const tl = new TimelineMax({id:'moveToP1'});
            tl.to($camera.view.position3d, 1.5, {x:()=>p1.p.position3d.x, y:-250, z:0, ease:Power3.easeInOut },0);
            tl.to($camera, 2, {_zoom:0.2, ease:Back.easeInOut.config(1.7) },0);
            return tl;
        };
        function P1MoveToP0() {
            const tl = new TimelineMax({id:'P1MoveToP0'});
            const chair = $objs.LOCAL[13];
            const bag = $objs.LOCAL[16];
            tl.to(p1.p.position3d, 0.4, {x:chair.child.p.position3d.x+30, ease:Power4.easeIn },0); 
            tl.add(() => { p1.s.state.setAnimation(4, "moveHalf", false) });
            tl.to(chair.child.p.euler, 0.6, {z:Math.PI/2, ease:Bounce.easeOut }, 'hitChair' );
            tl.to(bag.child.p.euler, 0.8, {z:Math.PI/2, ease:Bounce.easeOut }, 'hitChair' );
            tl.to(bag.child.p.position3d, 0.7, {x:'+=90',y:0, ease:Power4.easeOut }, 'hitChair' );
            tl.to($camera.view.position3d, 0.6, { x: '+=100', ease: RoughEase.ease.config({ template:  Circ.easeOut, strength: 1, points: 8, taper: "out", randomize: false, clamp:  true}) },'hitChair');
            tl.to($camera, 0.6, {_zoom:0.3, ease:Elastic.easeOut.config(1, 0.5)},'hitChair');
            tl.add(() => { p1.s.state.setAnimation(4, "reversX", false) },'hitChair');
            tl.to(p1.p.position3d, 1.5, {x:()=>p0.p.position3d.x-100,z:p0.p.position3d.z, ease:Back.easeInOut.config(1.7) },'backChair');
            tl.add(() => {
                p1.s.state.setAnimation(4, "atk0", false);
                p1.s.state.addAnimation(4,'moveLoop',true,0);
            },'backChair');
            tl.to($camera.view.position3d, 1.5, {x:()=>p0.p.position3d.x-100,y:-60,z:p0.p.position3d.z, ease:Back.easeInOut.config(1.7) }, 'backChair+=0.2' );
            tl.add(() => { 
                p1.s.state.addEmptyAnimation(4,0.2,0);
            },'end');
            tl.to($camera, 1, {_zoom:0.8, ease:Elastic.easeOut.config(0.8, 0.5)},'end');
            return tl;
        };
        //!test des text
        function message() {
            const tl = new TimelineMax({id:'message'});
            tl.add(() => {
                master.pause();
                $messages.show('Intro_WakeUp').then( ()=>master.resume() );
            });
            return tl.to({},{});
        };

        function jumpOutBed() {
            const startCase = $objs.LOCAL[25];
            const bag = $objs.LOCAL[16];
            const tl = new TimelineMax({id:'jumpOutBed'});
            tl.add(() => {
                p0.s.state.addEmptyAnimation(4, 0.1,0);
                p0.s.state.addEmptyAnimation(3, 0.1,0);
                p0.reversX()
                const entry = p0.moveToNextPath(startCase)
                //const entry = p0.s.state.addAnimation(3,"jump3",false,0);
                entry.timeScale = 2;
                //gsap.to(p0.p.position3d, (entry.animationEnd/entry.timeScale) 
                //    ,{ x:startCase.child.p.position3d.x, y:0, z:startCase.child.p.position3d.z, ease:Power3.easeIn, delay:entry.mixDuration } );
                //p0.s.state.addEmptyAnimation(3,0.1,0);
            },0);
            tl.to(p1.p.position3d, 1, {x:'-=165',z:()=>p1.p.position3d.z+50, ease:Power3.easeInOut, },1);
            tl.to($camera.view.position3d, 1, {z:0, ease:Power4, },1)
            tl.addLabel('moveToBag','+=1');
            tl.to($camera.view.position3d, 2, {x:-300,y:-200, ease:Back.easeInOut.config(1.7) },'moveToBag'); // move to bag
            tl.to(p1.p.position3d, 1.5, {x:-300,y:0, ease:Back.easeInOut.config(1.7) },'moveToBag'); // move p0 near bag
            tl.to($camera, 2, {_zoom:0.2, ease:Back.easeInOut.config(1.7) },'moveToBag'); // zoom to bag
            //TODO: PARLER DU BAG ICI, PAUSE
            tl.add(()=>{
                master.pause();
                $messages.show('Explain_travelHud').then( ()=>master.resume() );
            });
            tl.add(()=>{
                $gui.Travel.show();
            },'+=0.1');
            tl.add(()=>{
                $gui.Travel.sta = 4;
            },'+=0.3');
            tl.add(() => {
                gsap.to(p1.p.position3d, 1, {y:-100, ease:Back.easeInOut.config(1.4) });
                gsap.to($camera, 1, {_zoom:0.7, ease:Power4.easeOut } );
                gsap.to($camera.view.position3d, 1, {x:p0.p.position3d.x,y:0,z:p0.p.position3d.z, ease:Back.easeInOut.config(1.7) } ); // back from bag
            },'moveToP0+=1');
            return tl.to({},{});
        };
        function waitIdentificationDuBag() {
            const tl = new TimelineMax({id:'waitIdentificationDuBag'});
            tl.add(() => {
                master.pause();
                const bag = $objs.LOCAL[16];
                const Bubble = new _Bubble( $texts.MotionsTxt('___holdClick'), bag.child, null, _Bubble.TYPE.POINT_OBJ ); // todo creer un manager alert
                //$messages.create('Intro_WakeUp').then( ()=>master.resume() ); //todo: un message parralle
                $mouse._scanDisable = false; // permet le scan pour le bag
                let waitBagIdentify = setInterval(() => {
                    if(bag._identified){
                        Bubble.Destroy();
                        $mouse._scanDisable = true;
                        clearInterval(waitBagIdentify);
                        master.resume();
                    };
                }, 200);
            });
            return tl.to({},{});
        };
        function waitMoveNearBag() {
            const tl = new TimelineMax({id:'waitMoveNearBag'});
            tl.add(() => {
                master.pause();
                $messages.show('GetTheBag').then( ()=>{
                    const bag = $objs.LOCAL[16];
                    const case28 = $objs.LOCAL[28];
                    $stage.scene.interactiveChildren = true;
                    gsap.to($camera.view.position3d, 1, {x:case28.child.p.position3d.x,y:0,z:case28.child.p.position3d.z, ease:Back.easeInOut.config(1.7) } );
                    gsap.to($camera, 1, {_zoom:0.5, ease:Power4.easeOut } );
                    const Bubble = new _Bubble( $texts.MotionsTxt('___clickHere_move'), case28.child, null, _Bubble.TYPE.POINT_OBJ );
                    let waitNearBag = setInterval(() => { // lorsque asser proche du bag
                        if(p0.inCase === case28){
                            Bubble.Destroy();
                            $stage.scene.interactiveChildren = false;
                            clearInterval(waitNearBag);
                            master.resume();
                        };
                    }, 150);
                } );
            });
            return tl.to({},{});
        };

        function waitGetBag() {
            const tl = new TimelineMax({id:'waitGetBag'});
            tl.add(() => {
                const bag = $objs.LOCAL[16];
                master.pause();
                gsap.getById('moveToTarget').kill(); // just en ca de debugage
                $messages.show('LookTheObjInteraction').then( ()=>{
                    $stage.scene.interactiveChildren = true;
                    gsap.to($camera.view.position3d, 0.5, {x:bag.child.p.position3d.x,y:0,z:bag.child.p.position3d.z, ease:Power4.easeOut } );
                    master.resume();
                } );
            });
            tl.add(() => {
                master.pause();
                const bag = $objs.LOCAL[16];
                const Bubble = new _Bubble( $texts.MotionsTxt('___clickHere_takeObj'), bag.child, null, _Bubble.TYPE.POINT_OBJ );
                let waitGetBag = setInterval(() => {
                 //TODO: fair un system de switch variable ou _destroy:true, de toute facon quelque chose , les ref ne son pas detruite
                if(!bag.child){
                        Bubble.Destroy();
                        $gui.Travel.sta = 0;
                        // affiche les guy du bag
                        $gui.PinBar.show();
                        $gui.Minimap.show();
                        $gui.GameSteps.show();
                        clearInterval(waitGetBag);
                        setTimeout(() => {
                            $messages.show('SetupIntroPinBar').then( ()=>master.resume() );
                        }, 1000);
                    }
                }, 200);
            },'+=0.3');
            return tl.to({},{});
        };
        function clickOnBagOptions() { // le bag huds
            const tl = new TimelineMax({id:'clickOnBagOptions'});
            tl.add(() => {
                master.pause();
                $gui.GameSteps.setStep(0);
                $camera.moveToTarget(p0);
                // tuto pinbar bag
                const menueBag = $gui.PinBar.child.Bag;
                menueBag.d.filters = [$systems.PixiFilters.OutlineFilterx8Green];
                const Bubble = new _Bubble( $texts.MotionsTxt('___clickHere_bagMenue'), menueBag, null, _Bubble.TYPE.POINT_OBJ );
                let waitClickBagOptions = setInterval(() => {
                    if($gui.PinBar._pinOptionShowed){ // si option activer
                        Bubble.Destroy();
                        clearInterval(waitClickBagOptions);
                        $gui.PinBar.child.Bag.d.filters = null;
                        master.resume();
                    };
                }, 200);
            });
            tl.add(()=>{
                master.pause();
                const PinOpt = $gui.PinBar.child.PinOption[4]; // option inventaire items
                PinOpt.child.Orb.d.filters = [$systems.PixiFilters.OutlineFilterx8Green];
                const Bubble = new _Bubble( $texts.MotionsTxt('___clickHere_bagMenue'), PinOpt, null, _Bubble.TYPE.POINT_OBJ );
                let waitMenueOpened = setInterval(() => {
                    if($gui.Items.renderable){ // si option activer
                        Bubble.Destroy();
                        clearInterval(waitMenueOpened);
                        master.resume();
                    };
                }, 200);
            },'+=0.3');
            tl.add(()=>{
                master.pause();
                $gui.Items.orbsSlots[0].child.Orb.d.filters = [$systems.PixiFilters.OutlineFilterx8Green];
                let waitOrbSelected = setInterval(() => {
                    if($mouse.holding){ // si option activer
                        $gui.Items.orbsSlots[0].child.Orb.d.filters = null;
                        clearInterval(waitOrbSelected);
                        master.resume();
                    };
                }, 200);
            },'+=0.3');
            tl.add(()=>{
                master.pause();
                $gui.PinBar.pinSlots[0].child.BgSlot.d.filters = [$systems.PixiFilters.OutlineFilterx8Green];
                let waitOrbAddedInPinSlot = setInterval(() => {
                    if($gui.PinBar.pinnedOrbs[0]){ // si orb dans pinSlot 0
                        $gui.PinBar.pinSlots[0].child.BgSlot.d.filters = null;
                        clearInterval(waitOrbAddedInPinSlot);
                        master.resume();
                    };
                }, 200);
            },'+=0.3');
            tl.add(()=>{
                master.pause();
                $gui.Items.itemSlots[0].child.iconSlot.d.filters = [$systems.PixiFilters.OutlineFilterx8Green];
                let waitItemAddedInPinSlot = setInterval(() => {
                    if($gui.PinBar.pinnedItems[0]){ // si item dans pinSlot 0
                        $gui.Items.itemSlots[0].child.iconSlot.d.filters = null;
                        clearInterval(waitItemAddedInPinSlot);
                        master.resume();
                    };
                }, 200);
            },'+=0.3');
            tl.add(()=>{
                master.pause();
                $gui.Items.child.Xbutton_B.d.filters = [$systems.PixiFilters.OutlineFilterx8Green];
                let waitCloseMenueItem = setInterval(() => {
                    if(!$gui.Items._show){
                        clearInterval(waitCloseMenueItem);
                        $gui.Items.child.Xbutton_B.d.filters = null; // just au cas que on pass par une command ?
                        $messages.show('endSetupIntro').then( ()=>master.resume() );
                    };
                }, 200);
            },'+=0.3');
            tl.add(()=>{ // take the pinned orb
                master.pause();
                let waitTakePinnedOrb = setInterval(() => {
                    $gui.PinBar.pinnedOrbs[0].child.Orb.d.filters = [$systems.PixiFilters.OutlineFilterx8Green];
                    if($mouse.holding){
                        $gui.PinBar.pinnedOrbs[0].child.Orb.d.filters = null;
                        clearInterval(waitTakePinnedOrb);
                        master.resume();
                    };
                }, 200);
            },'+=0.3');
            tl.add(()=>{ // put pined orb inside traver huds slot
                master.pause();
                let waitPinnedOrbInTravelSlot = setInterval(() => {
                    $gui.Travel.child.TravelSlots[0].child.Slot.d.filters = [$systems.PixiFilters.OutlineFilterx8Green];
                    if( $gui.Travel.slotsContentsId[0]>-1 ){
                        $gui.Travel.child.TravelSlots[0].child.Slot.d.filters = null;
                        clearInterval(waitPinnedOrbInTravelSlot);
                        master.resume();
                    };
                }, 200);
            },'+=0.3');
            tl.add(()=>{ // wait pour roll
                master.pause();
                let waitFirstRoll = setInterval(() => {
                    $gui.Travel.child.CircleTop.d.filters = [$systems.PixiFilters.OutlineFilterx8Green];
                    if($gui.Travel.sta>0){
                        $gui.Travel.child.CircleTop.d.filters = null;
                        clearInterval(waitFirstRoll);
                        $messages.show('startTurnIntroFirstTime').then( ()=>master.resume() );
                    };
                }, 200);
            },'+=0.3');
            //pinnedOrbs
            return tl.to({},{});
        };
        function ending() {
            const tl = new TimelineMax({id:'ending'});
            tl.add(() => {
                $mouse._scanDisable = false;
                $camera.moveToTarget(p0);
                _Quests.add("theOrbsQuests");
                _Quests.add("AncienPortalAnubis");
                //todo: add quests rendu ici, affiche les messages , new quest added
            });
            return tl.to({},{});
        };
        master.add( iniSetup               ());
        master.add( wakeUp                  (),'+=2'  );
        master.add( moveToP1                (),'+=0.1');
        master.add( P1MoveToP0              (),'+=0.1');
        master.add( message                 (),'+=0.1');
        master.add( jumpOutBed              (),'+=0.1');
        master.add( waitIdentificationDuBag (),'+=0.1');
        master.add( waitMoveNearBag         (),'+=0.1');
        master.add( waitGetBag              (),'+=1');
        master.add( clickOnBagOptions       (),'+=1');
        master.add( ending       (),'+=1');
        //console.table(master.getChildren().map((c)=>{return {_id:c.vars.id,_labels:JSON.stringify(c.labels),...c } }))
        //Inspectors.Timeline(master);//!DEBUG, TODO: BROKEN IN V3
    };
    //#endregion

    //#region [Method]
    /** les events a processus parallelle ou automatique */
    update(){

    };
    //#endregion

    
};

let $events = new _events();
console.log1('$events: ', $events);
