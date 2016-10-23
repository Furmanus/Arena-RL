define(['screen', 'map', 'use'], function(screen, map, use){
  
  //hash objects with defined properties, used in class constructor
  var weapons = {
  
    'dagger': {display: ')', fgColor: 'silver', bgColor: 'transparent', name: 'dagger', description: 'a dagger', type: 'weapons', natural: false, damage: '1d4', critical: [19,20], dmgType: 'piercing', criticalMultiplier: 3},
	
    'long sword': {display: ')', fgColor: 'silver', bgColor: 'transparent', name: 'long sword', description: 'a long sword', type: 'weapons', natural: false,  damage: '1d8', critical: [19,20], dmgType: 'slashing', criticalMultiplier: 2},
	
    'staff': {display: ')', fgColor: 'darkgoldenrod', bgColor: 'transparent', name: 'staff', description: 'a staff', type: 'weapons', natural: false,  damage: '1d6', critical: [20], dmgType: 'bludgeoning', criticalMultiplier: 2},
	
	'warhammer': {display: ')', fgColor: 'silver', bgColor: 'transparent', name: 'warhammer', description: 'a warhammer', type: 'weapons', natural: false,  damage: '1d8', critical: [20], dmgType: 'bludgeoning', criticalMultiplier: 3}
  };
  
  var armours = {
	  
	'leather armour': {display: ']', fgColor: 'darkgoldenrod', bgColor: 'transparent', name: 'leather armour', description: 'a leather armour', type: 'armours'},
	
	'chain mail': {display: ']', fgColor: 'silver', bgColor: 'transparent', name: 'chain mail', description: 'a chain mail', type: 'armours'},
	
	'ring mail': {display: ']', fgColor: 'silver', bgColor: 'transparent', name: 'ring mail', description: 'a ring mail', type: 'armours'},
	
	'field plate': {display: ']', fgColor: 'silver', bgColor: 'transparent', name: 'field plate', description: 'a field plate', type: 'armours'}
  };

  var headwear = {

      'leather helm': {display: '\u2313', fgColor: 'darkgoldenrod', bgColor: 'transparent', name: 'leather helm', description: 'a leather helm', type: 'helmets'},

      'chain choif': {display: '\u2313', fgColor: 'silver', bgColor: 'transparent', name: 'chain choif', description: 'a chain choif', type: 'helmets'},

      'plate helmet': {display: '\u2313', fgColor: 'silver', bgColor: 'transparent', name: 'plate helmet', description: 'a plate helmet', type: 'helmets'},
  };

  var legs = {

      'leather leggings': {display: ']', fgColor: 'darkgoldenrod', bgColor: 'transparent', name: 'leather leggings', description: 'a leather leggings', type: 'legs'},

      'chain leggings': {display: ']', fgColor: 'silver', bgColor: 'transparent', name: 'chain leggings', description: 'a chain leggings', type: 'legs'},

      'plate leggings': {display: ']', fgColor: 'silver', bgColor: 'transparent', name: 'plate leggings', description: 'a plate leggings', type: 'legs'},
  };

  var boots = {

      'leather boots': {display: '{', fgColor: 'darkgoldenrod', bgColor: 'transparent', name: 'leather boots', description: 'a leather boots', type: 'boots'},

      'chain boots': {display: '{', fgColor: 'silver', bgColor: 'transparent', name: 'chain boots', description: 'a chain boots', type: 'boots'},

      'plate boots': {display: '{', fgColor: 'silver', bgColor: 'transparent', name: 'plate boots', description: 'a plate boots', type: 'boots'},
  };
  
  var scrolls = {
	  
	'teleportation': {display: '?', fgColor: 'white', bgColor: 'transparent', name: 'teleportation scroll', description: 'a teleportation scroll', type: 'scrolls', key: 'teleportation'}
  };
  
  var potions = {
	  
	  'speed': {display: '!', fgColor: 'red', bgColor: 'transparent', name: 'speed potion', description: 'a speed potion', type: 'potions', key: 'speed'}
  };

  var misc = {

      'torch': {display: '\u00A1', fgColor: 'darkgoldenrod', bgColor: 'transparent', name: 'torch', description: 'a torch', type: 'miscellaneous'}
  };

  var bodies = {

      'rat': {display: '%', fgColor: 'darkgoldenrod', bgColor: 'transparent', name: 'rat corpse', description: 'a rat corpse', type: 'corpse'}
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