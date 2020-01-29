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
    constructor(id,data,type,iconId) {
        /** type de chara excel [p,m] */
        this._type = type;
        /**@type {_DataObj_Case} */
        this.toCase = null;
        /** id for icons dataBase */
        this._iconId = iconId;
        this._level =  1;
        /**id from order creation */
        this._id = id;
        /** game dataBase identification */
        this._game_id = data.info._game_id[0];
        /** hauteur normal */
        this._default_heigth = data.info._default_heigth[0];
        /** ratio master (sayen) */
        this._master_rate = data.info._master_rate[0];
        /** le dataObj connecter */
        this.dataObj = {};
        /** combat slot debloquer et acheter */
        this._combatSlotsUnlocked = 3;
        /** tempon memoire des dernier PinSlotId attacher */
        this.combatSlotsValues = [null,null,null];
        /** data excel */
        this.data = data;
        /** battler direction Axe X */
        this._dirX = 6;
        /**@type {_DataObj_Case} store current player case */
        this.inCase = null;
        this.evo = $systems.extractEvo(data.statesBase);//this.extractEvo(this.data.statesBase);
        /** ID battler en combat */
        this._battlerID = null;
        /** timer de tour en combat: 0 est son tour */
        this._battleTime = 0;
        /** nom de l'action selectionner pour ce combatant: attack,def,mbook...*/
        this._combatAction = null;
        /** @type {{ 'ContainerSpine':_Container_Spine }} */
        this.child = null;
        /** list les states actif sur le battler
         * @type {{ hp:String,mp:String,hg:String,hy:String,atk:String,def:String,sta:String,int:String,lck:String,expl:String,mor:String,}} */
        this.states = {
            
        };
        /** list les status active sur le battler */
        this.status = [];
        
        /** heritage de la faiblesse orbic -20%  'orbsSynegies*/
        this.faiblesseOrbic = []; //todo: mapper et creer avant ...data.orbsSynegies.fo_base
        /** heritage de la puissance orbic +20% 'orbsSynegies*/
        this.puissanceOrbic = []; //todo: ...data.orbsSynegies.po_base

        /** hp actuel du battler */
        this._currentHP = 0;
        this._currentMP = 0;
        this._currentHG = 0;
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
    };

    /** @returns {PIXI.projection.Container3d} */
    get p(){ return this.child.ContainerSpine }
    /** @returns {PIXI.projection.Spine3d} */
    get s(){ return this.child.ContainerSpine.s }
    /** @returns {PIXI.Sprite} */
    get d(){ return this.child.ContainerSpine.d };// spine arrays
    /** @returns {PIXI.Sprite} */
    get n(){ return this.child.ContainerSpine.n };// spine arrays

    
    /** initialise battler data */
    initialize_battler(level = 1){
        const height = this.data.info._default_heigth[0];
        const ratio = height/this.s.height;
        this.s.scale3d.setZero(ratio);
        this.p.parentGroup = $displayGroup.group[1];
        this.initialize_stats(level,true);
        //this.debug();
    };
    get isPlayers() {
        return this._type === 'p';
    };
    get isMonsters() {
        return this._type === 'm';
    };
    /** return boolean si est revers */
    get isRevers() {
        return this._dirX === 4;
    }

    /** list des battle options disponible pour le battler
    * @return ["monsterBook", "capaBook|magicBook", "atk", "def", "move", "run", "asimilation|identification"]
    */
    get battleOptions(){
        return  this.data.combatActions.filter(action => action.allow );
    };

    /** check if the battler is death */
    get isDeath(){
        return this.HP<1;
    };

    get level (){ return this._level }
    get xp (){ return this._xp }
    get ccrt (){ return this._ccrt }
    get ceva (){ return this._ceva }
    //#region [rgba(200, 0, 0, 0.1)] // data2/System/states/SOURCE/images/st_hp.png
    /** add value to current*/
    set _HP  (value){ this._currentHP = Math.max(Math.min(this._HP+value, this.HP),0) };
    /** valeur current */
    get _HP  (){ return this._currentHP };
    /** valeur reel effective du state (inclu: status,states)*/
    get HP  (){ return $statesManager.getState(this.states.hp).computeValue() };
    /** return la value evolutive max selon level  */
    get hp  (){ return this.getEvoValue('hp',true)  };
    //#endregion
    //#region [rgba(150, 0, 200, 0.1)] // data2/System/states/SOURCE/images/st_mp.png
    /** add value to current*/
    set _MP  (value){ this._currentMP = Math.max(Math.min(this._MP+value, this.MP),0) };
    /** valeur current */
    get _MP  (){ return this._currentMP };
    /** valeur reel effective du state (inclu: status,states)*/
    get MP  (){ return $statesManager.getState(this.states.mp).computeValue() };
    /** return la value evolutive max selon level  */
    get mp  (){ return this.getEvoValue('mp',true) };
    //#endregion
    //#region [rgba(0, 200, 0, 0.1)] // data2/System/states/SOURCE/images/st_hg.png
    /** set value to current*/
    set _HG  (value){ this._currentHG = Math.max(Math.min(value, this.HG),0) };
    /** valeur current */
    get _HG  (){ return this._currentHG };
    /** valeur reel effective du state atk (inclu: status,states)*/
    get HG  (){ return $statesManager.getState(this.states.hg).computeValue() };
    /** return la value evolutive max selon level  */
    get hg  (){ return this.getEvoValue('hg',true) };
    /** obtien le rate % entre current et max */
    get hgHG(){return this._HG/this.HG }

    add_HG(value){
        const hold = this._HG;
        this._HG = hold+value;
        if(hold!==this._HG){
            this.updateStates(this.states.hg);
        }
    }

    //#endregion
    //#region [rgba(0, 100, 200, 0.1)] // data2/System/states/SOURCE/images/st_hy.png
    /** add value to current*/
    set _HY  (value){ this._currentHY = Math.max(Math.min(this._HY+value, this.HY),0) };
    /** valeur current */
    get _HY  (){ return this._currentHY };
    /** valeur reel effective du state (inclu: status,states)*/
    get HY  (){ return $statesManager.getState(this.states.hy).computeValue() };
    /** return la value evolutive max selon level  */
    get hy  (){ return this.getEvoValue('hy',true) };
    //#endregion
    //#region [rgba(200, 200, 200, 0.05)] // data2/System/states/SOURCE/images/st_atk.png
    /** valeur reel effective du state atk (inclu: status,states)*/
    get ATK(){ return $statesManager.getState(this.states.atk).computeValue() }
    get atk(){ return this.getEvoValue('atk',true) };
    /** valeur reel effective du state def (inclu: status,states)*/
    get DEF(){ return $statesManager.getState(this.states.def).computeValue()   }
    get def(){ return this.getEvoValue('def',true) };
    /** valeur reel effective du state sta (inclu: status,states)*/
    get STA(){ return $statesManager.getState(this.states.sta).computeValue()   }
    get sta(){ return this.getEvoValue('sta',true)  };
    /** valeur reel effective du state int (inclu: status,states)*/
    get INT(){ return $statesManager.getState(this.states.int).computeValue()   }
    get int(){ return this.getEvoValue('int',true)  };
    /** valeur reel effective du state lck (inclu: status,states)*/
    get LCK(){ return $statesManager.getState(this.states.lck).computeValue()   }
    get lck(){ return this.getEvoValue('lck',true)  };
    /** valeur reel effective du state expl (inclu: status,states)*/
    get EXPL(){ return $statesManager.getState(this.states.expl).computeValue()   }
    get expl(){ return this.getEvoValue('expl',true)  };
    /** valeur reel effective du state mor (inclu: status,states)*/
    get MOR(){ return $statesManager.getState(this.states.mor).computeValue()   }
    get mor(){ return this.getEvoValue('mor',true)  };
    //#endregion

    /** Formule evolution par level */
    getEvoValue(st,level=this._level,bonus){
        const ev = this.evo[st];
        bonus = bonus && this['_'+st] || 0;
        return ~~(ev.b*(1+(level-1)*ev.r) + (ev.f*(level-1)))+bonus;
    };

    /** initialize les stats a un level 
     * @param {Boolean} reset - restoration des states au changement 
    */
    initialize_stats(level=1, reset){
        this._level = level;
        this._currentHP = this.hp;
        this._currentMP = this.mp;
        this._currentHG = this.hg;
        this._currentHY = this.hy;

        Object.values(this.evo).forEach(evo=>{
            if(evo.type !== 'extra'){ //TODO: RENDU ICI , SOURCE NAME P1
                this.states[evo.name] = $statesManager.create(evo.name, this._id)._contextId;
            }
        });
    };

    /** forcer un call update des status du battlers (seulement les class) 
     * @param huds - si pluto passer par le update huds, car players a des states vivible (refactory les huds ) ces une option temporaire
    */
    updateStates(contextId){
        //! si passe un context ex: (ex: add_HG()), update juste ce context, ce context peut demander un mise a jour global si a des changement
        if(contextId){
            $statesManager.getState(contextId).update();
        };
        
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
            this.inCase = dataObj;
            dataObj._battlerID = this._battlerID; // permet de retrouver le battler sur la cases.
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
