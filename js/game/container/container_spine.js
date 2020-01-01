
/*:
// PLUGIN □────────────────────────────────□CONTAINER SPINE2D MANAGER□───────────────────────────────┐
* @author □ Jonathan Lepage (dimisterjon),(jonforum) 
* @module manage container and sprite from pixijs
* V.0.1
* License:© M.I.T
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
*/

/** @memberof _Container_Base */
class _Container_Spine extends _Container_Base {
    constructor(dataObj) {
        super(dataObj);
    };
    get timeScale() {
        return this.s.state.timeScale;
    }
    set timeScale(values) {
        this.s.state.timeScale = values;
    }
    get defaultMix() {
        return this.s.state.defaultMix;
    }
    set defaultMix(values) {
        this.s.state.defaultMix = values;
    }


    
    // getters for ContainerSpine TODO: faire pareille que Container_Animation pour les getters
    get s() { return this.child.s || false };
    get sd() { return this.spriteSlots[0] || false }; // return list des spriteSlots Diffuse
    get sn() { return this.spriteSlots[1] || false }; // return list des spriteSlots Normal


    // add more data called from base getDataValues
    /*asignDataValues(dataValues){
        this.asignValues(dataValues.p);
        // TODO: permettre dans editeur de editer chaque spineSprite : utile pour arbre dinamy feuille ...
        this.Sprites.d.forEach(spineSprite => {
            //dataValues.d && this.asignValues.call(this.Sprites.d, dataValues.d);
        });
        this.Sprites.n.forEach(spineSprite => {
            //dataValues.n && this.asignValues.call(this.Sprites.n, dataValues.n);
        });
        
    };*/

    //TODO: hackAttachmentGroups parent crash et verifier le sprite dans spine ! 
    initialize_base (dataObj=this.dataObj) {
        const dataBase = dataObj.dataBase;
        const s = new PIXI.projection.Spine3d(dataBase.spineData).setName('s'); //new PIXI.spine.Spine(sd);
        this.spriteSlots = s.hackAttachmentGroups("_n",PIXI.lights.normalGroup,PIXI.lights.diffuseGroup); // (nameSuffix, group)
        this.addChild(s);
        if(s.spineData.findAnimation('idle')){
            s.state.setAnimation(0, "idle", true);//DELETEME:
        }else{
            const ani = s.spineData.animations[0].name
            s.state.setAnimation(0, ani, true);//DELETEME:
        }
       
    };

    // dispatch values asigment for spine
    asignDataValues_spine (dataObj) {
        this.computeValue(dataValues.p);
        this.computeValue.call(this.Sprites.d, dataValues.d);
        // can set false, if need keep temp old values for HTML dataEditor
        if(storeValues){ this.dataValues = dataValues };
    };

    //add default parentGroup 
    asignChildParentGroups (normal) {
        this.s.hackAttachmentGroups("_n", PIXI.lights.normalGroup, PIXI.lights.diffuseGroup); // (nameSuffix, group)
    };


};

//END CLASS
    
    