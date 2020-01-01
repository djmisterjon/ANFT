class Scene_IntroVideo extends _Scene_Base {
    constructor() {
        super();
    };
    //#region [Initialize]
    initialize(){
        this.__initialize();
        this.create_IntroVideo();
    };
    //#endregion

    //#region [Method]
    start(){
        $camera._perspective = 0;
        this.__start();
    };

    update(delta){
       
    };


    create_IntroVideo () {

    const texture = PIXI.Texture.from('data2/Video/intro/vidA1.webm'); //TODO, REVOIR LE LOADER CAR VIDEO BUG, PROBABLEMENT TRANSFER DE DATA
    const videoSprite = new PIXI.Sprite( texture );
    /**@type {HTMLVideoElement}*/
    const videoControler = videoSprite.texture.baseTexture.source;

    videoSprite.anchor.set(0.5);
    //videoSprite.anchor.set(0.5,1)
    videoSprite.width = 1920;
    videoSprite.height = 1080;
    videoControler.currentTime = 11; //temp jump to end
    videoControler.onended = () => {
        videoSprite.destroy(true)
        videoControler.pause();
        videoControler.remove();
        videoControler.load();
        $stage.goto('Scene_Title');
    };
    this.addChild(videoSprite);
    //this.videoControler = videoControler;
       // videoControler.play();
    };
    //#endregion


};

