/**
 * @typedef  { Object  } ExcelSceneData
 * @property { Object  } SYSTEM         - The Y Coordinate
 * @property { Object  } _lights        - The Y Coordinate
 * @property {{g,p,d,n}} _background    - The Y Coordinate
 * @property { Object  } _sheets        - The Y Coordinate
 * @property { Object  } _objs          - The Y Coordinate
 */

 /**@class */
class _coreLoader {
    constructor () {
        this.DATA = {
            base  :{},
            string:{},
            /**@type ExcelSceneData*/
            scene :{} 
        };
        /** list of DATA2 links by name (Les lettre majuscule sont permanent) */
        this.LINKS = {};
        /**@type {Object.<string, _DataBase>} */
        this.DATA2 = {};
        /** Scenes kits Dependancy */
        this.scenesKits = [
            ['Scene_Boot','Scene_IntroVideo','Scene_Title'], // bootKit
            ['Scene_Map1','Scene_Map2'], // planet1
        ];
        /** index du scenesKits charger */
        this._sceneKitIndex = -1;
        /** fils d'attend de scenes a loader dans le kits*/
        this._scenesKitsQueue = [];
    };
    get TextureCache() {
        return PIXI.utils.TextureCache;
    };
    get BaseTextureCache() {
        return PIXI.utils.BaseTextureCache;
    };
    /** update text log in scene loader */
    set txtLog(txt) {
        if($stage.scene.textLog){
            $stage.scene.textLog.text+=`\n${txt}`;
            if($stage.scene.textLog.height>700){
                $stage.scene.textLog.y-=24;
            }
        };
    };

    //#region [rgba(255, 60, 60, 0.07)]
    /** Loader , initialize les DATA ET return resolve dans main.js*/
    initialize(){
        return new Promise((RESOLVE, REJ) => {
            const loadData = () => {
                return new Promise((resolve, rej) => {
                    const fs = eval("require('fs')");
                    const base   = fs.readdirSync('data/base'  ).filter(f=>f.indexOf('.csv' )>-1);
                    const string = fs.readdirSync('data/string').filter(f=>f.indexOf('.csv' )>-1);
                    const scene  = fs.readdirSync('data/scene' ).filter(f=>f.indexOf('.json')>-1).filter(f=>f.indexOf('_OLD.json')===-1);
                    const loader = new PIXI.loaders.Loader();
                    base.forEach(f => { loader.add(f.split('.')[0], `data/base/${f}`) });
                    string.forEach(f => { loader.add(f.split('.')[0], `data/string/${f}`) });
                    scene .forEach(f => { loader.add(f.split('.')[0], `data/scene/${f}`) });
                    loader.load();
                    loader.onProgress.add((loader, res) => {
                        const dir = res.url.split('/')[1];
                        switch (res.extension ) {
                            case "csv": this.DATA[dir][res.name] = Papa.parse(res.data,{skipEmptyLines: true, dynamicTyping: true}); break;
                            case "json": this.DATA[dir][res.name] = Object.assign({},res.data); break;
                        };
                    });
                    loader.onComplete.add((loader, res) => { 
                        console.log('res: ', res);
                        resolve() 
                    });
                })
            };

            const loadFonts = () => {
                return new Promise((resolve, rej) => {
                    const fontsList = [
                        new FontFace('ArchitectsDaughter', 'url(fonts/ArchitectsDaughter.ttf)', { style: 'normal', weight: 700 } ),
                        new FontFace('zBirdyGame', 'url(fonts/zBirdyGame.ttf)',{ style: 'normal', weight: 700 }),
                        new FontFace('Flux_Architect_Regular', 'url(fonts/Flux_Architect_Regular.ttf)',{ style: 'normal', weight: 700 }),
                        new FontFace('ampersand', 'url(fonts/ampersand.ttf)',{ style: 'normal', weight: 700 }),
                        new FontFace('ShadowsIntoLight', 'url(fonts/ShadowsIntoLight.ttf)',{ style: 'normal', weight: 700 }),
                    ];
                    fontsList.forEach(fonts => {
                        fonts.load().then(function(loadedFontFace) {
                            document.fonts.add(loadedFontFace);
                            //document.body.style.fontFamily = '"Junction Regular", Arial';
                        });
                    });
                    document.fonts.ready.then(()=>{ resolve() });
                })
            };
            
            /** scan les fichiers DATA2 disponible du jeux et store les links */
            const loadLinkData2 = () => {
                return new Promise((resolve, rej) => {
                    const recursive = eval("require('recursive-readdir')");
                    function ignoreFunc(file, stats) {
                            const isDirectory = stats.isDirectory();
                            if(stats.isDirectory()){
                                return file.contains('SOURCE') || file.contains('source');
                            }else
                            if(stats.isFile()){
                                return !file.contains('.json') && !file.contains('.webm') && !file.contains('.mp4');
                            };
                        };
                    recursive("data2", ["foo.cs", ignoreFunc], (err, files) => {
                        files.forEach(PATH => { // TODO: UTILISER DES DES REF PATH,NAME,MULTI,NORMAL , inclure les png , pour checker les nomral
                            const split = PATH.replace('.','\\').split('\\');
                            const name = split[split.length-2];
                            this.LINKS[name] = PATH.replace(/\\/g,"/");
                        });
                        resolve();
                    });
                })
            };

            const main = async () => {
                //# libs
                await loadData();
                this.CSVformate();
                await loadFonts();
                await loadLinkData2();
                RESOLVE();
            };
            main();
        });
    };

