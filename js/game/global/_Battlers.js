/*:
// PLUGIN □────────────────────────────────□CREATE CAHRACTERE PLAYER□───────────────────────────────┐
* @author □ Jonathan Lepage (dimisterjon),(jonforum) 
* @plugindesc create player and setup for whole game
* V.0.1
* License:© M.I.T
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
dans les class, . pour les objects, function deep (non Json), _ pour les props array bool,
*/
//TODO: NOTE: LES MONSTERS SERON TOUS INITIALISER 1 FOI AU DEBUT, ENSUITE ON CLONE LORS DE COMBAT. Ceci permetra egalement le livre des monstre d'utiliser les references
/** class Battler on des method comune avec les MONSTER */
class _battler  {
    /**@param {_DataBattlers} DataBattlers */
    constructor(DataBattlers) {
        this.DataBattlers = DataBattlers;
        /** type de chara excel [p,m] */
        /**@type {number} - id du en cours de deplament */
        this._toCase = null;
        /**@type {number} - id du case */
        this._inCase = null;
        /** ID battler en combat */
        this._battlerID = null;
        /** timer de tour en combat: 0 est son tour */
        this._battleTime = 0;
        /** @type {{ 'ContainerSpine':_Container_Spine }} */
        this.child = null;

        /** list les states actif sur le battler
        * @type {{ 
        * hp  : _State_hp  , mp   :_State_mp   , hg  :_State_hg  , hy :_State_hy,
        * atk : _State_atk , def  :_State_def  , sta :_State_sta , int:_State_int,
        * lck : _State_lck , expl :_State_expl , mor :_State_mor ,
        }} */
        this.states = {}; // voir si tou va bien
        this.status = {};
        /** heritage de la faiblesse orbic -20%  'orbsSynegies*/
        this.faiblesseOrbic = []; //todo: mapper et creer avant ...data.orbsSynegies.fo_base
        /** heritage de la puissance orbic +20% 'orbsSynegies*/
        this.puissanceOrbic = []; //todo: ...data.orbsSynegies.po_base

        /** hp actuel du battler */
        /**@type {number} hp actuel */
        this._currentHP = 0;
        /**@type {number} mp actuel */
        this._currentMP = 0;
        /**@type {number} hg actuel */
        this._currentHG = 0;
        /**@type {number} hy actuel */
        this._currentHY = 0;
        /** bonus au hp */
        this._hp = 0;
        /** bonus au mp */
        this._mp = 0;
        /** bonus au hg */
        this._hg = 0;
        /** bonus au hy */
        this._hy = 0;
        /** bonus au atk */
        this._atk = 0;
        /** bonus au def */
        this._def = 0;
        /** bonus au lck */
        this._lck = 0;
        /** bonus au int */
        this._int = 0;
        /** bonus au sta */
        this._sta = 0;
        /** bonus au expl */
        this._expl = 0;
        /** bonus au mor */
        this._mor = 0;

        /** chance de coup critique */
        this._ccrt = 0;
        /** chance d'evation */
        this._ceva = 0;
        /** point experience actuel */
        this._xp = 0
    }
    //#region [GetterSetter]

    get dataBase() { return $loader.DATA2[this.DataBattlers._dataBaseName] };//todo: refair nom
    get defaultHeight(){
        return this.DataBattlers.defaultHeight;
    }
    get inCase() {
        return $objs.CASES_L[this._inCase];
    }
    get toCase() {
        return $objs.CASES_L[this._toCase];
    }
    get evo() {
        return this.DataBattlers.evo;
    }
    
    get isPlayers() {
        return this.constructor.name !== '_monsters';
    };
    get isMonsters() {
        return this.constructor.name === '_monsters';
    };
    /** return boolean si est revers */
    get isRevers() {
        return this._dirX === 4;
    }
    /** check if the battler is death */
    get isDeath(){ return this.HP<1 };
    /** @returns {PIXI.projection.Container3d} */
    get p(){ return this.child.ContainerSpine }
    /** @returns {PIXI.projection.Spine3d} */
    get s(){ return this.child.ContainerSpine.s }
    /** @returns {PIXI.Sprite} */
    get d(){ return this.child.ContainerSpine.d };// spine arrays
    /** @returns {PIXI.Sprite} */
    get n(){ return this.child.ContainerSpine.n };// spine arrays
    //#endregion

