define(['screen', 'map'], function(screen, map){
  
  //hash objects with defined properties, used in class constructor
  var weapons = {
  
    'dagger': {display: ')', fgColor: 'silver', bgColor: 'transparent', name: 'dagger', description: 'a dagger', type: 'weapons'},
	
    'long sword': {display: ')', fgColor: 'silver', bgColor: 'transparent', name: 'long sword', description: 'a long sword', type: 'weapons'},
	
    'staff': {display: ')', fgColor: 'darkgoldenrod', bgColor: 'transparent', name: 'staff', description: 'a staff', type: 'weapons'},
	
	'warhammer': {display: ')', fgColor: 'silver', bgColor: 'transparent', name: 'warhammer', description: 'a warhammer', type: 'weapons'}
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

      'leather leggings': {display: '\u23F8', fgColor: 'darkgoldenrod', bgColor: 'transparent', name: 'leather leggings', description: 'a leather leggings', type: 'legs'},

      'chain leggings': {display: '\u23F8', fgColor: 'silver', bgColor: 'transparent', name: 'chain leggings', description: 'a chain leggings', type: 'legs'},

      'plate leggings': {display: '\u23F8', fgColor: 'silver', bgColor: 'transparent', name: 'plate leggings', description: 'a plate leggings', type: 'legs'},
  };

  var boots = {

      'leather boots': {display: '{', fgColor: 'darkgoldenrod', bgColor: 'transparent', name: 'leather boots', description: 'a leather boots', type: 'boots'},

      'chain boots': {display: '{', fgColor: 'silver', bgColor: 'transparent', name: 'chain boots', description: 'a chain boots', type: 'boots'},

      'plate boots': {display: '{', fgColor: 'silver', bgColor: 'transparent', name: 'plate boots', description: 'a plate boots', type: 'boots'},
  };
  
  var scrolls = {
	  
	'teleportation': {display: '\u238E', fgColor: 'white', bgColor: 'transparent', name: 'teleportation scroll', description: 'a teleportation scroll', type: 'scrolls'}
  };
  
  var potions = {
	  
	  'speed': {display: '!', fgColor: 'red', bgColor: 'transparent', name: 'speed potion', description: 'a speed potion', type: 'potions'}
  };

  var misc = {

      'torch': {display: '\u26B5', fgColor: 'darkgoldenrod', bgColor: 'transparent', name: 'torch', description: 'a torch', type: 'miscellaneous'}
  };
  
  class Weapon{
    
    constructor(type, object){
      
      this.display = weapons[type].display;
      this.fgColor = weapons[type].fgColor;
      this.bgColor = weapons[type].bgColor;
      this.name = weapons[type].name;
      this.description = weapons[type].description;
	  this.type = weapons[type].type;
      
      object.inventory.push(this);
    }
  }
  
  class Armour{
    
    constructor(type, object){
      
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
      
      this.display = scrolls[type].display;
      this.fgColor = scrolls[type].fgColor;
      this.bgColor = scrolls[type].bgColor;
      this.name = scrolls[type].name;
      this.description = scrolls[type].description;
	  this.type = scrolls[type].type;
      
      object.inventory.push(this);
    }
  }
  
  class Potion{
	  
	  constructor(type, object){
      
      this.display = potions[type].display;
      this.fgColor = potions[type].fgColor;
      this.bgColor = potions[type].bgColor;
      this.name = potions[type].name;
      this.description = potions[type].description;
	  this.type = potions[type].type;
      
      object.inventory.push(this);
    }
  }

  class Misc{

      constructor(type, object){

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

            this.display = boots[type].display;
            this.fgColor = boots[type].fgColor;
            this.bgColor = boots[type].bgColor;
            this.name = boots[type].name;
            this.description = boots[type].description;
            this.type = boots[type].type;

            object.inventory.push(this);
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
    Misc: Misc
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