    /** formater les dataCSV correctement pour plus de lisibiliter */
    CSVformate(){
        Object.keys(this.DATA.base).forEach(key => {
            const data = [this.DATA.base[key].data]; // store in array car certain sheet on plusieur splited tableau
            let mode = null; // 2 type de mode "{}" "[]"
            let header = null;
            let buffer = {};
            let bkey = null; // buffer key proprieter du buffer actuel
            let splitIndex = data[0][0].indexOf("split");
            if(splitIndex>-1){ // si split index , splitter la feuile en 2.
                const data2 = [];
                data[0].forEach(line => { data2.push(line.splice(splitIndex)) });
                data.push(data2);
            }
            // parcour le ou les tableau plitter "split" (normalment ya na max 2! mais a voir si on a besoin plus)
            let tableauId = 0;
            while (data[tableauId]) {
                const _data = data[tableauId];
                for (let i=0, l=_data.length; i<l; i++) {
                    const line = _data[i];
                    if(line[0]==="split"){mode=null}
                    // si line[0] est mode array
                    switch (line[0]) {
                        case "[]":
                            mode = "[]";
                            bkey = line[1];
                            buffer[bkey] = [];
                            header = _data[++i]; // next line est un header, passer
                            continue;
                        break;
                        case "{}":
                            mode = "{}";
                            bkey = line[1];
                            buffer[bkey] = {};
                            header = null;
                            continue;
                        break
                    };
                    //! si on a un mode
                    if(mode==="[]"){
                        const lineEntry = header.map((key,i)=>[key,line[i]]);
                        const result = Object.fromEntries(lineEntry);
                        //delete result[null]; // SUPRIMER LES KEYS NULL
                        if(Object.values(result).remove(null).length){
                            delete result[null]; //si une key null , remove
                            buffer[bkey].push(result);
                        }
                    }
                    if(mode==="{}"){
                        const result = line.slice(2,7+2);
                        buffer[bkey][line[1]] = result.remove(null);//.length===1?result[0]:result; // max 7 array tolerer
                    }
                };
                tableauId++;//!end
            };
            this.DATA.base[key] = buffer;
        });
    };
    //#endregion

    //#region [rgba(60, 120, 60, 0.07)]
    /** return une class */
    getClassFrom(className){ //TODO: REFACTORISER, UTILISER CLASS.NAME + static
        switch (className) {
            case 'Scene_Boot'      : return new Scene_Boot      ();break;
            case 'Scene_IntroVideo': return new Scene_IntroVideo();break;
            case 'Scene_Title'     : return new Scene_Title     ();break;
            case 'Scene_Map1'      : return new Scene_Map1      ();break;
            case 'Scene_Map2'      : return new Scene_Map2      ();break;
        }
    };
    
    /** copy array scenes names */
    copyScenesKitsFrom(index = this._sceneKitIndex){
        return this.scenesKits[index].slice() || [];
    };

    // return sois la prochaine scene, sois la scene loader pour changer de scene pack
    getNextScene(nextScene){
        const nextSceneIndex = this.getNextSceneKitsIndex(nextScene);
        // si index scenekit deja charger
        if(this._sceneKitIndex ===  nextSceneIndex){
            //Les data kit son dispo creer la scene.
            return this.getClassFrom(nextScene);
        }else{
            // scene n'est pas loader ! creet une nouvelle scene loader 
            this._sceneKitIndex = nextSceneIndex;
            return new Scene_Loader(nextScene);
        };
    };

