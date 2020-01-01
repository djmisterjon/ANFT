/*:
// PLUGIN □──────────────────────────────□AUDIO MANAGERS PIXI-SOUND□───────────────────────────────┐
* @author □ Jonathan Lepage (dimisterjon),(jonforum) 
* V.0.1a
* License:© M.I.T
└─────────────────────────────────────────────────────────────────────────────────────────┘
*/

/*
┌------------------------------------------------------------------------------┐
  GLOBAL $audio CLASS: _audio
  Controls Audios in game 
└------------------------------------------------------------------------------┘
*/
//$audio._sounds.TRA_A.play("TRA_A26")
//FIXME: SoundLibrary OR PIXI.sound need find the name space to extends proto
// PIXI.utils.mixins(PIXI.sound,)
/**@namespace  PIXI.sound*/
let $audio = PIXI.sound;

  PIXI.sound.initialize = function() {
    this.bgm = [];
    this.bgs = [];
    this.sfx = [];
    this.mfx = [];
    //this.volumeAll = 0; //! REMOVEME DEBUG

  };

  /** mix 2 instance */
  PIXI.sound.mix = function(a,b) {
    console.log(this);
  };

  /** mix 2 instance */
  PIXI.sound.tween = function(instance,tween) {
    console.log(this);
  };

  /** Play un audio, et register par type:[bgm]:BackgroundMusic, [bgs]:BackgroundSound, [sfx]:soundFX, [mfx]:musicFX  
  */
 PIXI.sound.playFrom = function(name,type,options) {
      const audio = this._sounds[name].play();
      if(options){
        Object.keys(options).forEach(key => {
          audio[key] = options[key];
        });
      }
      audio.name = audio;
      audio.chanelID = this[type].push(audio)-1;
      return audio;
  };

  /** Destroys all sounds from cache {keep perma}*/
  PIXI.sound.destroy = function(perma){
    Object.keys(this._sounds).forEach(name => {
        const s = this._sounds[name];
        if(!s._perma){ // TODO: PERMA FROM BOOT INITIALISE, SET NOT ENUMERABLE
          s.destroy();
          delete this._sounds[name];
        };
    });
    PIXI.sound.Sound._pool = [];
  };