    //#region [Initialize]
    initialize_base(){
        const ContainerSpine = $objs.create(null,this.dataBase,'idle').setName('ContainerSpine');
        ContainerSpine.parentGroup = $displayGroup.group[1];
        ContainerSpine.s.scale3d.setZero(this.defaultHeight/ContainerSpine.s.height); // ratio hauteur from excel
        this.child = ContainerSpine.childrenToName();
        //this.setupAnimations(dataObj);
        //dataObj.child.p.parentGroup = $displayGroup.group[1];
        //dataObj.child.s.scale3d.set(0.4);
        //dataObj.child.s.scale3d.setZero();
        this.initialize_stats();
        //this.debug();
    }
    
    /** initialize les stats a un level */
    initialize_stats(level=1, ){
        this._level = level;
        Object.values(this.evo).forEach(evo=>{
            if(evo.type !== 'extra'){ //TODO: RENDU ICI , SOURCE NAME P1
                this.states[evo.name] = $statesManager.create(evo.name, this);
            }
        })
        this._currentHP = this.hp;
        this._currentMP = this.mp;
        this._currentHG = this.hg;
        this._currentHY = this.hy;
    }
    //#endregion


    get level (){ return this._level }
    get xp (){ return this._xp }
    get ccrt (){ return this._ccrt }
    get ceva (){ return this._ceva }
    //#region [rgba(200, 0, 0, 0.1)] // data2/System/states/SOURCE/images/st_hp.png
    set _HP  (value){ this._currentHP = Math.max(Math.min(this._HP+value, this.HP),0) };
    get _HP  (){ return this._currentHP };
    get HP  (){ return this.states.hp.getReelValue() };
    get hp  (){ return this.states.hp.value };
    //#endregion
    //#region [rgba(150, 0, 200, 0.1)] // data2/System/states/SOURCE/images/st_mp.png
    /** add value to current*/
    set _MP  (value){ this._currentMP = Math.max(Math.min(this._MP+value, this.MP),0) };
    get _MP  (){ return this._currentMP };
    get MP  (){ return this.states.mp.getReelValue() };
    get mp  (){ return this.states.mp.value };
    //#endregion
    //#region [rgba(0, 200, 0, 0.1)] // data2/System/states/SOURCE/images/st_hg.png
    /** set value to current*/
    set _HG  (value){ 
        this._currentHG = Math.max(Math.min(value, this.HG),0);
        $statesManager._updateId++;
    };
    /** valeur current */
    get _HG  (){ return this._currentHG };
    /** valeur reel effective du state atk (inclu: status,states)*/
    get HG  (){ return this.states.hg.getReelValue() };
    get hg  (){ return this.states.hg.value };
    /** obtien le rate % entre current et max */
    //#endregion
    //#region [rgba(0, 100, 200, 0.1)] // data2/System/states/SOURCE/images/st_hy.png
    /** add value to current*/
    set _HY  (value){ this._currentHY = Math.max(Math.min(this._HY+value, this.HY),0) };
    /** valeur current */
    get _HY  (){ return this._currentHY };
    /** valeur reel effective du state (inclu: status,states)*/
    get HY  (){ return this.states.hy.getReelValue() };
    get hy  (){ return this.states.hy.value };
    //#region [rgba(200, 200, 200, 0.05)] // data2/System/states/SOURCE/images/st_atk.png
    /** valeur reel effective du state atk (inclu: status,states)*/
    get ATK (){ return this.states.atk.getReelValue() };
    get atk (){ return this.states.atk.value };
    get DEF (){ return this.states.def.getReelValue() };
    get def (){ return this.states.def.value };
    get STA (){ return this.states.sta.getReelValue() };
    get sta (){ return this.states.sta.value };
    get INT (){ return this.states.int.getReelValue() };
    get int (){ return this.states.int.value };
    get LCK (){ return this.states.lck.getReelValue() };
    get lck (){ return this.states.lck.value };
    get EXPL (){ return 1||this.states.expl.getReelValue() };
    get expl (){ return this.states.expl.value };
    get MOR (){ return this.states.mor.getReelValue() };
    get mor (){ return this.states.mor.value };
    //#endregion

