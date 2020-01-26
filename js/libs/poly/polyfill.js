//=============================================================================
// hack JsExtensions snippet polyfill to class
//=============================================================================
// see: C:\Users\InformatiqueLepage\AppData\Local\Programs\Microsoft VS Code\resources\app\extensions\node_modules\typescript\lib\lib.es5.d.ts
// C:\Users\InformatiqueLepage\Documents\Dev\anft_1.6.1\js\index.d.ts

//#NUMBER

Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};
Object.defineProperty(Number.prototype, 'clamp',{enumerable:false})

    Number.prototype.mod = function(n) {
        return ((this % n) + n) % n;
    };
Object.defineProperty(Number.prototype, 'mod',{enumerable:false})

Number.prototype.round2 = function() {
    return Math.round(this * 100)/100
};
Object.defineProperty(Number.prototype, 'round2',{enumerable:false})


    //#STRING
    String.prototype.contains = function(value) {
        return this.indexOf(value) >= 0;
    };
Object.defineProperty(String.prototype, 'contains',{enumerable:false})


    String.prototype.hashCode = function() {
        var hash = 0, i, chr;
        if (this.length === 0) return hash;
        for (i = 0; i < this.length; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
        }
        return hash;
    };
Object.defineProperty(String.prototype, 'hashCode',{enumerable:false})


//#ARRAY
//TODO: TOUS REFAIRE COMMECA ! 
    Array.prototype.unique = function () {
        return this.filter((v, i, s) =>  {
            return s.indexOf(v) === i;
         });
    };
    Object.defineProperty(Array.prototype, 'unique',{enumerable:false});

    Array.prototype.count = function (value) {
        let count = 0;
        for (let i=0, l=this.length; i<l; i++) {
            this[i] === value && (count+=1);
        };
        return count;
    };
    Object.defineProperty(Array.prototype, 'count',{enumerable:false});


    Array.prototype.equals = function (other, callback = (x, y) => (x === y)) {
        // Check the other object is of the same type
        if (this.length === other.length) {
            return this.every((x, i) => callback(x, other[i]));
        }
        return false;
        
    };
    Object.defineProperty(Array.prototype, 'equals',{enumerable:false})


    Array.prototype.contains = function (element) {
        return this.indexOf(element) >= 0;
    };
    Object.defineProperty(Array.prototype, 'contains',{enumerable:false})

    Array.prototype.remove = function () {
        let what;
        let a = arguments;
        let L = a.length
        let ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        };
        return this;
    };
Object.defineProperty(Array.prototype, 'remove',{enumerable:false})

    Array.prototype.findEmptyIndex = function() {
        for (let i=0, l=this.length+1; i<l; i++) {
            if(!this[i]){return i};
        };
    };
Object.defineProperty(Array.prototype, 'findEmptyIndex',{enumerable:false})

    Array.prototype.sum = function() {
        let value = Number.isInteger(this[0])?0:"";
        for (let i=0, l=this.length; i<l; i++) {
            value+=this[i]||0;
        };
        return value;
    };
Object.defineProperty(Array.prototype, 'sum',{enumerable:false})


    Array.prototype.chunk = function(howMany) {
        let chunkarr = [], 
        i = 0, 
        n = this.length; 
    
        while (i < n) { 
        chunkarr.push(this.slice(i, i += howMany)); 
        } 
    
        return chunkarr;
    }
  Object.defineProperty(Array.prototype, 'chunk',{enumerable:false})

//#MATH
    Math.randomFrom = function(min=0,max=1,precision=0) 
    {   
        const ranNeg = min<0? (min*=-1) && this.random() >= 0.5 && 1 || -1  : 1;
        return precision? parseFloat(Math.min(min + (Math.random() * (max - min)),max).toFixed(precision))*ranNeg : ~~(Math.random()*(max-min+1)+min)*ranNeg;
    }
Object.defineProperty(Math, 'randomFrom',{enumerable:false})

    Math.randomFromLuck = function(luck,succes) // min and max included
    {   
        const rate = luck/10; // ex: lck:20 => 2;
        for (let i=0, l=luck/10; i<l; i++) {
            const test = this.randomFrom(0,100);
            if(test<succes){return true};
        };
        return false;
    }
Object.defineProperty(Math, 'randomFromLuck',{enumerable:false})






//! PIXIJS

PIXI.Container.prototype.childrenToName = function childrenToName()
{
    const Child = {};
    const bufferNames = []; // names buffer for check existe instead hasOwnProperty _child.name
    const pool = [this.children];
    if(this.name){
        (Child[this.name] = this);//if parent source tree have name, take it
    }
    let childrens; // childrens array
    while (childrens = pool.shift()) {
        for (let i=0, l=childrens.length; i<l; i++) {
            const _child = childrens[i];
            const childName = _child.name;
            if(childName){ // if the Child have .name?
                if( bufferNames.indexOf(childName)>-1 ){ // if name alrealy exist in buffer, make array []
                    Child[childName].length? Child[childName].push(_child) : Child[childName] = [Child[childName],_child];
                }else{ // if name not exist , registerer
                    bufferNames.push(childName)
                    Child[childName] = _child; // register objet with name and reference
                };
                !_child.child && _child.children.length && pool.push(_child.children); // if the _child not have .child and have childrens? push in pool
            };
        };
    };
    return Child;
};
Object.defineProperty(PIXI.Container.prototype, 'childrenToName',{enumerable:false})


PIXI.Container.prototype.setName = function setName(name){
    this.name = name;
    return this;
};
Object.defineProperty(PIXI.Container.prototype, 'setName',{enumerable:false})