    /** obtien lindex du kits de nextScene */
    getNextSceneKitsIndex(nextScene){
        for (let i=0, l=this.scenesKits.length; i<l; i++) {
            const index = this.scenesKits[i].indexOf(nextScene);
            if(index>-1){ return i };
        };
    };

    createNormals(source,res){
        source.textures_n = {};
        for (const key in source.textures) {
            const t = source.textures[key];
            const tn = new PIXI.Texture(res.texture.baseTexture, t.frame, t.orig, t.trim, t.rotate, t.defaultAnchor); // check rot = res_d.data.frames[key].rotated ? 2 : 0; // base.data.rotated ? 2 : 0 ?
            const id = key+'_n';
            PIXI.Texture.addToCache(tn,id);
            source.textures_n[key] = tn;
        };
    };

    /** pass test for valid data and return dataScene._sheets de la scene*/
    getSheetJSON(SCENE){
        // TODO: AJOUTER LES PERMA avec des nom Majuscule
        /*
        "gameItems",
		"caseEvents",
		"caseFXhit1",
		"messageBox",
		"heroe1_rendered",
		"gloves",
		"hudStats",
		"hud_displacement",
		"hud_combats",
		"hudsCombatVictory",
		"hudsPinBar",
		"menueItems",
		"iconsMonsters",
		"m0",
		"states",
		"orbs",
		"sliders",
		"flagsLocal-0"
        */
        // si Scene_Boot, return tous les link saufe multipack>0 ? (utiliser aussi initialisation loader.)
        if(SCENE==="Scene_Boot"){
            return  Object.keys(this.LINKS).filter(k=>!(+k.split('-')[1] > 0))
        }else
        if(SCENE){
            return this.DATA.scene[SCENE] && this.DATA.scene[SCENE]._sheets || [];
        };

    };

    cleanExtraRessource(res){//todo: envelemt
        if(res){
            for (let i=0,k=Object.keys(res), l=k.length; i<l; i++) {
                const _res = res[k[i]];
                if(_res.isJson || _res.isVideo || _res.isAudio ){ continue };
                delete res[k[i]];
            };
        };
    };

    clearCache(){
        //PIXI.utils.clearTextureCache(); //TODO: LE FAIR MANUELMENT
    };

    //#endregion

    // initialise prepare loader setup
    start (nextScene) {
        this._isLoading = true;
        this._sceneKitIndex = this.getNextSceneKitsIndex(nextScene);
        this._scenesKitsQueue = this.copyScenesKitsFrom(); // obtien un kitList de scenes attacher a `nextSceneName`;
        this.clearCache();
        this.load();
    };

    /** loop load scenes kits */
    load() {
        if(!this._audioLoaded){ return this.load_audio()}; //TODO: voir une facon pklsu porpre d'implanter ca.
        const next = this._scenesKitsQueue.shift();
        next? this.loadScene(next) :  this._isLoading = false;
    };

    /** load les audio permanent et redondant*/
    load_audio(){
        this._audioLoaded = true;
        // list des perma audio au SceneBoot, indic si ces un spriteAudio
        const list = { //[bgm]:BackgroundMusic, [bgs]:BackgroundSound, [sfx]:soundFX, [mfx]:musicFX
            setuniman__cozy_0_16 :{type:'bgm',ext:"mp3",path:'' ,sprite:false},
            battleA0             :{type:'bgm',ext:"mp3",path:'' ,sprite:false},
            newBattle_0_04       :{type:'mfx',ext:"wav",path:''            ,sprite:false},
            BT_A                 :{type:'sfx',ext:"ogg",path:'button/'     ,sprite:true },
            JMP_A                :{type:'sfx',ext:"ogg",path:'jump/'       ,sprite:true },
            TRA_A                :{type:'sfx',ext:"ogg",path:'transition/' ,sprite:true },
            jump_todofd2gt       :{type:'sfx',ext:"wav",path:'jump/' ,sprite:false }, // DELETEME:
        };
        const loader = new PIXI.loaders.Loader();
        for (const key in list) {
            const o = list[key];
            loader.add(key, `audio/${o.type}/${o.path}${key}.${o.ext}`);
            o.sprite && loader.add(`${key}_data`,`audio/${o.type}/${o.path}${key}.txt`)
        }
       
        loader.load((loader, res) => {
            Object.keys(list).forEach(key => {
                if(list[key].sprite){
                    const data = res[`${key}_data`].data;
                    const result = {};
                    data.split('\n')
                    .filter(line => !!line)
                    .map(line => line.split('\t'))
                    .forEach(([start, end, name]) => result[name.replace(/\r/,"")] = { start, end });
                res[key].sound.addSprites(result);
                }
            });
            
        });
        loader.onComplete.add((loader, res) => { this.load() });
};

