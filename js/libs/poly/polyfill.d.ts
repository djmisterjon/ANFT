

interface Number {
    /**
     * Return un nombre dont la valeur est limitée à la plage donnée.
     *
     * @method Number.prototype.clamp
     * @param {number} min La limite inférieure
     * @param {Number} max La limite superieur
     * @return {Number} A number in the range (min, max)
     */
    clamp(min: number, max: number) : Number;

    /**
     * Returns a modulo value which is always positive.
     *
     * @method Number.prototype.mod
     * @param {Number} n The divisor
     * @return {Number} A modulo value
     */
    mod(n: number) : Number;


    /**
     * Returns valeur arondie a 2 decimal seulement si besoin.
    */
    round2() : Number;
    
}

interface String {
/**
 * Checks whether the string contains a given string.
 *
 * @param {string} value The string to search for
 * @return {Boolean} True if the string contains a given string
 */
    contains(value: string) : Boolean;

/**
 * Return un integrity hash d'un string 32bit
 *
 * @return {Number} 32bit hash 
 */
    hashCode() : Number;
}
interface Array<T> {
    /**
     * Filter les valeur inique (duplicate) et renvoi un array
     *
     * @return {Array} Tableau avec des valeur unique
     */
    unique() : Array;

    /**
     * Trouve quantiter elements identique dans un array
     *
     * @param {any} value The array to compare to
     * @return {Number} Qty of elements founds
     */
    count(value: any) : Number;

/**
 * Compare si 2 array son identique
 *
 * @param {array} array The array to compare to
 * @return {Boolean} True if the two arrays are same
 */
    equals(array: array) : Boolean;

/**
 * Compare si 2 array son identique
 *
 * @param {any} value The array to compare to
 * @return {Boolean} True if the two arrays are same
 */
    contains(value: any) : Boolean;

/**
 * Supprimer une list d'arguments et renvoi this tableau
 *
* @param args A list of arguments the function accepts.
* @return {Array} renvoi un nouveau tableau avec les element suprimer
*/
    remove(...args: any) : Array<T>;

/**
 * Trouve l'index du premier element vide d'un tableau (undefined,null,false,0)
 *
* @return {Number} l'index du premier emplacement libre du tableau
*/
    findEmptyIndex() : Number;

    /**
     * return multiple splitted 2d with max item per array
     *
     * @param {Number} howMany Max items per 2d arrays
     * @return {Array} chunk arrays [[1,2],[3,4],[...]]
     */
    chunk(howMany: Number) : Number;
    
    /**
     * Addition tous les valeurs (number) et return total.
     * @return {Number} - valeur additionner
     */
    sum() : Number;

};//!end


interface Math {

    /**
     * Generates un nombre aleatoire comprit entre min et max, avec possibiliter de presision.
     *
     * @static
     * @param {Number} min une valeur negative permet
     * @param {Number} max 
     * @param {Number} precision 
     * @return {Number} A random integer
     */
    randomFrom(min:0,max:1,precision:0) : Number;

    
    /**
     * Effectu plusieur loop (test) de la luck/10 et return true, si un test est sous la valeur de succes%
     *
     * @static
     * @param {Number} luck nombre de loop, plus la luck est elever, plus ya de loop. ex: luck:12 = 1 loop, luck:36 = 3 loop
     * @param {Number} succes valeur % pour passer le test
     * @return {Number} A random integer
     */
    randomFromLuck(luck:number,succes:number) : Boolean;
    
    
}

//!PIXIJS
declare namespace PIXI {
    interface Container {
        /**
         * Scan les childrens, et stock leur reference avec leur nom dans un objet, si aucune nom, nest pas stocker.
         *
         * @return {Object} Qui contien les reference des children du container avec leur nom
         */
        childrenToName(): any;
        /** Asign un name pour childrenToName */
        setName(name: string): this;

    }

    interface DisplayObject {
        /**
         * Store tous les observable dans .zero
         *
         * @return {DisplayObject}
         */
        setZero(): Object;
    }

    interface ObservablePoint {
        /**
         * Store tous les observable dans .zero, si value, applique au observable
         *
         * @return {ObservablePoint}
         */
        setZero(x?: number, y?: number, z?: number): this;

        /**@type {Point} ObservablePoint cache*/
        zero: Point;
    }
    interface Point{
        /**
         * Store tous les observable dans .zero
         *
         * @return {ObservablePoint}
         */
        setZero(): this;

        /**@type {Point} ObservablePoint cache*/
        zero: Point;
    }
}
