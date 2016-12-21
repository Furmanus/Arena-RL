/**
 * Created by Furman on 16.10.2016.
 */

/*
module for use/equip effects function for items used inside items module
 */

define(['screen', 'map', 'combat'], function(screen, map, combat){

   var equip = {

      'misc': {

         'torch': lightTorch
      }
   };
   
   var use = {
	   
	   'potions': {
		   
		   'speed': speedPotion,
		   'healing': healingPotion,
		   'rejuvenation': rejuvenationPotion,
		   'might': mightPotion,
		   'agility': agilityPotion,
           'heroism': heroismPotion,
           'rage': ragePotion
	   },
	   
	   'scrolls':{
		   
		   'teleportation': teleportScroll,
           'blink': blinkScroll,
           'armour': armourScroll
	   }
   }

   function lightTorch(item, entity, action){
		//DO ZROBIENIA
	   screen.placeMessage('You light the torch.');
   }
   
   function speedPotion(item, entity){

	   var wearOffText = screen.capitalizeString(screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' are ' : ' is ') + ' no longer moving faster.',
		   useText = screen.capitalizeString(screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' quaff' : ' quaffs') + ' a speed potion. Suddenly ' + (screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' are moving faster!' : ' is moving faster!');

	   entity.modifiers.push({type: [{stat: 'speed', value: 40}], counter: 15, applied: false, useText: useText, wearOffText: wearOffText});

	   if(entity.type.type !== 'player'){

		   entity.inventory.splice(entity.inventory.indexOf(item), 1);
	   }
   }

   function ragePotion(item, entity){

       var modifiedSpeed = Math.floor(entity.stats.speed * 0.5);

       var wearOffText = screen.capitalizeString(screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' calm down.' : ' calms down.'),
           useText = screen.capitalizeString(screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' quaff' : ' quaffs') + ' a rage potion.';

       screen.placeVisibleMessage(useText, map.cells[entity.position.level][entity.position.x][entity.position.y]);

       entity.status.berserk.initEffect(entity);

       if(entity.type.type !== 'player'){

           entity.inventory.splice(entity.inventory.indexOf(item), 1);
       }
   }

   function heroismPotion(item, entity){

       var wearOffText = screen.capitalizeString(screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' feel your unnatural combat skills came back to normal.' : ' looks weaker.'),
           useText = screen.capitalizeString(screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' quaff' : ' quaffs') + ' a heroism potion. ' + screen.capitalizeString(screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' feel your combat skills has been greatly enchanted!' : ' looks stronger and more proficient with its combat skills!');

       entity.modifiers.push({type: [{stat: 'strength', value: 2}, {stat: 'dexterity', value: 2}, {stat: 'baseAttackBonus', value: 3}, {stat: 'defense', value: 2}], counter: 24, applied: false, useText: useText, wearOffText: wearOffText});

       if(entity.type.type !== 'player'){

           entity.inventory.splice(entity.inventory.indexOf(item), 1);
       }
   }

   function mightPotion(item, entity){

	   var wearOffText = screen.capitalizeString(screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' feel ' : ' looks ') + ' weaker.',
		   useText = screen.capitalizeString(screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' quaff' : ' quaffs') + ' a might potion. Suddenly ' + (screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' feel mighty!' : ' looks mighty!');

	   entity.modifiers.push({type: [{stat: 'strength', value: 5}], counter: 24, applied: false, useText: useText, wearOffText: wearOffText});

	   if(entity.type.type !== 'player'){

		   entity.inventory.splice(entity.inventory.indexOf(item), 1);
	   }
   }

   function agilityPotion(item, entity){

	   var wearOffText = screen.capitalizeString(screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' feel ' : ' looks ') + ' less agile.',
		   useText = screen.capitalizeString(screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' quaff' : ' quaffs') + ' an agility potion. Suddenly ' + (screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' feel agile!' : ' looks more agile!');

	   entity.modifiers.push({type: [{stat: 'dexterity', value: 5}], counter: 24, applied: false, useText: useText, wearOffText: wearOffText});

	   if(entity.type.type !== 'player'){

		   entity.inventory.splice(entity.inventory.indexOf(item), 1);
	   }
   }

   function healingPotion(item, entity){

	   if(entity.hp === entity.maxHp){

           useText = screen.capitalizeString(screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' drink ' : ' drinks ') + item.description + '. Nothing seems to happen.';
	   }else {

           entity.hp += combat.calc('1d8');

           if (entity.hp >= entity.maxHp) {

               entity.hp = entity.maxHp;

               useText = screen.capitalizeString(screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' drink ' : ' drinks ') + item.description + '. ' + screen.capitalizeString(screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' feel better.' : ' looks better.');
           } else {

               useText = screen.capitalizeString(screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' drink ' : ' drinks ') + item.description + '. ' + screen.capitalizeString(screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' feel better.' : ' looks better.');
           }
       }

	   screen.placeVisibleMessage(useText, map.cells[entity.position.level][entity.position.x][entity.position.y]);

	   if(entity.type.type !== 'player'){

		   entity.inventory.splice(entity.inventory.indexOf(item), 1);
	   }else{

		   entity.updateScreenStats();
	   }
   }

   function rejuvenationPotion(item, entity){

	   if(entity.hp < entity.maxHp){

		   entity.hp = entity.maxHp;
		   useText = screen.capitalizeString(screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' drink ' : ' drinks ') + item.description + '. ' + screen.capitalizeString(screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' are completly healed.' : ' looks completly healed.');
	   }else{

		   useText = screen.capitalizeString(screen.removeFirst(entity.type.name)) + (entity.type.type === 'player' ? ' drink ' : ' drinks ') + item.description + '. Nothing seems to happen.';
	   }

	   screen.placeVisibleMessage(useText, map.cells[entity.position.level][entity.position.x][entity.position.y]);

	   if(entity.type.type !== 'player'){

		   entity.inventory.splice(entity.inventory.indexOf(item), 1);
	   }
   }

   function armourScroll(item, entity){

       var useText = screen.capitalizeString(entity.type.messageDisplay) + (entity.type.type === 'player' ? ' read ' : ' reads ') + item.description + '. ' + (screen.capitalizeString(entity.type.messageDisplay) + ' body is covered by light green arcane light.'),
           wearOffText = 'Arcane gleam surrounding ' + (entity.type.type === 'player' ? ' your ' : (screen.removeFirst(entity.type.name))) + ' body disappears.';

       entity.modifiers.push({type: [{stat: 'defense', value: 7}], counter: 24, applied: false, useText: useText, wearOffText: wearOffText});

       if(entity.type.type !== 'player'){

           entity.inventory.splice(entity.inventory.indexOf(item), 1);
       }
   }

   function blinkScroll(item, entity){

       var level = entity.position.level,
           newCoords = {},
           useText = screen.capitalizeString(entity.type.messageDisplay) + (entity.type.type === 'player' ? ' read ' : ' reads ') + item.description + '. ' + (screen.capitalizeString(entity.type.messageDisplay) + (entity.type.type === 'player' ? ' blink.' : ' blinks.'));

       getNewCoordinates();

       screen.placeVisibleMessage(useText, map.cells[level][entity.position.x][entity.position.y]);

       map.cells[level][entity.position.x][entity.position.y].entity = null;
       entity.position.x = newCoords.x;
       entity.position.y = newCoords.y;
       map.cells[level][entity.position.x][entity.position.y].entity = entity;

       screen.display.clear();

       if(entity.type.type === 'player') {

           map.clearVisibility(map.cells[entity.position.level]);
       }

       entity.currentFov = [];
       entity.doFov(entity);

       screen.drawVisibleCells(map.cells[level]);

       if(entity.type.type !== 'player'){

           entity.inventory.splice(entity.inventory.indexOf(item), 1);
       }

       function getNewCoordinates(){

           newCoords = getCoordinates(Object.keys(map.cells[level].floorTiles).random());

           if(map.cells[level][newCoords.x][newCoords.y].type.blockMovement === true || map.cells[level][newCoords.x][newCoords.y].entity !== null){

               getNewCoordinates();
           }

           if(map.cells[level][newCoords.x][newCoords.y].type.type === 'chasm' || map.cells[level][newCoords.x][newCoords.y].type.type === 'deep water' || map.cells[level][newCoords.x][newCoords.y].type.type === 'lava'){

               getNewCoordinates();
           }

           if(screen.getDistance(entity.position.x, entity.position.y, newCoords.x, newCoords.y) > 8){

               getNewCoordinates();
           }
       }
   }
   
   function teleportScroll(item, entity){
	   
	   var level = entity.position.level,
		   newCoords = {},
		   useText = screen.capitalizeString(entity.type.messageDisplay) + (entity.type.type === 'player' ? ' read ' : ' reads ') + item.description + '. ' + (screen.capitalizeString(entity.type.messageDisplay) + (entity.type.type === 'player' ? ' teleport.' : ' suddenly is gone! ')),
		   visibleFirstMessage = false;
		   
	   getNewCoordinates();

	   if(map.cells[level][entity.position.x][entity.position.y] === true){

		   visibleFirstMessage = true;
	   }
	   screen.placeVisibleMessage(useText, map.cells[level][entity.position.x][entity.position.y]);
		
	   map.cells[level][entity.position.x][entity.position.y].entity = null;
	   entity.position.x = newCoords.x;
	   entity.position.y = newCoords.y;
	   map.cells[level][entity.position.x][entity.position.y].entity = entity;
		
	   screen.display.clear();

	   if(entity.type.type === 'player') {

		   map.clearVisibility(map.cells[entity.position.level]);
	   }
		
	   entity.currentFov = [];
	   entity.doFov(entity);
		
	   screen.drawVisibleCells(map.cells[level]);

	   if(entity.type.type !== 'player') {

		   useText = screen.capitalizeString(entity.type.messageDisplay) + (visibleFirstMessage === true ? ' reappears.' : ' appears out of nowhere.');
		   screen.placeVisibleMessage(useText, map.cells[level][entity.position.x][entity.position.y]);

		   entity.inventory.splice(entity.inventory.indexOf(item), 1);
	   }

	   function getNewCoordinates(){
		   
		   newCoords = getCoordinates(Object.keys(map.cells[level].floorTiles).random());
		   
		   if(map.cells[level][newCoords.x][newCoords.y].type.blockMovement === true || map.cells[level][newCoords.x][newCoords.y].entity !== null){
			   
			   getNewCoordinates();
		   }
		   
		   if(map.cells[level][newCoords.x][newCoords.y].type.type === 'chasm' || map.cells[level][newCoords.x][newCoords.y].type.type === 'deep water' || map.cells[level][newCoords.x][newCoords.y].type.type === 'lava'){
			   
			   getNewCoordinates();
		   }
	   }
   }
   
   /*
	getCoordinates(key) - zwraca obiekt koordynatów w postaci {x: x, y: y} z klucza obiektu w postaci {'x,y': value}
	*/
	
	function getCoordinates(key){
		
		var comaIndex = key.search(','),
			x = parseInt(key.substring(0, comaIndex)),
			y = parseInt(key.substring(comaIndex + 1));
			
		return {x: x, y: y};
	}

   return {

		equip: equip,
		use: use
   }
});
