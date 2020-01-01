class _DisplayGoup {
    constructor() {
        //https://github.com/pixijs/pixi-display/wiki#fast-container-sort
        this.group = [ // les groups pour  .parentGroup = 
            new PIXI.display.Group(0, false), // backgroud Map. BG tile elements will no update and no interaction
            new PIXI.display.Group(1, function(plane) {
                plane.zOrder = plane.position3d.z;
            }), // map elements default player, chara and all basic sprite update z and interaction
            new PIXI.display.Group(2, true), // map elements 2er
            new PIXI.display.Group(3, false), // map elements 3er
            new PIXI.display.Group(4, false), //levelGui: GUI Elements over maps
            new PIXI.display.Group(5, false), //levelMenu: MENU Elements over maps
            new PIXI.display.Group(6, false), //levelTxt: txt bubble, or SFX over all
        ];
        this.layersGroup = []; // a ajouter a chaque stage map
        for (let i = 0, l = this.group.length; i < l; i++) {
             //TODO: FIXME: I L CE PEUT QUE CELA BUG, PERMET AU LAYER 0 BG DETRE VISIBLE  ?
                const g = this.group[i];
                const lg = new PIXI.display.Layer(g);
                g.sortPriority = i? 1:0;
                this.layersGroup.push(lg);
                [g.name,lg.name ] = ['group'+i,'group'+i]; //! just debug help
        };
        this._layer_diffuseGroup = new PIXI.display   .Layer(PIXI.lights.diffuseGroup)             ;
        this._layer_diffuseGroup.clearColor = [0,0,0,0];
        this._layer_normalGroup  = new PIXI.display   .Layer(PIXI.lights.normalGroup)              ;
        this._layer_lightGroup   = new PIXI.display   .Layer(PIXI.lights.lightGroup)               ;
        this._spriteBlack_d      = new PIXI.Sprite( this._layer_diffuseGroup.getRenderTexture() );
        this._spriteBlack_d.tint = 0x000000;
        this._spriteBlack_d.name = "_spriteBlack_d";
        //! add un bounds filter, permet evite les flash blanc
        this._layer_diffuseGroup.filterArea = $app.screen
        this._layer_normalGroup.filterArea = $app.screen
        this._layer_lightGroup.filterArea = $app.screen
            // add filter map 
        // TODO: UTILISER LES FILTERAREA POUR LES FILTERS CONTAINER ET LAYERS
        // TODO: UTILISER LES FILTERAREA POUR LES FILTERS CONTAINER ET LAYERS
        // TODO: UTILISER LES FILTERAREA POUR LES FILTERS CONTAINER ET LAYERS
        // TODO: UTILISER LES FILTERAREA POUR LES FILTERS CONTAINER ET LAYERS
        setTimeout(()=>{
            const noiseFilter = $systems.PixiFilters.noiseGame;
            this._layer_diffuseGroup.filters = [noiseFilter];
            this._layer_diffuseGroup.updateTransform = function updateTransform() {
                // update filters noise
                noiseFilter.seed = Math.random();
                this._boundsID++;
                this.transform.updateTransform(this.parent.transform);
                // TODO: check render flags, how to process stuff here
                this.worldAlpha = this.alpha * this.parent.worldAlpha;
                for (var i = 0, j = this.children.length; i < j; ++i) {
                    var child = this.children[i];
                    if (child.visible) {
                        child.updateTransform();
                    }
                }
            };
        }, 5000)

    
    };

    /** return PIXI.lights.diffuseGroup */
    get DiffuseGroup() {
        return PIXI.lights.diffuseGroup;
    }
    /** return  PIXI.lights.lightGroup */
    get LightGroup() {
        return PIXI.lights.lightGroup
    }
    /** return  PIXI.lights.normalGroup */
    get NormalGroup() {
        return PIXI.lights.normalGroup;
    }
};
let $displayGroup = new _DisplayGoup(); // initialise basic for display groupe
console.log1('$displayGroup.', $displayGroup);
