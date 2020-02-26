
/**@class players heroes 0 girl*/
class _player0 extends _battler {
    constructor(DataBattlers) {
        super(DataBattlers);
        this.pathBuffer = [];
        this.initialize();
    }
    //#region [GetterSetter]
    get dataBase() { return $loader.DATA2.heroe1_rendered };//todo: refair nom
    //#endregion
    //#region [Initialize]
    /** initialize spine sprite */
    initialize(){
        this.initialize_sprites();
        this.initialize_listeners();
        this.initialize_battler();
        //this.setupTweens();
        //this.addInteractive();
    };

    /** initialize tous les elements */
    initialize_sprites(){
        //TODO: peut etre ajouter un nouveau container, pour mettre des FX speciaux au players
        const ContainerSpine = $objs.create(null,this.dataBase,'idle').setName('ContainerSpine');
        this.child = ContainerSpine.childrenToName();
        //this.setupAnimations(dataObj);
            //TODO: EXPERIMENTAL wink eyes, use spine events random
            //const spine = dataObj.child.s;
        /*setInterval(function(){
            const allowWink = Math.random() >= 0.5;
            allowWink && spine.state.setAnimation(2, 'wink1', false); 
        }, 1250);*/

        //dataObj.child.p.parentGroup = $displayGroup.group[1];
        //dataObj.child.s.scale3d.set(0.4);
        //dataObj.child.s.scale3d.setZero();
    };

    initialize_listeners() {
        const checkEvent = (entry, event) => {
            switch (event.data.name) {
                case 'startMove':
                    if(this._isMoving){
                        this.event_startMove();
                    }
                break;
                case 'nextMove': // lorsque atterie, regarder la suite
                if(this._isMoving){
                    // this.event_checkEventCase();
                    //this.event_updateNextPath();   
                    this. moveToNextPath();
                }
                break;
            case 'reversX':
                // audio swingg
            break;
            case 'hitCase':
                this.event_hitCase();
            break;
            // case 'endingHit': // combat commence le retour verse la case principal
            //   this.moveBackToCase();
            //   break;
            case 'hit': // combat commence le retour verse la case principal
                
                //$combats.hitTo(null);
            break;
            
                default:
                    break;
            }
        };
    
        this.child.ContainerSpine.s.state.addListener({
            event: checkEvent,
        });
    };
    //#endregion

    //#region [Interactive]
    addInteractive(value) {
        this.child.interactive = true;
        this.child.on('pointerover' , this.pIN_player  ,this);
        this.child.on('pointerout'  , this.pOUT_player ,this);
        this.child.on('pointerup'   , this.pUP_player  ,this);
    };

    pIN_player(e) {
        const ee = e.currentTarget;
        //$huds.stats.show();
    };
    
    pOUT_player(e) {
        const ee = e.currentTarget;
        // $huds.stats.hide();

    };
    
    pUP_player(e) {
    
    };
    //#endregion

    //#region [Method]
    setupAnimations(dataObj){
        //! hack player
        const spine = dataObj.child.s;
        spine.stateData.defaultMix = 0.2;
        spine.hackAttachmentGroups("_n", PIXI.lights.normalGroup, PIXI.lights.diffuseGroup); // (nameSuffix, group)
        spine.state.setAnimation(0, "idle", true);
        spine.state.setAnimation(1, "hair_idle", true);
        spine.skeleton.setSlotsToSetupPose();
    };

    
    /** update les heritages synergie orbic 
     * @param result {ResultTravel}
    */
    updateOrbic(result){
        //! puissance orbic
        result.colorsItem.forEach(color => {
            this.puissanceOrbic.push($statesManager.create('po', this._id, null,null,{color})._contextId);
        });
        //! faiblesse orbic
        result.colorsOrb.forEach(color => {
            this.faiblesseOrbic.push($statesManager.create('fo', this._id, null,null,{color})._contextId);
        });
    };

    /** permet de linker un status du pool pour le presenter visuelment */
    addStatus(contextId){
        this.status.push(contextId);
    };
    
    //initialisation dun parcour via un click 
    initialisePath(pathBuffer = _DataObj_Case.ActivePath.slice()) {
        $stage.interactiveChildren = false;
        this._isMoving = true;
        this._autoMove = true; 
        this.pathBuffer = pathBuffer;
        this._pathID = 0; // progression of path moving
        this._startingCaseId = this.pathBuffer.shift();
        this.s.state.timeScale = 1.3; //TODO: sycroniser avec les states du player
        this.moveToNextPath();
    };
    
    /**
     * @param {_DataObj_Case} Case - force saute sur une case
     * @returns {PIXI.spine.core.TrackEntry} */
    moveToNextPath(Case) { //TODO: RENDU ICI, this.inCase APARET TROP TO ToT?
        const LOCAL = $objs.CASES_L;
        this._isMoving = true;
        if(this.toCase){// mise a jours inCase
            this.inCase =  this.toCase;
        }
        const nextId = this.pathBuffer.shift();
        this.toCase = isFinite(nextId) && LOCAL[nextId] || Case;

        //this._pathID++;
        _ObjsIdentificator.checkNearPlayer(); // update map
        $gui.Minimap?.normalizePosition(); // update map

        if(Case || this.canMove()){
            this.needReversX() && this.reversX(true)//this.s.state.addAnimation(3, "reversX", false,0);
            const ranJump = ['jump1','jump2','jump3'][~~(3*Math.random())];
            return this.s.state.addAnimation(3,ranJump,false,0);
        }else{
            this._autoMove = false;
            this._isMoving = false;
            this.inCase.executeCasesBounty();
            return this.s.state.addEmptyAnimation(3,0.2,0);
        }
    };
    

    event_startMove() {
        $audio._sounds.jump_todofd2gt.play().Volume(0.4); //DELETEME: a fair un son vocal
        const to = this.toCase.p.position3d;
        this.toCase && gsap.to(this.p.position3d, 1*(1/this.s.state.timeScale), { x:to.x, y:to.y,z:to.z-15, ease: Power3.easeOut });
        //!camera
        this._autoMove && $camera.moveToTarget(this.toCase,undefined,undefined,`movingCasesDir${this._dirX}`);
    };

    event_hitCase(){
        $audio._sounds.JMP_A.play("JMP_A1");
        $gui.Travel.addValue(-1); //TODO: a mettre dans $huds.Travel.reduceFromCase() ?
        //!this.toCase.zero && this.toCase.zeroSet(); // FIXME:  a mettre au debut
        TweenMax.to(this.toCase.p.scale3d, 0.35, {
            x:0.6, ease: Expo.easeOut, repeat: 1, yoyo: true, yoyoEase:Elastic.easeOut.config(1.5, 0.6),
        });
    };

    event_updateNextPath() {
        if(this._autoMove){
            if(this.canMove()){
                this.moveToNextPath();
            }else{
                // peut pas bouger
                this.child.s.state.addEmptyAnimation(3,0.2);
                this.inCase.dataObj.executeCaseType();
            };
        }

    };

    canMove() {//FIXME: tous les condition permetant de continuer le path move
        return $gui.Travel.sta && this.toCase;
    };
    //#endregion

}
