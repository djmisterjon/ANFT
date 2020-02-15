/** kill a single tween by id
 * @param {string} id - string id of the tween animation.
 * @returns {Boolean} - return true if succeed.
 */
gsap.killTweenById  = function killTweenById (id=''){
    const tween = this.getById(id);
    if(tween){
         tween.kill();
         return true;
    }
    return false;
}


/**
 * Call une function avec un delay, avec un ID
 * @param {number} delay
 * @param {function|any} func
 * @param {string} id
 * @param {any} [context]
 * @memberof gsap
 */
gsap.TimeoutCallId = function TimeoutCallId(delay=1, func, id, context) {
    return gsap.to(func, {delay, id, onComplete:func, callbackScope:context});
}

/**
 * Call une function avec un delay, avec un ID
 * @param {number} delay
 * @param {function|any} func
 * @param {string} id
 * @param {any} [context]
 * @param {number} [Interval]
 * @memberof gsap
 */
gsap.IntervalCallId = function IntervalCallId(delay=1, func, id, context, Interval=1000) {
    function onTweenUpdate() {
         // i realy dont know what i can do here ?
         // for tell gsap to call the update based on ms interal (deltaTime) passed ? 
        //const delta = (Interval%~~this._tTime);//todo:
        //if(!delta){ func(this) }
        func(this)
    }
    return gsap.to({}, 1,{delay, id, onUpdate:onTweenUpdate, callbackScope:context, repeat:-1, });
}
