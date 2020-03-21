//TODO: TOUS REFACTORING POUR PERMETRE 2
//TODO: CREER UNE ESPACE TRAVAIL POUR HUDS
/**@class huds qui affiche les states p1 selon choix (toggle click)*/
class _Huds_States extends _Huds_Base {
    constructor(options) {
        super(options);
        /**@type {Array.<_Huds_States_players>} */
        this.group = []
    };
    //#region [GetterSetter]

    //#endregion

    //#region [Initialize]
    initialize() {
        this.initialize_base();
       //this.initialize_interactions();
       //this.position.set(290,45); //45 90
    };

    initialize_base(){
        for (let i=0, l=2; i<l; i++) {
            const PlayerStateHud = new _Huds_States_players(i);
            this.group.push(PlayerStateHud);
        }
        this.addChild(...this.group);
    }
    //#endregion

    //#endregion
    //#region [Method]

    show(id){
        this.renderable = true;
    }

    /** update seulement les displays relatif au states et status */
    update(){
        this.group.forEach(PlayerStateHud => {
            PlayerStateHud.update();
        });
    }
    //#endregion
};
