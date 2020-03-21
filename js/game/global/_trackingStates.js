/** Track les math et information de propagation des Influer et Infliger des states */
class _TrackingStates {
    /**
     * Le tracking permet obtenir la valeur reel d'un state, et aussi ca description
     * @param {_StateBase} origin Le state original qui execute le tree
     * @param {_StateBase} [current] Le state current qui est traiter dans le tree
     * @param {_TrackingStates} [parentTracking] Le Tracking precedant (parent) qui a propager le current state
     */
    constructor(origin,current=origin,parentTracking) {
       this.origin   = origin ;
       this.current  = current;
       this.parentTracking   = parentTracking ;
       /** @type {Array.<_TrackingStates>} */
       this.Influer  = [];
       this.Infliger = [];
       this.getInfluer();
    }
    //#region [GetterSetter]

    //#endregion

    //#region [Method]
    getInfluer(){ 
        this.current.Influers.forEach(StateInfluer => {
            const Tracking = new _TrackingStates(this.origin, StateInfluer,this)
            this.Influer.push(Tracking);
        })
    }
    /** @param {_TrackingStates} from Suivie de tracking pour obtenir une ContextValue */
    computeTracking(from){
        let value = this.origin?.getValueContext(from) ?? this.origin.value; //todo: .getValueContext(null) ?
        if(!this.Influer.length){
            return value;
        }
        this.Influer.forEach(InfluerTrack => {
            value+=this.operators(this,InfluerTrack)
        });
        return isNaN(value)?0:value;
    }

    /** 
     * @typedef {"+"|"-"|"*"|"/"|"*+"|"*-"} OPERATOR - list dynamic math computing operator
     * @param {_TrackingStates} a
     * @param {_TrackingStates} b
    */
    operators(a,b){
        const sign = b.current.getOperatorContext(a);
        const aa = a.current.value; //todo: .getValueContext(null) ?
        const bb = b.current.getReelValue(a); //TODO: sa complique le debug 
        switch (sign) {
            case '+' :return aa + bb ;break;
            case '-' :return aa - bb ;break;
            case '*' :return aa * bb ;break;
            case '*+':return aa*+ bb ;break;
            case '*-':return aa*- bb ;break;
            default:return 0;break;
        }
    }

    //TODO: from doit etre traking, revoir ca pour permet au sprite de bien gerer les y
    /**@param {Array.<PIXI.Text>} buffer */
    getDescriptions(from,buffer = [],x=0,y=0){
        let txt = new PIXI.Text(this.current.getDescriptions(from));
        buffer.push(txt);
        txt.position.set(x,y);

        this.Influer.forEach((InfluerTrack,i) => {
            const sub = InfluerTrack.getDescriptions(this,buffer,x+35,y+35)
            if(i){ y+=sub.height };
        });
        if(!from){ // position des buffers
            txt.addChild(...buffer)
            gsap.fromTo(buffer, 1,{alpha:0}, {alpha:1, ease:Power1.easeOut,  
                stagger: { // wrap advanced options in an object
                each: 0.1,
              }})
            /*for (let i=0,x=0,y=0, l=buffer.length; i<l; i++) {
                const e = buffer[i];
                e.position.set(
                    e.parent?e.parent.x+35:0,y);
                y+=30;
            };*/
        }
        return txt;
    }
    //#endregion
}