
class Scene_Map1 extends _Scene_Base {
    constructor() {
        super();
        /** galaxi id */
        this._galaxiId = 0;
        /** planet id */
        this._planetId = 0;
        /** map id */
        this._mapId = 0;
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
        //   this.setupObjs();
        //   this.setupLights();
           this.setupPlayer();
           this.setupCamera();
        //   this.setupObjetInteractive(); // creer les listeners des objet click pour la map
        //   this.setupEventCases(); // setup interactivity for events case in map1?
        //   this.setupAudio();
        //$camera.moveToTarget($player);
        //$stage.goto();
    };

    update(delta){

    };


    setupObjs(){
        $objs.createSpritesObjsFrom(this.name); //create objs from className json
        $objs.list_s.length && this.addChild(...$objs.list_s);
    };

    setupLights(){
        //const dataValues = $Loader.DataScenes[this.name]._lights.ambientLight;
        //$stage.LIGHTS.ambientLight.asignValues(dataValues, true);
    }

    setupPlayer(){
        for (let i=0,players = $players.group, l=players.length; i<l; i++) {
            const player = players[i];
            this.addChild(player.p);
        };
        $players.transferToCase();
    };

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