    /** start load scenes stuff */
    loadScene(SCENE){
        const dataSheets = this.getSheetJSON(SCENE);
        if(!dataSheets){ return this.load() }; // break and continue next scene
        const loader = new PIXI.loaders.Loader();
        dataSheets.forEach(fileName => {
            loader.add(fileName, this.LINKS[fileName]);
            if(fileName.contains('-')){ // is multi
                const split = fileName.split('-');
                for (let i=++split[1],n=split[0]; this.LINKS[n+'-'+i]; i++) {
                    loader.add(n+'-'+i, this.LINKS[n+'-'+i]);
                };
            };
        });
        loader.load();
        loader.onError.add((loader, res)=>{
            console.log('res: ', res);

        })
        loader.onProgress.add((loader, res) => {
            this.txtLog = res.url;
        });
        loader.onComplete.add((loader, res) => {
            this.cleanExtraRessource(res);
            this.loadNormals(SCENE,res);
        });
        !loader.loading && loader.onComplete._tail._fn(null,[]); // force continue if nothing to load;
    };

    /** load les png normal si besoin */
    loadNormals(SCENE,RES) {
        const loader = new PIXI.loaders.Loader();
        loader.pre((r,next)=>{ (r._originName = r.name.split('_image_n')[0]) && next() });
        Object.values(RES).filter(res=> res.data.meta && res.data.meta.normal_map).forEach(res => {
            loader.add(`${res.name}_image_n`, res.url.replace(`${res.name}.${res.extension}`,res.data.meta.normal_map));
        });
        loader.load();
        loader.onProgress.add((loader, res) => {
            this.createNormals(RES[res._originName],res)
            this.txtLog = res.url;
        });
        loader.onComplete.add((loader, res) => {
            this.processMultiPack(SCENE,RES);
        });
        !loader.loading && loader.onComplete._tail._fn();
    };

    /** computing batch result */
    processMultiPack(SCENE,RES) {
        for (const key in RES) {
            if(key.contains('-0')){
                const keyPack = key.split('-')[0];
                const source = RES[key];
                const list = source.data.meta.related_multi_packs.map(k=>k.split('.json')[0]);
                source.name = keyPack;
                list.forEach(packName => {
                    const pack = RES[packName];
                    Object.assign(source.textures, pack.textures);
                    source.textures_n && Object.assign(source.textures_n, pack.textures_n);
                    Object.assign(source.data.frames, pack.data.frames);
                    if (pack.data.animations) {
                        Object.keys(pack.data.animations).forEach(keyA => {
                            const list = pack.data.animations[keyA];
                            source.data.animations[keyA]? source.data.animations[keyA].push(...list) : [...list];
                            source.data.animations[keyA].sort();
                        });
                    };
                    delete RES[packName];
                });
                // rename on enleve mutlipack -0 arg
                RES[keyPack] = RES[key];
                delete RES[key];
            };
        };

        //! Creer tous les dataBase nessesaire pour le lot de scenes
        for (let key in RES) {
            if(!this.DATA2[key]){
                const dataBase = this.DATA2[key] = _DataBase.create(RES[key]);
                if(dataBase._perma){ // les perma on des lettre majuscule
                     Object.defineProperty(this.DATA2, key, { enumerable: false });
                };
            };
        };
            
        // cree tous les dataBase
        /*if(SCENE === "Scene_Boot"){
            for (let key in RES) {
                const dataBase = this.DATA2[key] = _DataBase.create(RES[key]);
                if(dataBase._perma){ // les perma on des lettre majuscule
                     Object.defineProperty(this.DATA2, key, { enumerable: false });
                };
            };
        };
        for (const key in RES) {
            const dataBase = this.DATA2[key];
            dataBase.addToCache(RES[key]);
        };*/
        
       
        this.clearTexturesCache();
        this.load();
    };

    /** normalise les ressource selon les besoin du jeux. */
    processDataBase(SCENE,RES){ //TODO: pendant scene boot creer tous les dataBase

    };

    /** au debut d'un load kit ou apres sceneBoot */
    clearTexturesCache(){// TODO:
        //PIXI.utils.clearTextureCache();
       // this.TextureCache.clearCache()
       // this.BaseTextureCache.clearCache();
    };

    
};//END CLASS

let $loader = new _coreLoader();
console.log('$loader.', $loader);
