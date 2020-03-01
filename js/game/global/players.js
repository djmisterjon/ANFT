/**@class players battler groups manager*/
class _Players {
    constructor() {
        this.group = [];
    };
    //#region [Initialize]
    /** initialise les players selon class choisis au depart du jeux */
    initialize(){
        const DataBattlers0 = new _DataBattlers('p0',1,false,0);
        const DataBattlers1 = new _DataBattlers('p1',1,false,1);
        const p0 = new _player0(DataBattlers0);
        const p1 = new _player1(DataBattlers1);
        this.group.push(p0,p1);
    }
    //#endregion
    //#region [GetterSetter]
    /**@returns {_player0} */
    get p0() { return this.group[0] };
    /**@returns {_player1} */
    get p1() { return this.group[1] };
    //#endregion
    //#region [Method]
    /** @returns {_battler}*/
    getSourceFromID(id){
        return this.group[id];//$combats.battlers[id];
    }

    /** Instant transfer groups to case*/
    transferToCase(caseId=0) {
        this.p0.transferToCase(caseId);
        this.p1.transferToCase(caseId+1);
    };

    /** update les status des 2 joueur */
    updateStates(){
        this.p0.updateStates();
       // this.p2.updateStates();
    };

    /** update les po et fo, permanent par tours, mais pourrait etre retirer. le p2 peut aussi heriter avec options 
     * @param result {ResultTravel}
    */
    updateOrbic(result = $gui.Travel.result){
        this.p0.updateOrbic(result);
        //this.p2.updateOrbic(result);
    }
    //#endregion

};
let $players = new _Players();
console.log1('$players: ', $players);