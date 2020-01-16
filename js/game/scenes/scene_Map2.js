class Scene_Map2 extends _Scene_Base {
    constructor() {
        super();
       // this.audio = {bgm:null,bgs:null};
    };

    //#region [Initialize]
    initialize(){
        this.__initialize();
    };
    //#endregion

    //#region [Method]
    start(){
        this.__start(true);
        //$huds.showAll(); //DELETEME:
        $events.introSleep(); //TODO: AJOUTER PUSH[] DANS UN POOL UPDATE,?
        //$huds.showAll();
    };

    update(delta){

    };

    setupLights(){
        //const dataValues = $Loader.DataScenes[this.name]._lights.ambientLight;
        //$stage.LIGHTS.ambientLight.asignValues(dataValues, true);
    }


    // Events initialisator and hack optimiser
    // setup hack or change context in current map base on global variable
    setupEventCases(){
        // TODO: METTRE LES ID CASE UNIQUE ?
        if(!$gameVariables._wallMaisonDroiteDetuits){
            // empeche la case id id 8 detre selectionner
            console.log('TODO:: ', 'caseSousMurMaison');
            /*$objs.getCase_FromName('caseSousMurMaison').conditionInteractive = () => { 
                return $gameVariables._wallMaisonDroiteDetuits 
            };*/
        };
    }

    // active les interactions sur cette map ? , les interaction exist deja
    setupObjetInteractive(){
       // $huds.setInteractive(true);
    };

    /** setup the audio from this map */
    setupAudio(){
       $audio.playFrom('setuniman__cozy_0_16','bgm',{loop:true,speed:0.95});
    };
    //#endregion

};
