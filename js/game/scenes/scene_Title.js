class Scene_Title extends _Scene_Base {
    constructor() {
        super();
    };

    //#region [Initialize]
    initialize(){
        //this.initialize_BackgroundVideo(); //TODO: GROS PROBLEME DE PERFORMANCE AVEC LES VIDEO
        this.initialize_titleChoice();
        this.initialize_interactive();
        this.__initialize();
    };

    initialize_BackgroundVideo(){
        //FIXME: GROS PROBLEME AVEC CODEC, A TESTER ET SEMBLE FONCTIONNER SEULEMENT SI  currentTime = 0.1
        const texture = PIXI.Texture.from('data2/Video/intro/original_intro1Loop.webm');
        const videoSprite = this.videoSprite = new PIXI.Sprite( texture ); //PIXI.Texture.fromVideo( $loader.DATA2.original_intro1.data )
            videoSprite.anchor.set(0.5);
            videoSprite.scale.set(2)
        const videoControler = this.videoControler = videoSprite.texture.baseTexture.source;
        videoControler.auto
            videoControler.currentTime = 0.1; //temp jump to end
            videoControler.loop = true;
        const bgContainer = new PIXI.projection.Container3d();
            bgContainer.position3d.z = 1000;
            bgContainer.position3d.y = 500;
            bgContainer.parentGroup = $displayGroup.NormalGroup;
            bgContainer.addChild(videoSprite);
        this.addChild(bgContainer); 
    };

    initialize_titleChoice(){
        const dataBase = $loader.DATA2.titleCommandFX;
        const dataBase2 = $loader.DATA2.titleLogo;
        //!choice container
        const ChoiceContainer = new PIXI.projection.Container3d();
            ChoiceContainer.name = 'ChoiceContainer';
            ChoiceContainer.proj.affine = 3;
        const filters = [
            new PIXI.filters.OutlineFilter(2, 0x40ff1a,4),
            new PIXI.filters.OutlineFilter(2, 0xecff1a,4),
            new PIXI.filters.OutlineFilter(2, 0xff3c1a,4),
            new PIXI.filters.OutlineFilter(2, 0xff1ae0,4),
            new PIXI.filters.OutlineFilter(2, 0xff1ae0,4),
        ];
        ['CnewGame','Cloadgame','Coptions','Ccredit'].forEach((textureName,i) => {
            const newGame = $objs.create(dataBase, textureName).child; //new PIXI.Text(txt,$systems.styles[3]);
            newGame.name = textureName;
            newGame.scale3d.set(1.4);
            ChoiceContainer.addChild(newGame);
            newGame.y = 0+145*i;
            newGame.x = 765;
            newGame.interactive = true;
            newGame.on('pointerover' , ()=>{
                newGame.child.a.filters = [filters[i]];
                filters[i].padding = 30;
                TweenLite.fromTo(filters[i], 0.3,{thickness:10}, {thickness:1, ease:Power4.easeInOut }) 
            });
            newGame.on('pointerout'  , ()=>{ 
                newGame.child.a.filters = null;
            });
            newGame.on('pointerup', (e)=>{ 
                switch (e.currentTarget.name) {
                    case 'CnewGame' : this.startNewGame(); break;
                    case 'Cloadgame':  break;
                    case 'Coptions' :  break;
                    case 'Ccredit'  :  break;
                    default:break;
                }
            });
        });

        const TitlebgFx = $objs.create(dataBase, 'titlebgFx').child;
        TitlebgFx.position3d.x = 450;
        TitlebgFx.position3d.y = -280;
        TitlebgFx.scale3d.set(2);
        TitlebgFx.child.a.filters = [filters[4]];
        filters[4].resolution = 0.1;

        const logoTitle = $objs.create(dataBase2, 'logoTitle').child;
        logoTitle.position3d.x = -700;
        logoTitle.position3d.y = -750;
        logoTitle.position3d.z = 100;
  
        this.addChild(TitlebgFx,ChoiceContainer,logoTitle);
        this.child = this.childrenToName();
    };

    initialize_interactive(){
  
    };
    //#endregion

    //#region [Method]
    start(){
        this.__start();
        $camera._focus = 4000;
        $camera._inteliCam = true;
        //this.startNewGame();//FIXME: creer la scene title, pour le moment auto start
    };

    update(delta){
    };

    //#endregion

    startNewGame(){
        //TODO: CUSTOM DESTROY POUR CERTAINE SCENE.
        if(this.videoSprite){
            this.videoSprite.destroy(true);
            this.videoControler.pause();
            this.videoControler.remove();
            this.videoControler.load();
            this.videoControler = null;
            this.videoSprite = null;
        }
        //TODO : GENERATE ALL RANDOM MAP, BUT KEEP   STORY SCRYPTED CASE EVENTS
        $objs.initialize_newGame('options');
        //$systems.startNewGame('options');
        $stage.goto('Scene_Map2');
    };

};
