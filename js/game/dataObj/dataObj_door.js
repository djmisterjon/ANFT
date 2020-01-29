/*:
// PLUGIN □────────────────────────────────□OBJS SPRITES , ANIMATIONS, SPINES, EVENTS ...□───────────────────────────────┐
* @author □ Jonathan Lepage (dimisterjon),(jonforum) 
* @plugindesc Manage ,create game objs and events for Scene stage
* V.1.0
* License:© M.I.T
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
Permet de constuire des objets specifiques selon leur type.
Classer egalement par categorie d'interaction. ex: tree,plant,door
Gestionnaire de construiction global des sprites du jeux
Voir le Stages
*/
// penser a faire un local et global ID
// ┌-----------------------------------------------------------------------------┐
// GLOBAL $objs CLASS: _objs
//└------------------------------------------------------------------------------┘
class _DataObj_Door extends _DataObj_Base {
    /**
     * @param {String} dataBaseName
     * @param {String} textureName
     * @param {_Factory} factory
     */
    constructor(dataBaseName,textureName,factory) {
       super(dataBaseName,textureName,factory);
        /** type du DataObj */
        this._type = _DataBase.CATEGORY.Door;
        /** Idcase du transfer */
        this._transfer = Infinity;
    }
    //#region [Initialize]
    initialize(){
        this.initialize_base();
        this.initialize_interactive()
    }
    /** from _Container_Base.initialize, initialize des sprites ou extra selon type, si besoin! */
    initialize_base(){ //TODO: ENVOYER DANS _Container_Base ?
        const dataBase = this.dataBase;
        //!data2/Door/doorWood/SOURCE/images/door_0.png 
        const Door = $objs.ContainerDN(dataBase, 'door_0','Door' );
            //Door.parentGroup = PIXI.lights.diffuseGroup;
            Door.convertSubtreeTo3d();
            Door.d.anchor.set(1);
            Door.n.anchor.set(1);
            Door.position3d.set(Door.d.width/2,-25,1)
        this.p.addChild(Door);
    }
    /** Interaction de base qui peuvent appeller les super interaction*/
    initialize_interactive(){
        const Container = this.p;
        Container.interactive = true; 
        Container.on('pointerover' , this.pointerover ,this);
        Container.on('pointerout'  , this.pointerout  ,this);
        Container.on("pointerdown" , this.pointerdown ,this);
        Container.on('pointerup'   , this.pointerup   ,this);
    }
    //#endregion

    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e 
      * @param {_ObjsIdentificator} ObjsIdentificator
    */
    pointerover_fromIdentificator(e,ObjsIdentificator){
        
    }

    /** @param {PIXI.interaction.InteractionEvent} e 
      * @param {_ObjsIdentificator} ObjsIdentificator
    */
    pointerout_fromIdentificator(e,ObjsIdentificator){
        this._doorOpen = false;
        const display = this.p;
        const Door =  display.child.Door
        gsap.to(Door.euler, 0.3,{y:0, ease:Elastic.easeOut.config(1, 0.9) });
    }

    /** @param {PIXI.interaction.InteractionEvent} e 
      * @param {_ObjsIdentificator} ObjsIdentificator
    */
    pointerup_fromIdentificator(e,ObjsIdentificator){
        if(this._doorOpen){
            //todo: teleport
            ObjsIdentificator.Destroy();
            $stage.goto('Scene_Map1')
        }else{
            const display = this.p;
            const Door =  display.child.Door
            gsap.to(Door.euler, 1,{y:-Math.PI/1.2, ease:Elastic.easeOut.config(1, 0.9) });
        }
        this._doorOpen = true;
    }
    //#endregion



}