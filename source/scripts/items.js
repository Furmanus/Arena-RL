define(['screen', 'map', 'use'], function(screen, map, use){
  
  //hash objects with defined properties, used in class constructor
  var weapons = {
  
    'dagger': {display: ')', fgColor: 'silver', bgColor: 'transparent', name: 'dagger', description: 'a dagger', type: 'weapons', slot: 'right hand', natural: false, damage: '1d4', critical: [19,20], dmgType: 'piercing', criticalMultiplier: 3, modifiers: null, criticalHit: ['bleeding']},
	
    'long sword': {display: ')', fgColor: 'silver', bgColor: 'transparent', name: 'long sword', description: 'a long sword', type: 'weapons', slot: 'right hand', natural: false,  damage: '1d8', critical: [19,20], dmgType: 'slashing', criticalMultiplier: 2, modifiers: null, criticalHit: ['bleeding']},
	
    'staff': {display: ')', fgColor: 'darkgoldenrod', bgColor: 'transparent', name: 'staff', description: 'a staff', type: 'weapons', slot: 'right hand', natural: false,  damage: '1d6', critical: [20], dmgType: 'bludgeoning', criticalMultiplier: 2, modifiers: null, criticalHit: ['prone']},
	
	'warhammer': {display: ')', fgColor: 'silver', bgColor: 'transparent', name: 'warhammer', description: 'a warhammer', type: 'weapons', slot: 'right hand', natural: false,  damage: '1d8', critical: [20], dmgType: 'bludgeoning', criticalMultiplier: 3, modifiers: null, criticalHit: ['stunned']}
  };
  
  var armours = {
	  
	'leather armour': {display: ']', fgColor: 'darkgoldenrod', bgColor: 'transparent', name: 'leather armour', description: 'a leather armour', type: 'armours', slot: 'torso', armourBonus: 2, maxDexBonus: 6, skillPenalty: 0, modifiers: {speed: 0}},
	
	'chain mail': {display: ']', fgColor: 'silver', bgColor: 'transparent', name: 'chain mail', description: 'a chain mail', type: 'armours', slot: 'torso', armourBonus: 5, maxDexBonus: 2, skillPenalty: -5, modifiers: {speed: -8}},
	
	'ring mail': {display: ']', fgColor: 'silver', bgColor: 'transparent', name: 'ring mail', description: 'a ring mail', type: 'armours', slot: 'torso', armourBonus: 3, maxDexBonus: 4, skillPenalty: -3, modifiers: {speed: -5}},
	
	'field plate': {display: ']', fgColor: 'silver', bgColor: 'transparent', name: 'field plate', description: 'a field plate', type: 'armours', slot: 'torso', armourBonus: 8, maxDexBonus: 0, skillPenalty: -7, modifiers: {speed: -12}}
  };

  var headwear = {

      'leather helm': {display: ']', fgColor: 'darkgoldenrod', bgColor: 'transparent', name: 'leather helm', description: 'a leather helm', type: 'helmets', slot: 'head', armourBonus: 1, skillPenalty: 0, modifiers: {speed: 0}},

      'chain choif': {display: ']', fgColor: 'silver', bgColor: 'transparent', name: 'chain choif', description: 'a chain choif', type: 'helmets', slot: 'head', armourBonus: 2, skillPenalty: 0, modifiers: {speed: 0}},

      'plate helmet': {display: ']', fgColor: 'silver', bgColor: 'transparent', name: 'plate helmet', description: 'a plate helmet', type: 'helmets', slot: 'head', armourBonus: 3, skillPenalty: 0, modifiers: {speed: -1}},
  };

  var legs = {

      'leather leggings': {display: ']', fgColor: 'darkgoldenrod', bgColor: 'transparent', name: 'leather leggings', description: 'a leather leggings', type: 'legs', slot: 'legs', armourBonus: 1, skillPenalty: 0, modifiers: {speed: 0}},

      'chain leggings': {display: ']', fgColor: 'silver', bgColor: 'transparent', name: 'chain leggings', description: 'a chain leggings', type: 'legs', slot: 'legs', armourBonus: 2, skillPenalty: -1, modifiers: {speed: -2}},

      'plate leggings': {display: ']', fgColor: 'silver', bgColor: 'transparent', name: 'plate leggings', description: 'a plate leggings', type: 'legs', slot: 'legs', armourBonus: 4, skillPenalty: -3, modifiers: {speed: -5}},
  };

  var boots = {

      'leather boots': {display: ']', fgColor: 'darkgoldenrod', bgColor: 'transparent', name: 'leather boots', description: 'a leather boots', type: 'boots', slot: 'feet', armourBonus: 0, skillPenalty: 0, modifiers: {speed: 0}},

      'chain boots': {display: ']', fgColor: 'silver', bgColor: 'transparent', name: 'chain boots', description: 'a chain boots', type: 'boots', slot: 'feet', armourBonus: 1, skillPenalty: 0, modifiers: {speed: 0}},

      'plate boots': {display: ']', fgColor: 'silver', bgColor: 'transparent', name: 'plate boots', description: 'a plate boots', type: 'boots', slot: 'feet', armourBonus: 2, skillPenalty: -2, modifiers: {speed: -2}},
  };
  
  var scrolls = {
	  
	'teleportation': {display: '?', fgColor: 'white', bgColor: 'transparent', name: 'teleportation scroll', description: 'a teleportation scroll', type: 'scrolls', key: 'teleportation', group: 'escape'}
  };
  
  var potions = {
	  
	  'speed': {display: '!', fgColor: 'red', bgColor: 'transparent', name: 'speed potion', description: 'a speed potion', type: 'potions', key: 'speed', group: 'boost'}
  };

  var misc = {

      'torch': {display: '[', fgColor: 'darkgoldenrod', bgColor: 'transparent', name: 'torch', description: 'a torch', type: 'miscellaneous', slot: 'left hand', modifiers: null}
  };

  var bodies = {

      'rat': {display: '%', fgColor: 'darkgoldenrod', bgColor: 'transparent', name: 'rat corpse', description: 'a rat corpse', type: 'corpse'},
      'snake': {display: '%', fgColor: 'lightgreen', bgColor: 'transparent', name: 'snake corpse', description: 'a snake corpse', type: 'corpse'},
      'wolf': {display: '%', fgColor: 'silver', bgColor: 'transparent', name: 'wolf corpse', description: 'a wolf corpse', type: 'corpse'},
      'raven': {display: '%', fgColor: 'rgb(51,51,51)', bgColor: 'transparent', name: 'raven corpse', description: 'a raven corpse', type: 'corpse'},
      'kobold': {display: '%', fgColor: 'green', bgColor: 'transparent', name: 'kobold corpse', description: 'a kobold corpse', type: 'corpse'}
  }
  
  class Weapon{
    
    constructor(type, object){

      this.owner = object;
      this.display = weapons[type].display;
      this.fgColor = weapons[type].fgColor;
      this.bgColor = weapons[type].bgColor;
      this.name = weapons[type].name;
      this.description = weapons[type].description;
	  this.type = weapons[type].type;
      this.natural = weapons[type].natural;
      this.damage = weapons[type].damage;
      this.critical = weapons[type].critical;
      this.dmgType = weapons[type].dmgType;
      this.criticalMultiplier = weapons[type].criticalMultiplier;
	  this.modifiers = weapons[type].modifiers;
	  this.slot = weapons[type].slot;
      this.criticalHit = weapons[type].criticalHit;
      
      object.inventory.push(this);
    }
  }
  
  class Armour{
    
    constructor(type, object){

      this.owner = object;
      this.display = armours[type].display;
      this.fgColor = armours[type].fgColor;
      this.bgColor = armours[type].bgColor;
      this.name = armours[type].name;
      this.description = armours[type].description;
	  this.type = armours[type].type;
	  this.armourBonus = armours[type].armourBonus;
	  this.skillPenalty = armours[type].skillPenalty;
	  this.modifiers = armours[type].modifiers;
	  this.slot = armours[type].slot;
      this.maxDexBonus = armours[type].maxDexBonus;
      
      object.inventory.push(this);
    }
  }
  
  class Scroll{
	  
	  constructor(type, object){

      this.owner = object;
      this.display = scrolls[type].display;
      this.fgColor = scrolls[type].fgColor;
      this.bgColor = scrolls[type].bgColor;
      this.name = scrolls[type].name;
      this.description = scrolls[type].description;
	  this.type = scrolls[type].type;
	  this.useEffect = use.use.scrolls[scrolls[type].key];
      
      object.inventory.push(this);
    }
  }
  
  class Potion{
	  
	  constructor(type, object){

      this.owner = object;
      this.display = potions[type].display;
      this.fgColor = potions[type].fgColor;
      this.bgColor = potions[type].bgColor;
      this.name = potions[type].name;
      this.description = potions[type].description;
	  this.type = potions[type].type;
	  this.useEffect = use.use.potions[potions[type].key];
      
      object.inventory.push(this);
    }
  }

  class Misc{

      constructor(type, object){

          this.owner = object;
          this.display = misc[type].display;
          this.fgColor = misc[type].fgColor;
          this.bgColor = misc[type].bgColor;
          this.name = misc[type].name;
          this.description = misc[type].description;
          this.type = misc[type].type;
		  this.modifiers = misc[type].modifiers;
		  this.slot = misc[type].slot;

          object.inventory.push(this);
      }
  }

    class Helmet{

        constructor(type, object){

            this.owner = object;
            this.display = headwear[type].display;
            this.fgColor = headwear[type].fgColor;
            this.bgColor = headwear[type].bgColor;
            this.name = headwear[type].name;
            this.description = headwear[type].description;
            this.type = headwear[type].type;
			this.armourBonus = headwear[type].armourBonus;
			this.skillPenalty = headwear[type].skillPenalty;
			this.modifiers = headwear[type].modifiers;
			this.slot = headwear[type].slot;

            object.inventory.push(this);
        }
    }

    class Legs{

        constructor(type, object){

            this.owner = object;
            this.display = legs[type].display;
            this.fgColor = legs[type].fgColor;
            this.bgColor = legs[type].bgColor;
            this.name = legs[type].name;
            this.description = legs[type].description;
            this.type = legs[type].type;
			this.armourBonus = legs[type].armourBonus;
			this.skillPenalty = legs[type].skillPenalty;
			this.modifiers = legs[type].modifiers;
			this.slot = legs[type].slot;

            object.inventory.push(this);
        }
    }

    class Boots{

        constructor(type, object){

            this.owner = object;
            this.display = boots[type].display;
            this.fgColor = boots[type].fgColor;
            this.bgColor = boots[type].bgColor;
            this.name = boots[type].name;
            this.description = boots[type].description;
            this.type = boots[type].type;
			this.armourBonus = boots[type].armourBonus;
			this.skillPenalty = boots[type].skillPenalty;
			this.modifiers = boots[type].modifiers;
			this.slot = boots[type].slot;

            object.inventory.push(this);
        }
    }

    class Corpse{

        constructor(type, object){

            this.owner = object; //object (entity, map cell) where currently object is
            this.level = object.position.level;
            this.display = bodies[type].display;
            this.fgColor = bodies[type].fgColor;
            this.bgColor = bodies[type].bgColor;
            this.name = bodies[type].name;
            this.description = bodies[type].description;
            this.type = bodies[type].type;
            //for corpse decay
            this.speed = 30;
            this.counter = 0;
            this.counterLimit = ROT.RNG.getUniformInt(40, 60);

            object.inventory.push(this);
            map.cells[this.level].time.scheduler.add(this, true);
        }

        getSpeed(){

            return this.speed;
        }

        act(){
            //DO POPRAWIENIA - kod na decay nie działa po zmianie poziomów
            if(this.level !== this.owner.position.level){

                map.cells[this.level].time.scheduler.remove(this);
                this.level = this.owner.position.level;
                map.cells[this.level].time.scheduler.add(this, true);
            }

            this.counter++;

            if(this.counter > this.counterLimit){

                //placeVisibleMessage o remove
                map.cells[this.level].time.scheduler.remove(this);
                this.owner.inventory.splice(this.owner.inventory.indexOf(this), 1);
            }
        }
    }
  
  return {
    
    Weapon: Weapon,
	Armour: Armour,
	Scroll: Scroll,
	Potion: Potion,
    Helmet: Helmet,
    Legs: Legs,
    Boots: Boots,
    Misc: Misc,
    Corpse: Corpse
  }
});

/*
Useful UNICODE symbols:

\u26A1 - lighting
\u2301 - vertical lighting
\u2313 - cap
\u2314 - gem
\u2695 - staff
\u2625 - ankh
\u266F - grate
\u2670 - cross
\u2690 - flag
\u26C6 - raindrops
\u26CF - pick axe
\u26EA - church
\u26EB - building
\u26F5 - boat
\u23F8 - leggings
\u238E - scroll alternative
\u4E1B - overland forest

 ᇫ - helmet
 ᘃ - street lamp
 ᘃ - trident
 ᘃ - table
 ᚘ - seat/chair
 ᚘ - key
 ᚘ - hammer
 ᚘ - amulet
 ᚘ - wave
 ⏦ - scroll
 ▦ - grate
 ⌗ - grate 2
 ᛍ - candle
 ◫ - chest of drawers
 ⌹ - cabinet
 ⍾ - mushrooms
 ⎈ - web
 ᛤ - campfire
 ᖼ - flail
 ϯ - sword
*/