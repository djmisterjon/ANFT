
/**
    * @typedef  {Object} ExcelDataMonster - Excel data
    * @property {{_game_id:Array,_master_rate:Array,_default_heigth:array}                 } ExcelDataMonster.info          - Excel data
    * @property { Array   .<{allow,combat_base,IA,IA_master}>                       } ExcelDataMonster.combatActions - Excel data
    * @property { Array   .<{hp,mp,hg,hy,atk,def,lck,int,sta,expl,mor,ccrt,ceva,xp}>} ExcelDataMonster.statesBase    - Excel data
    * @property { Array   .<{itemId,max,min,rate,rate_master}>                      } ExcelDataMonster.itemsDrops    - Excel data
    * @property { Array   .<{'g-0','g-1','g-2','g-3','g-4','g-5','g-6',PlanetsID}>  } ExcelDataMonster.planetsSpawn  - Excel data
    * @property {{fo_base :[],fo_master:[],po_base:[],po_master:[]}                 } ExcelDataMonster.orbsSynegies  - Excel data
    * @property { Array   .<{itemId,rate,rate_master}>                              } ExcelDataMonster.gemImunity    - Excel data
    * @property { Array   .<{rate,rate_master,statusId}>                            } ExcelDataMonster.statusImunity - Excel data
    * @property { Array   .<{itemId,rate,rate_master}>                              } ExcelDataMonster.alimentations - Excel data
    * @property { Array   .<{capacity,min_lv,rate,rate_master}>                     } ExcelDataMonster.capacity      - Excel data
    * */

/** Data structurer et lisble pour construire un monster
 * Peut etre manipuler durant le jeux
 */
class _DataBattlers {
    //#region [Static]
    /** @type {Array.<_DataBattlers>} POOL de tous les dataMonster existant*/
    static POOL = [];
    /** generer un monster battler et sauvegarde ces data 
     * @param {number} id - monsterId 'm'+n
     * @param {number} level - min level
     * @param {number} master - si sayen
    */
    static generate(id,level=1,master=false){ //TODO: MAP INFLUENCE
        const data = $loader.DATA.base['m'+id];
        if(data){
            const DataMonsters = new _DataBattlers('m'+id,level,master);
            this.POOL.push(DataMonsters);
            return DataMonsters;
        }else{
            throw 'error data EXCEL, les data existe pas ou sont corromput'
        }
    }
    
    //#endregion
    
    /**
     *Creates an DATA instance of battlers.
     * @param {*} dataBaseName
     * @param {*} level
     * @param {*} master
     */
    constructor(dataBaseName,level,master) {
        /** monster data Id */
        this._dataBaseName = dataBaseName;
        /** Level actuel */
        this._level = level;
        /** Ces un epic master sayen */
        this._master = master;
        this.initialize();
    }
    //#region [GetterSetter]
    /**@returns {ExcelDataMonster} -DATA Excel from loader */
    get DATAEXCEL() {
        return $loader.DATA.base[this._dataBaseName];
    }
    get defaultHeight() {
        return this.DATAEXCEL.info._default_heigth
    }
    //#endregion
    //#region [Initialize]
    initialize() {
        /** pre calcule les aleatoires */
        this.combatActions = this.initialize_info ();
        this.combatActions = this.initialize_combatActions ();
        this.itemsDrops    = this.initialize_itemsDrops    ();
        this.capacity      = this.initialize_capacity      ();
        this.gemImunity    = this.initialize_gemImunity    ();
        this.statusImunity = this.initialize_statusImunity ();
        this.alimentations = this.initialize_alimentations ();
        this.orbsSynegies  = this.initialize_orbsSynegies  ();
    }

    initialize_info(){
        const info = this.DATAEXCEL.info;
        this._defaultHeight = info._default_heigth;
    }
    initialize_combatActions(){
        const combatActions = this.DATAEXCEL.combatActions;
        const ca = {};
        combatActions.forEach(element => {
            element.allow && (ca[element.combat_base] = element.IA);
        });
        return ca;
    }

    initialize_itemsDrops(){
        const itemsDrops = this.DATAEXCEL.itemsDrops;
        const items = [];
        for (let i=0, l=itemsDrops.length; i<l; i++) {
            const content = itemsDrops[i];
            if(content){
                // ["itemId", "min", "max", "rate", "rate_master"]
                //TODO: randomFromTo : loop avec un rate + playerluck ..
                items.push({[content.itemId]: Math.randomFrom(content.min,content.max) });
            };
        };
        return items;
    }

    initialize_capacity(){
        const capacity = this.DATAEXCEL.capacity;
        const capacities = [];
        for (let i=0, l=capacity.length; i<l; i++) {
            const content = capacity[i];
            if(content){
                if( this._level>=content.min_lv ){
                    (Math.random()<=content.rate) && capacities.push(content.capacity); // todo: new capacity() car on veut garder les data permanet
                }
            }
        };
        return capacities;
    };

    /** heritage des gem imunnity, elle reduisent les degat de 50% */
    initialize_gemImunity(){
        const gemImunity = this.DATAEXCEL.gemImunity;
        const gemImunities = [];
        for (let i=0, l=gemImunity.length; i<l; i++) {
            const content = gemImunity[i].length && gemImunity[i];
            if(content){
                (Math.random()<=content.rate) && gemImunities.push(content.itemId);
            }
        };
        return gemImunities;
    };

    /** heritage des immunity de status */
    initialize_statusImunity(){
        const statusImunity = this.DATAEXCEL.statusImunity;
        const statusImu = [];
        for (let i=0, l=statusImunity.length; i<l; i++) {
            const content = statusImunity[i];
            if(content){
                (Math.random()<=content.rate) && statusImu.push(content.statusId);
            }
        };
        return statusImu;
    };

    /** alimentations preferer de la creature */
    initialize_alimentations(){
        const alimentations = this.DATAEXCEL.alimentations;
        const aliment = [];
        for (let i=1, l=alimentations.length; i<l; i++) {
            const content = alimentations[i].length && alimentations[i];
            if(content){
                (Math.random()<=content.rate) && aliment.push(content.itemId);
            }
        };
        return aliment;
    };

    /** prepare les data  synergie */
    initialize_orbsSynegies(){
        const orbsSynegies = this.DATAEXCEL.orbsSynegies;
        return {faiblesseOrbic:orbsSynegies.fo_base,puissanceOrbic:orbsSynegies.po_base};
    };
    //#endregion

}