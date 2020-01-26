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

