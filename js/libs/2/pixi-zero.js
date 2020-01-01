


PIXI.DisplayObject.prototype.setZero = function setZero() {
    this.zero = this.zero || {}; // need point if not exist
    Object.defineProperty(this, 'zero', { enumerable:false }); //TODO: je pense quil faut pas etre enumerable, voir si bug?
    this.zero.position = this.position.clone();
    this.zero.pivot    = this.pivot   .clone();
    this.zero.scale    = this.scale   .clone();
    this.zero.skew     = this.skew    .clone();
    this.zero.rotation = this.rotation;
    this.zero.alpha = this.alpha;
    this.zero.tint = this.tint;
    return this;
};

PIXI.ObservablePoint.prototype.setZero = function setZero(x,y,z) {
    arguments.length && this.set(...arguments);
    Object.defineProperty(this, 'zero', { enumerable:false, value: this.clone() });
    return this;
}