    /** Formule evolution par level */
    getEvoValue(st,level=this._level){
        const ev = this.evo[st];
        if(ev){
            const bonus = 0;// bonus && this['_'+st] || 0; todo:
            return ~~(ev.b*(1+(level-1)*ev.r) + (ev.f*(level-1)))+bonus;
        }
    };
    /** change le type d'action en combat
     * @param type String - type de combatAction actuel du battler: list $systems.actionType.keys
     */
    setCombatActionType(type){
        this._combatAction = type;
        if(type){
            // play animation atype si existe
            const hasAnimation = this.s.state.hasAnimation(`atype_${type}`);
            hasAnimation?this.s.state.setAnimation(3, `atype_${type}`, false, 0):this.s.state.setEmptyAnimation(3,0.5);
        }else{
            this.s.state.setEmptyAnimation(3,0.5);
        }
    };

    /** Instant transfer to case*/
    transferToCase(caseId) {
        const dataObj = $objs.CASES_L[ caseId ];
        if(dataObj){
            this.p.position3d.copy(dataObj.p.position3d);
            this.p.position3d.z-=15; //fix case pivot
            this._inCase = caseId;
        }else{
            console.error(`la cases de transfer nexiste pas !!! ID: `,caseId)
        }
    };
    
    /** test random critial hit
     * @param target la cible a tester si elle peut prevenir les criticals de la source
     * @returns Boolean
     */
    isCriticalHit(target){
        // if target.cantCritical() //check if cant not critical on target from flag or status ? 
        if (this.cantCriticalHit()){return 0};
        return Math.ranLuckFrom(this.lck,this.ccrt) && s.crt; // ces un coup critique ?
    };

    /** test si ne peut pas effectuer de coup critique */
    cantCriticalHit(){
        //! si desydrater ou faim a partir d'un seuil
        //! si a le status poison
        if(!this._hy || this._hg){ return true}; // TODO:
    };

    /** test random si evade
     * @param target la cible a tester si elle peut prevenir les criticals de la source
     * @returns Boolean
     */
    isEvade(target){
        // if target.cantCritical() //check if cant not critical on target from flag or status ? 
        if (this.cantEvade()){return false};
        return Math.ranLuckFrom(this.lck,this.eva); // ces un coup critique ?
    };

    /** test si ne peut pas s'evader */
    cantEvade(){
        //! si desydrater ou faim a partir d'un seuil
        //! si a le status poison
        //if(!this._hy || this._hg){ return true}; // TODO:
    };

    /** check if need reverse between 2 sprite3d */
    needReversX(b=this.toCase.p, a=this.inCase.p ) {
        return (this._dirX===4 && b.position3d.x>a.position3d.x) || (this._dirX===6 && b.position3d.x<a.position3d.x);
    };
    /** effectu un reverse avec animations si besoin */
    reversX() {
        this._dirX = 10-this._dirX;
        const xx = this.s.scale3d.zero._x * (this._dirX===4?-1:1);
        TweenLite.to(this.s.scale3d, 0.5, { x:xx, ease: Power3.easeInOut });
        this.s.state.setAnimation(3, "reversX", false, 0) && this.s.state.addEmptyAnimation(3,0.1,0);
    };

    /** return le battler a ca position de case */
    backToCase(Case=this.inCase){
        const to = Case.p.p.position3d;
        this.s.state.setAnimation(3, "backAfterAtk", false, 0);
        this.s.state.addEmptyAnimation(3,0.3,0);
        TweenLite.to(this.p.position3d, 1, { x:to.x,z:to.z, ease: Power4.easeOut });
    };

    debug(){
        const pos = this.p.position3d;
        const txt = new PIXI.Text('',{
            fill: "white",
            fontSize: 12,
            lineJoin: "round",
            strokeThickness: 4,
            wordWrap: true,
            wordWrapWidth: 0,
            lineHeight: 6,
        })
        txt.alpha = 0.9;
        txt.anchor.set(0,1);
        this.p.addChild(txt);
        $app.ticker.add(()=>{
            txt.text = `x:${~~pos.x} y:${~~pos.y} z:${~~pos.z} ■`;
        });
    }
};
