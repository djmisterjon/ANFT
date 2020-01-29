/** creer des ObjsIdentificator pour interaction */
// devrai seulement
class _ObjsIdentificator {
    //#region [Static]
    static create(dataObj){
        const o = new this(dataObj);
        this.pool.push(o);
        return o;
    };

    /** pool qui contien les identificator */
    /** @type {Array.<_ObjsIdentificator>} */
    static pool = [];

    static type = {
        none:0,
        async:1, // signifi que un update verifi ces condition, rien a faire ici
        ressource:2, // ajoute un items, ressource
        doorEvent:3, // une port qui ouvre
    }

    static checkNearPlayer(){
        for (let i=0, l=this.pool.length; i<l; i++) {
            const ObjsIdentificator = this.pool[i];
            ObjsIdentificator.checkNearObjFromPlayer();
        };
    };

    //#endregion

    /**@param {_DataObj_Case|_DataObj_Door} dataObj */
    constructor(dataObj) {
        this._dataObjId = dataObj._globalId;
        /** @type {{ 'Master':PIXI.Container, 'IdenCircle':ContainerDN, 'IdenIcon':ContainerDN, }} */
        this.child = null;
        this.initialize(dataObj);
        this.initialize_interaction();
    };

    //#region [GetterSetter]
    /** retourn le parent container grafic */
    get p() { return this.child.Master };
    get type() { return this.dataObj._type }
    
    get dataObj() { return $objs.GLOBAL[this._dataObjId] }
    //#endregion

    //#region [Initialize]
    initialize(dataObj){
        const dataBase = $loader.DATA2.Huds_GameStep
        const dataBase2 = $loader.DATA2.XboxButonsHelper;
        const Master = new PIXI.projection.Container3d().setName('Master');

        //! data2/Hubs/GameStep/SOURCE/images/gameStep_circleTop.png
        const IdenCircle = $objs.ContainerDN(dataBase,'gameStep_circleTop','IdenCircle');
        IdenCircle.parentGroup = $displayGroup.group[5];
        IdenCircle.scale.set(2);
        IdenCircle.d.anchor.set(0.5);
        IdenCircle.n.anchor.set(0.5);
        
        //!data2/System/xboxButtonHelper/SOURCE/images/xb_A.png
        const IdenIcon = $objs.ContainerDN(dataBase2,'xb_A','IdenIcon');
            IdenIcon.d.anchor.set(0.5);
            IdenIcon.n.anchor.set(0.5);
            IdenIcon.scale.set(2.5); // todo: utiliser un width car icons et xbox button ne son pas a meme echelle
        //!transform fix
        const ratio = 0.15/dataObj.link.p.scale3d.x;
        Master.scale3d.set(ratio);
        Master.scale3d.setZero();
        Master.position3d.set(0,-dataObj.link.p.height/2,0);
        //!end
        Master.addChild(IdenCircle,IdenIcon);
        this.child = Master.childrenToName();
    }

    initialize_interaction(){
        const Master = this.child.Master;
        Master.interactive = false; // default false, ces selon checkNearObjFromPlayer()
        Master.on("pointerover", this.pointerover_Master,this );
        Master.on("pointerout" , this.pointerout_Master ,this );
        Master.on("pointerup"  , this.pointerup_Master  ,this );
    };

    //#endregion

    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerover_Master(e){
        gsap.to(this.child.Master.scale3d, 0.2, {x:'*=0.1',y:'*=0.1', z:0 });
        this.dataObj.pointerover_fromIdentificator(e,this);
    };
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerout_Master(e){
        const zero = this.child.Master.scale3d.zero
        gsap.to(this.child.Master.scale3d, 0.3, {x:zero.x,y:zero.y,z:zero.z});
        this.dataObj.pointerout_fromIdentificator(e,this);
    };
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerup_Master(e){
         this.dataObj.pointerup_fromIdentificator(e,this);
    };

    //#endregion



    /** Active et desactive les obj identificator proche du player */
    checkNearObjFromPlayer(){
        const Master = this.child.Master;
        const source = $players.p0.p.position3d;
        const target = this.child.Master.parent.position3d;
        const distX =  Math.abs(source.x-target.x);
        const distZ =  Math.abs(source.z-target.z);
        if(distX<200 && distZ<200){ // proche
            Master.interactive = true;
            Master.renderable = true;
            gsap.to(Master, 1, {alpha:1});
        }else{ // loin
            Master.interactive = false;
            gsap.to(Master, 1, {alpha:0}).then(()=>{Master.renderable = false});
        };
    };

    Destroy(){
        _ObjsIdentificator.pool.remove(this);
        this.p.destroy({children:true})
    };
};
