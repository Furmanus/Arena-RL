/**
 * Created by Furman on 16.10.2016.
 */

/*
module for use/equip effects function for items used inside items module
 */

define(['screen', 'map'], function(screen, map){

   var equip = {

      'misc': {

         'torch': lightTorch
      }
   };
   
   var use = {
	   
	   'potions': {
		   
		   'speed': speedPotion
	   },
	   
	   'scrolls':{
		   
		   'teleportation': teleport
	   }
   }

   function lightTorch(item, entity, action){
		//DO ZROBIENIA
	   screen.placeMessage('You light the torch.');
   }
   
   function speedPotion(item, entity){

	   var wearOffText = screen.capitalizeString(entity.type.name) + (entity.type.type === 'player' ? ' are ' : ' is ') + ' no longer moving faster.',
		   useText = screen.capitalizeString(entity.type.name) + (entity.type.type === 'player' ? ' quaff' : ' quaffs') + ' a speed potion. Suddenly ' + (entity.type.name) + (entity.type.type === 'player' ? ' are moving faster!' : ' is moving faster!');

	   entity.modifiers.push({type: 'speed', value: 40, counter: 15, applied: false, useText: useText, wearOffText: wearOffText});

	   if(entity.type.type !== 'player'){

		   entity.inventory.splice(entity.inventory.indexOf(item), 1);
	   }
   }
   
   function teleport(item, entity){
	   
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
