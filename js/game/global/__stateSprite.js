/** Base dun state */
class _StateSprite extends PIXI.Container{
    //#region [Static]

    //#endregion
    constructor() {
        super();
        /** @type {{ 'AA':, 'BB':, 'CC':, 'DD':, 'EE':, 'FF':, }} */          
        this.child = null;
        this.initialize();
    }
    //#region [GetterSetter]
    /** obtien la texture name pour le state ou status */
    get textureName() { return `st_${this.constructor.name.split('_State_')[1]}` };
    //#endregion
    //#region [Initialize]
    initialize(){
        this.initialize_base();
       
    }
    initialize_base(){ // todo: background ?
        const dataBase = $loader.DATA2.IconStates;
        const State = $objs.ContainerDN(dataBase,this.textureName,'State').setName('State');
        State.d.anchor.set(0.5);
        State.n.anchor.set(0.5);
        this.addChild(State);
        this.child = this.childrenToName();
    };
    //#endregion

    //#region [Method]
 
    //#endregion

}
        