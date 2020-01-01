
class _Container_Animation extends _Container_Base {
        constructor(dataObj) {
            super(dataObj);
        };
        // getters for ContainerAnimations
        get animationSpeed() { return this.d.animationSpeed };
        set animationSpeed(value) { this.d.animationSpeed = value };
        get loop() { return this.d.loop };
        set loop(value) { this.d.loop = value };
        get playing() { return this.d.playing };
        set playing(value) { this.d.playing = value };
        get currentFrame() { return this.d? this.d.currentFrame : 0; };
        set currentFrame(value) { this.d.currentFrame = value };
        get totalFrames() { return this.d.totalFrames };
        set totalFrames(value) { return this.d.totalFrames };


 // create,build basic textures need for ContainerAnimations
    initialize_base (dataObj=this.dataObj) {
        //const dataObj = this.dataObj;
        const dataBase = dataObj.dataBase;
        const textureName = dataObj._textureName;
        const td = dataObj.dataBase.data.animations[textureName].map(tn=>dataObj.dataBase.textures[tn])
        const tn = dataBase.textures_n && dataObj.dataBase.data.animations[textureName].map(tn=>dataObj.dataBase.textures_n[tn])
        const a = new PIXI.extras.AnimatedSprite(td).setName('a');
            a.parentGroup = $displayGroup.DiffuseGroup;
            a.loop = true;
            a.animationSpeed = 0.3;
            a.gotoAndPlay(0);
            this.addChild(a);
        if(tn){
            const n = new PIXI.Sprite(tn[0]).setName('n');
            n.parentGroup = $displayGroup.NormalGroup;
            this.batchWithNormals(a,n,tn);
            this.addChild(n);
        };

   
    };

    // hack updateTexture for allow normals and diffuse with closure
    batchWithNormals (a,n,tn) {
        a.updateTexture = function updateTexture() {
            this._texture = this._textures[this.currentFrame];// update diffuse textures
            this.cachedTint = 0xFFFFFF;
            this._textureID = -1;
            n._texture = tn[this.currentFrame];// update normal textures
            n._textureID = -1;
            
            if (this.onFrameChange) {
                this.onFrameChange(this.currentFrame);
            };
        };
    };

    play (frame) {
       if(Number.isFinite(frame)){
            this.d.gotoAndPlay(~~frame);
       }else{
            this.d.play();
       };
    };


};//END CLASS
    
