

/*:
// PLUGIN □────────────────────────────────□ SYSTEM CORE ENGINE □───────────────────────────────┐
* @author □ Jonathan Lepage (dimisterjon),(jonforum) 
* @plugindesc manage all game systems informations
* V.0.1a
* License:© M.I.T
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
*/

// ┌-----------------------------------------------------------------------------┐
// GLOBAL $systems CLASS: _systems
//└------------------------------------------------------------------------------┘
/**
 *Tous les flags et data generaux, verification structure generation de hash new game
 *
 * @class _systems
 */
class _systems{
    constructor() {

        /**list des states pour les chara et monstres 
         * @type { {base:Array<["hp", "mp", "hg", "hy","atk","def","lck","int","sta","expl","mor",]>, extra:Array<["ccrt", "ceva", "xp",]>, list:Array} }  */
        this.states = {
            base:[
                'hp',
                'mp',
                'hg',
                'hy',
                'atk',
                'def',
                'lck',
                'int',
                'sta',
                'expl',
                'mor',
            ],
            extra:[
                'ccrt',
                'ceva',
                'xp',
            ],
            status:[
                ''
            ],
             /**@returns {Array<["setting", "save", "quest", "map", "item", "status", "mBook"]>} */
            get list() { return [...this.base,...this.status] }
        };
        Object.defineProperty( this.states, 'list', {enumerable: false});
  
        /**list des type de synergie colorimetric orbic
         * @type {Array<["fo_base", "fo_master", "po_base", "po_base",]>}  */
        this.synergieOrbic = [
            'fo_base', //faiblesse orbic base
            'fo_master', //faiblesse orbic master
            'po_base',  //puissance orbic base
            'po_base', //puissance orbic master
        ];

        /**cache game texts styles, default:0 
         * @type {Array.<PIXI.TextStyle>} - 0=>7 */
        this.styles = [
            new PIXI.TextStyle({//id:0
                fill: "#d8d8d8",fontFamily: "ArchitectsDaughter", 
                fontSize: 16, lineJoin: "bevel", miterLimit: 0, padding: 2, stroke: "white", stroke:"#292929", strokeThickness: 1,
                lineHeight:17
            }),
            new PIXI.TextStyle({//id:1
                fill: "#de8447", fontFamily: "ArchitectsDaughter", 
                fontSize: 35, lineJoin: "bevel", miterLimit: 0, padding: 4, stroke: "white", strokeThickness: 10 
            }),
            new PIXI.TextStyle({//id:2 [infoMonsterBox dans battle]
                fill: "#d8d8d8", fontFamily: "ArchitectsDaughter", 
                fontSize: 17, lineJoin: "bevel", miterLimit: 0, padding: 4, stroke: "white", strokeThickness: 5 , stroke:"#3c3c3c"
            }),
            // fonts\style0.jpg
            new PIXI.TextStyle({ // id:3 Combat dammage HIT
                fill:"#ffffff", fontFamily: "ArchitectsDaughter", 
                fontSize:40,fontWeight:"bold",lineJoin:"round",miterLimit:20,strokeThickness:10
            }),
            new PIXI.TextStyle({ // id:4 combat victory log
                fill:"#ffffff", fontFamily: "ArchitectsDaughter", 
                fontSize:30,fontWeight:"bold",lineJoin:"round",miterLimit:20,strokeThickness:6
            }),
            new PIXI.TextStyle({ // id:5 combat victory log
                fill:"#ffffff", fontFamily: "ArchitectsDaughter", 
                fontSize:22,fontWeight:"bold",lineJoin:"round",miterLimit:20,strokeThickness:2
            }),
            new PIXI.TextStyle({//id:6 items descript menuItem
                fill: "#80662f",fontFamily: "ArchitectsDaughter", 
                fontSize: 20,strokeThickness:1,stroke:"#80662f",lineHeight:18,letterSpacing:1,
            }),
            new PIXI.TextStyle({//id:7 black desc , navigator ...
                fill: "#1c1c1c",fontFamily: "ArchitectsDaughter", 
                fontSize: 14,strokeThickness:1.5,stroke:"#1c1c1c",lineHeight:16,letterSpacing:1,
            }),
            new PIXI.TextStyle({//id:8 waring
                fill: "#e63746",fontFamily: "ArchitectsDaughter", 
                fontSize: 20,strokeThickness:0.5,stroke:"#1c1c1c",lineHeight:16
            }),
            new PIXI.TextStyle({//id:9 black desc , navigator ...
                fill: "#1c1c1c",fontFamily: "ArchitectsDaughter", 
                fontSize: 20,strokeThickness:0.5,stroke:"#1c1c1c"
            }),
            new PIXI.TextStyle({//id:10 travel number
                fill: "#000000",fontFamily: "ArchitectsDaughter", fontSize: 55, fontWeight: 700, 
                strokeThickness:3, stroke:"#1c1c1c", lineJoin: "round",
                dropShadow: true, dropShadowAlpha: 0.1, dropShadowAngle: 0.2, dropShadowBlur: 1, dropShadowDistance: 6,
                padding: 8,
            }),
        ];
        /**list of possible options */
        this.optionsType = { // Meme nom que les menue et huds
            get Settings     () { return {color:'white' } },//#ffffff
            get Saves        () { return {color:'green' } },//#00ff3c
            get Quests       () { return {color:'blue'  } },//#003cff
            get Maps         () { return {color:'brown' } },//#70562e
            get Items        () { return {color:'red'   } },//#ff0000
            get Status       () { return {color:'pink'  } },//#f600ff
            get MonstersBook () { return {color:'black' } },//#000000
            /**@returns {Array<["Settings", "Saves", "Quests", "Maps", "Items", "Status", "MonstersBook"]>} */
            get keys() { return Object.keys(this)},
        };
        Object.defineProperty( this.optionsType, 'keys', {enumerable: false});
        /**list of possible action combat */
        this.actionType = {
            get attack         () { return {color:'white' ,sIcon:'atk'  } },//#ffffff
            get defense        () { return {color:'green' ,sIcon:'def'  } },//#00ff3c
            get cBook          () { return {color:'pink'  ,sIcon:'int'  } },//#f600ff
            get move           () { return {color:'blue'  ,sIcon:'sta'  } },//#003cff
            get asimilation    () { return {color:'brown' ,sIcon:'expl' } },//#70562e
            get identification () { return {color:'red'   ,sIcon:'mor'  } },//#ff0000
            /**@returns {Array<["attack", "defense", "cBook", "move", "asimilation", "identification"]>} */
            get keys() { return Object.keys(this)},
        };
        Object.defineProperty( this.actionType, 'keys', {enumerable: false});

        /**Type element in game, general */
        this.filterType = {
            get mineral () { return 'white' },//#ffffff
            get plant   () { return 'green' },//#00ff3c
            get builder () { return 'brown' },//#70562e
            get magic   () { return 'pink'  },//#f600ff
            get water   () { return 'blue'  },//#003cff
            get food    () { return 'red'   },//#ff0000
            get tools    () { return 'black' },//#000000
            /**@returns {Array<["mineral", "plant", "builder", "magic", "water", "food", "tools"]>} */
            get keys() { return Object.keys(this)},
        };
        Object.defineProperty( this.filterType, 'keys', {enumerable: false});

        /**@description list des couleur possible pour les cases dans jeux*/
        this.colorsSystem = {
            get white() { return 0xffffff},//#ffffff
            get pink () { return 0xf600ff},//#f600ff
            get blue () { return 0x003cff},//#003cff
            get red  () { return 0xff0000},//#ff0000
            get brown() { return 0x70562e},//#70562e
            get green() { return 0x00ff3c},//#00ff3c
            get black() { return 0x000000},//#000000
            /**@returns {Array<["white", "pink", "blue", "red", "brown", "green", "black"]>} */
            get keys() { return Object.keys(this)},
        };
        Object.defineProperty( this.colorsSystem, 'keys', {enumerable: false});


        /** lister des type de sorter pour les menues ou autre. Return le text selon language */
        this.sorterType = { // "id", "name", "recent", "weigth", "quantity", "value", "rarity","dammage"
        //TODO: RETURN $TXT selon localisation
            get id       () { return 'id'       },
            get name     () { return 'name'     },
            get recent   () { return 'recent'   },
            get weigth   () { return 'weigth'   },
            get quantity () { return 'quantity' },
            get value    () { return 'value'    },
            get rarity   () { return 'rarity'   },
            get dammage  () { return 'dammage'  },
            get keys() { return Object.keys(this)},
        };
        Object.defineProperty( this.sorterType, 'keys', {enumerable: false});

        /** list des type de bounty in cases */
        this.gameBounties = { //TODO: RENAME IN PHOYOSHOP
        //TODO: RETURN $TXT selon localisation
            default:'caseEvent_hide',
            perma:[
                'caseEvent_door',
                'caseEvent_exitH',
                'caseEvent_exitV',
                'caseEvent_quests',
            ],
            passive:[
                'caseEvent_buffers',
                'caseEvent_gold',
                'caseEvent_map',
                'caseEvent_miniGames',
                'caseEvent_monsters',
                'caseEvent_teleport',
                'caseEvent_timeTravel',
            ],
            get keys() { return [...this.perma,...this.passive]},
        };
        Object.defineProperty( this.gameBounties, 'keys', {enumerable: false});
        
        

        /**@description filters preConfigurer en memoire */
        this.PixiFilters = {
            ShockwaveFilter: new PIXI.filters.ShockwaveFilter([1920/2,1080/2] ), // {amplitude:,wavelength,speed,brightness,radius}
            noiseGame                 : new PIXI.filters.NoiseFilter      (0.05, 1          ),
            OutlineFilterx8Green      : new PIXI.filters.OutlineFilter    (4, 0x16b50e, 1  ),
            OutlineFilterx4Black     : new PIXI.filters.OutlineFilter    (4, 0x000000, 1 ),
            /**Outline blanc 4px pour les cases hover  */
            OutlineFilterx4white      : new PIXI.filters.OutlineFilter    (4, 0xffffff, 1  ),
            OutlineFilterx8Red        : new PIXI.filters.OutlineFilter    (4, 0xdb3d2b, 1  ),
            OutlineFilterx8Yellow     : new PIXI.filters.OutlineFilter    (20, 0xd6d022, 1 ),
            OutlineFilterx8Pink       : new PIXI.filters.OutlineFilter    (20, 0xc722d6, 1 ),
            TiltShiftFilterBlur       : new PIXI.filters.TiltShiftFilter  (                ),
            KawaseBlurFilter_combatBG : new PIXI.filters.KawaseBlurFilter (0, 12, true     ), //pour combat bg
            blur1 : new PIXI.filters.BlurFilter (1,2,1), //pour combat bg
            blurTxt:new PIXI.filters.BlurFilter (3,5), //pour message motions filters
            MotionBlurFilter: new PIXI.filters.MotionBlurFilter([-10,10],50,-3), //pour message motionsBlur
            ZoomBlurFilter_d : new PIXI.filters.ZoomBlurFilter(0,[1920/2,1080/2],250),
            ZoomBlurFilter_n : new PIXI.filters.ZoomBlurFilter(0,[1920/2,1080/2],250),
            BulgePinchFilter: new PIXI.filters.BulgePinchFilter(undefined,160,0.65),
        };


        /** * List des combatModes selon lavancer des turn de combat 
            * @typedef {Object} COMBAT_MODE
            * @property {number} COMBAT_MODE.TIMER - mode update des turn
            * @property {number} COMBAT_MODE.SELECT_ACTION - choisir une action
            * @property {number} COMBAT_MODE.SETUP_ACTION - setup de l'action choisis
         */
        this.COMBAT_MODE = {
                TIMER: -1,
                SELECT_ACTION: 0,
                SETUP_ACTION: 1,
        };
        
        /** * List des combatModes selon lavancer des turn de combat 
            * @typedef {Object} COMBAT_MODE
            * @property {number} COMBAT_MODE.TIMER - mode update des turn
            * @property {number} COMBAT_MODE.SELECT_ACTION - choisir une action
            * @property {number} COMBAT_MODE.SETUP_ACTION - setup de l'action choisis
         */
        this.ACTION_MODE = {
            ATTACK: 'atk',//player0 , player1
            DEFENSE: 'def',//player0
            MOVE: 'sta',//player0. player1
            MAGICK: 'int',//player1
            IDENTIFICATION: 'int',//player0
            ASSIMILATION: 'int',//player1
        };
    };

