/**@class Bars de states hp,mp,hg,hy pour _Huds_States_players*/
class _Huds_States_Bars extends PIXI.Container {
    constructor(id,sourceId) {
        super();
        /** id de creations */
        this._id = id;
        /** id de la source player */
        this._sourceId = sourceId;
        /** nom du states asigner a la bars */
        this._stateName = $systems.states.bars[id];
        /** @type {{ Bar:ContainerDN, Frame:ContainerDN, TxtValue:PIXI.Text, Mask:PIXI.Sprite, }} */
        this.child = null;
        this.initialize();
    };
    //#region [GetterSetter]
    get Source() {
        return $players.group[this._sourceId];
    }
    //#endregion

    //#region [Initialize]
    initialize() {
        this.initialize_base();
        const position = [[-60,-25],[-235,40],[60,-25],[235,40]];
        this.position.set(...position[this._id])
        /*const isTop = !(this._id%2);
        const isLeft = (this._id<1);
        const x  = isTop ? 0 : 0;
        const xx = isLeft? 0 : 0;
        const yy = isLeft? 0 : 0;
        this.position.set(x+xx, yy );*/
    };

    initialize_base(){
        const anchor = [[1,0],[0,1],[0,0],[1,1]];
        const position = [[0,-4],[0,1],[0,-4],[0,1]];
        const TxtPosition = [[-95,15],[95,-20],[95,15],[-95,-20]];
        const iconPosition = [[-180,30],[185,-32],[180,30],[-185,-34]];
        const maskPos = [[-14,0],[14,0],[14,0],[-14,0]];
        const dataBase = $loader.DATA2.HudsStates;
        const dataBase2 = $loader.DATA2.IconStates;
        //# data2\GUI\huds\states\SOURCE\images\stBar_hp.png
        const Bar = $objs.ContainerDN(dataBase,`stBar_${this._stateName}`).setName('Bar');
            Bar.d.anchor.set(...anchor[this._id]);
            Bar.n.anchor.set(...anchor[this._id]);
        //# data2\GUI\huds\states\SOURCE\images\stFrame_hp.png
        const Frame = $objs.ContainerDN(dataBase,`stFrame_${this._stateName}`).setName('Frame');
            Frame.position.set(...position[this._id])
            Frame.d.anchor.set(...anchor[this._id]);
            Frame.n.anchor.set(...anchor[this._id]);
        //# data2\System\states\SOURCE\images\st_hp.png
        const State = this.Source.states[this._stateName];
            State.position.set(...iconPosition[this._id]);
            State.scale.set(0.4);
        //# Txt value 
        const TxtValue = new PIXI.Text('????/????',$systems.styles[0]).setName('TxtValue');
            TxtValue.position.set(...TxtPosition[this._id]);
            TxtValue.anchor.set(0.5);
        const Mask = new PIXI.Sprite($app.renderer.generateTexture(
            new PIXI.Graphics().beginFill(0xffffff).drawRect(0, 0, 190, 55).endFill()
        )).setName('Mask');
            Mask.anchor.set(...anchor[this._id]);
            Mask.position.set(...maskPos[this._id])
            Mask.scale.x = 0; // 0 car permet update
            Bar.d.mask = Mask; //todo: make renderer only on update hp with tween onUpdate
        //!end
        this.addChild(Bar,Frame,Mask,State,TxtValue);
        this.child = this.childrenToName();
    };
    //#endregion

    //#region [Method]
    /** refresh des valeur des states bar*/
    update(){//todo: animations
        const State = this.Source.states[this._stateName];
        const TxtValue = this.child.TxtValue;
        const MAX = this.Source[this._stateName.toUpperCase()]; // ex:this.Source.HP
        const CURRENT = this.Source['_'+this._stateName.toUpperCase()]; // ex:this.Source._HP
        const RATIO = Number(CURRENT/MAX)//.clamp(0, 1);
        //!update le visuel
        if(RATIO !==this.child.Mask.scale.x){
            gsap.fromTo(State.scale, 0.3,{x:0.6,y:0.6},{x:0.4,y:0.4, ease:Back.easeInOut.config(2)});
            gsap.to(this.child.Mask.scale, 0.5,{x:RATIO});
            gsap.fromTo(TxtValue.scale, 0.5,{x:1.2,y:1.1},{x:1,y:1});
            const o = Object.assign({},TxtValue.text.split('/'))
            gsap.to(o, 0.6,{'0':CURRENT,'1':MAX,ease:Power1.easeOut}).eventCallback('onUpdate', function(){
                TxtValue.text = `${~~o[0]}/${~~o[1]}`;
            })
        }
    }
    //#endregion
}