    /** initialize game system from options */
    initialize(option){

        //$txt.initialize(); // initialise all hubs
        //$player1.initialize(); // create game player
    };

    /** demmarge un nouveau jeux. */
    startNewGame(option={dificulty:0}){
        this.initialize(option);
       //$objs.computeNewRandomGame(1);//TODO:
       $stage.goto('Scene_Map1');
    };

    loadGame(dataLoad){
        //this.setupObjs(); //FIXME: 
       //this.setupLights();
       //$objs.computeNewRandomGame(1);//TODO:
       $stage.goto('Scene_Map1');
    };

    /** creer une bezier sprite avec des control point defenit 
     * @param {Array.<Number>} cpXY1 - controle point gauche
     * @param {Array.<Number>} cpXY2 - controle point droite
     * @param {Array.<Number>} toXY - destination
     * @returns {PIXI.Sprite}
    */
    bezierArrow(cpXY1=[0,0],cpXY2=[0,0],toXY=[0,0]){
        const bezierArrow = new PIXI.Graphics();
        const normal = [ - (toXY[1] - cpXY2[1]), toXY[0] - cpXY2[0] ];
        const l = Math.sqrt(normal[0] ** 2 + normal[1] ** 2);
        normal[0] /= l;
        normal[1] /= l;
        
        const tangent = [ -normal[1] * 10, normal[0] * 10 ]; // ouverture
        normal[0] *= 20;
        normal[1] *= 20;
        
        bezierArrow
        .lineStyle(6, 0xffffff, 1)
        .bezierCurveTo(cpXY1[0],cpXY1[1],cpXY2[0],cpXY2[1],toXY[0],toXY[1])
        //arrow
        .lineStyle(4, 0xbfbfbf, 1, 0.5)
        .moveTo(toXY[0] + normal[0] + tangent[0]/2, toXY[1] + normal[1] + tangent[1])
        .lineTo(toXY[0], toXY[1])
        .lineTo(toXY[0] - normal[0] + tangent[0]/2, toXY[1] - normal[1] + tangent[1])

        return new PIXI.Sprite($app.renderer.generateTexture(bezierArrow,2,10));
    };

    
    /**
     * @description Les base d'evolutions par level du battler 
     * @returns {{atk:{r:Number,b:Number,f:Number},def:{r:Number,b:Number,f:Number},sta:{r:Number,b:Number,f:Number},int:{r:Number,b:Number,f:Number},lck:{r:Number,b:Number,f:Number},expl:{r:Number,b:Number,f:Number},mor:{r:Number,b:Number,f:Number},name,type }
    */
    extractEvo(statesBase){
        const evo = {};
        statesBase.forEach(el => {
            evo[el.state_base] = { 
                name:el.state_base, r:el.Rate, b:el.base, f:el.flat, type:el.type,
            };
        });
        return evo;
    };

    
    /** //! utilitaire pour debug un display objet et tous ces child */
    debug(container){
        console.warn('debug: ', container);
        function pivot(i,color=0xffffff) {
            const p = new PIXI.Sprite(PIXI.Texture.WHITE);
            p.height = 12;
            p.width = 12;
            p.anchor.set(0.5);
            p.tint = color;
            const t = new PIXI.Text(i,{ fill: "white",strokeThickness: 4, fontSize: 16 });
            t.anchor.set(0.5);
            return [p,t];
        };
        let deep = 0;
        function scan(c) {
            c.children.forEach(child => {
                deep = 0;
                scan(child);
            });
            c.addChild( ...pivot(deep++) );
        }
        scan(container);
    };

};

let $systems = new _systems();
console.log('$systems', $systems);