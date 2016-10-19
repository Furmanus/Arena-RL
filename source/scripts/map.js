define(['screen'], function(screen){

	//obiekt przechowujący funkcje wywoływane przy próbie wejście na dane pole
	var walkAttemptFunctions = {
	//otwieranie drzwi. zwraca stop do metody move() obiektu entity, gdyż po otworzeniu drzwi nie następuje zmiana położenia gracza	
		openDoors: function(entity, x, y){
		
			setTerrain(entity.position.level, x, y, 'openDoors');
		
			if(entity.type.type == 'player'){
			
				screen.placeMessage(screen.capitalizeString(entity.type.messageDisplay) + ' open the doors.');
			}
		
			return 'stop';
		},
	//podstawowa metoda próby wejścia na dane pole. Zwraca wartość 'continue' do metody move() danego potwora lub gracza	
		defaultWalkAttempt: function(entity, x, y){
			
			entity.abilities.isSuffocating = false;
			entity.abilities.suffocateCounter = 0;
			return 'continue';
		},
		
		deepWater: function(entity, x, y){
			
			if(entity.type.type == 'player' && cells[entity.position.level][entity.position.x][entity.position.y].type.type != 'deep water'){
				
				if(entity.abilities.breatherUnderWater === true){
					
					screen.placeMessage('You walk into deep water.');
				}else{
					
					screen.placeMessage('You fall into deep water!');
				}
			}
			
			return 'continue';
		}
	};
	
	//obiekt przechowujący funkcje wywoływane przy wejściu na dane pole
	var walkEffectFunctions = {
		
		defaultWalkEffect: function(entity, x, y){
			
			return 'no effect';
		},
		
		deepWaterEffect: function(entity, x, y){
				
			if(entity.abilities.breatheUnderWater === false){
					
				if(entity.type.type == 'player'){
						
					screen.placeMessage('You are drowning!');
					entity.abilities.isSuffocating = true;
					entity.abilities.suffocateCounter ++;
				}
			}else{
					
				if(entity.type.type == 'player'){
						
					screen.placeMessage('You swim through water.');
				}
			}
			
			if(entity.abilities.suffocateCounter > 4){
				
				if(entity.type.type == 'player'){
					
					screen.placeMessage('You are losing health!');
				}
			}
		}
	};
	
	var terrain = {
		'floor': {display: ['.'], fgColor: 'silver', bgColor: 'rgb(1,1,1)', lightColor: null, blockFov: false, blockMovement: false, flammable: false, type: 'floor', key: 'floor', name: 'a floor', walkMessage: '', walkAttempt: walkAttemptFunctions.defaultWalkAttempt, walkEffect: walkEffectFunctions.defaultWalkEffect, modifiers: null},
		
		'wall': {display: ['#'], fgColor: 'silver', bgColor: 'rgb(1,1,1)', lightColor: null, blockFov: true, blockMovement: true, flammable: false,  type: 'wall', key: 'wall', name: 'a wall', walkMessage: '', walkAttempt: walkAttemptFunctions.defaultWalkAttempt, walkEffect: walkEffectFunctions.defaultWalkEffect, modifiers: null},
		
		'closedDoors': {display: ['+'], fgColor: 'darkgoldenrod', bgColor: 'rgb(1,1,1)', lightColor: null, blockFov: true, blockMovement: true, flammable: true, type: 'closed doors', key:'closedDoors', name: 'a closed doors', walkMessage: '', walkAttempt: walkAttemptFunctions.openDoors, walkEffect: walkEffectFunctions.defaultWalkEffect, modifiers: null},
		
		'openDoors': {display: ['/'], fgColor: 'darkgoldenrod', bgColor: 'rgb(1,1,1)', lightColor: null, blockFov: false, blockMovement: false, flammable: true,  type: 'open doors', key: 'openDoors', name: 'an open doors', walkMessage: '', walkAttempt: walkAttemptFunctions.defaultWalkAttempt, walkEffect: walkEffectFunctions.defaultWalkEffect, modifiers: null},
		
		'stairsUp': {display: ['<'], fgColor: 'silver', bgColor: 'rgb(1,1,1)', lightColor: null, blockFov: false, blockMovement: false, flammable: false, type: 'stairs up', key: 'stairsUp', name: 'a stairs leading upwards', walkMessage: 'Stairs leading upwards are here.', walkAttempt: walkAttemptFunctions.defaultWalkAttempt, walkEffect: walkEffectFunctions.defaultWalkEffect, modifiers: null},
		
		'stairsDown': {display: ['>'], fgColor: 'silver', bgColor: 'rgb(1,1,1)', lightColor: null, blockFov: false, blockMovement: false, flammable: false, type: 'stairs down', key: 'stairsDown', name: 'a stairs leading downwards', walkMessage: 'Stairs leading downwards are here.', walkAttempt: walkAttemptFunctions.defaultWalkAttempt, walkEffect: walkEffectFunctions.defaultWalkEffect, modifiers: null},
		
		'bush': {display: ['"'], fgColor: 'rgb(0,255,0)', bgColor: 'rgb(1,1,1)', lightColor: null, blockFov: true, blockMovement: false, flammable: true, type: 'dead bush', key: 'deadBush', name: 'a bush', walkMessage: 'A thick bush is growing here.', walkAttempt: walkAttemptFunctions.defaultWalkAttempt, walkEffect: walkEffectFunctions.defaultWalkEffect, modifiers: null},
		
		'deadBush': {display: ['"'], fgColor: 'rgb(90,90,90)', bgColor: 'rgb(1,1,1)', lightColor: null, blockFov: false, blockMovement: false, flammable: false, type: 'bush', key: 'bush', name: 'a dead bush', walkMessage: 'A withered bush is here.', walkAttempt: walkAttemptFunctions.defaultWalkAttempt, walkEffect: walkEffectFunctions.defaultWalkEffect, modifiers: null},
		
		'tree': {display: ['\u2648'], fgColor: 'rgb(0,255,0)', bgColor: 'rgb(1,1,1)', lightColor: null, blockFov: false, blockMovement: true, flammable: true, type: 'tree', key: 'tree', name: 'a tree', walkMessage: '', walkAttempt: walkAttemptFunctions.defaultWalkAttempt, walkEffect: walkEffectFunctions.defaultWalkEffect, modifiers: null},
		
		'deadTree': {display: ['\u2648'], fgColor: 'rgb(90,90,90)', bgColor: 'rgb(1,1,1)', lightColor: null, blockFov: false, blockMovement: true, flammable: false, type: 'dead tree', key: 'deadTree', name: 'a dead tree', walkMessage: '', walkAttempt: walkAttemptFunctions.defaultWalkAttempt, walkEffect: walkEffectFunctions.defaultWalkEffect, modifiers: null},
		
		'grass': {display: ['\u26C6'], fgColor: 'rgb(0,255,0)', bgColor: 'rgb(1,1,1)', lightColor: null, blockFov: false, blockMovement: false, flammable: true, type: 'grass', key: 'grass', name: 'a grass', walkMessage: 'A knee deep patch of grass is growing here.', walkAttempt: walkAttemptFunctions.defaultWalkAttempt, walkEffect: walkEffectFunctions.defaultWalkEffect, modifiers: null},
		
		'deadGrass': {display: ['\u26C6'], fgColor: 'rgb(90,90,90)', bgColor: 'rgb(1,1,1)', lightColor: null, blockFov: false, blockMovement: false, flammable: false, type: 'dead grass', key: 'deadGrass', name: 'a dead grass', walkMessage: 'A patch of dead grass is here.', walkAttempt: walkAttemptFunctions.defaultWalkAttempt, walkEffect: walkEffectFunctions.defaultWalkEffect, modifiers: null},
		
		'sand': {display: ['\u26C6'], fgColor: 'darkgoldenrod', bgColor: 'rgb(1,1,1)', lightColor: null, blockFov: false, blockMovement: false, flammable: false, type: 'sand', key: 'sand', name: 'a sand', walkMessage: 'You walk through sand. Your movements are a little slowed.', walkAttempt: walkAttemptFunctions.defaultWalkAttempt, walkEffect: walkEffectFunctions.defaultWalkEffect, modifiers: {speed: -15}},
		
		'chasm': {display: ['\u2637'], fgColor: 'rgb(50,50,50)', bgColor: 'rgb(1,1,1)', lightColor: null, blockFov: false, blockMovement: false, flammable: false, type: 'chasm', key: 'chasm', name: 'a chasm', walkMessage: '', walkAttempt: walkAttemptFunctions.defaultWalkAttempt, walkEffect: walkEffectFunctions.defaultWalkEffect, modifiers: null},
		
		'woodenBridge': {display: ['#'], fgColor: 'darkgoldenrod', bgColor: 'rgb(1,1,1)', lightColor: null, blockFov: false, blockMovement: false, flammable: true, type: 'wooden bridge', key: 'woodenBridge', name: 'a wooden bridge', walkMessage: '', walkAttempt: walkAttemptFunctions.defaultWalkAttempt, walkEffect: walkEffectFunctions.defaultWalkEffect, modifiers: null},
		
		'shallowWater': {display: ['\u2652'], fgColor: 'aqua', bgColor: 'rgb(1,1,1)', lightColor: null, blockFov: false, blockMovement: false, flammable: false, type: 'shallow water', key: 'shallowWater', name: 'a shallow water', walkMessage: 'You walk through shallow water. Your movements are little slowed here.', walkAttempt: walkAttemptFunctions.defaultWalkAttempt, walkEffect: walkEffectFunctions.defaultWalkEffect, modifiers: {speed: -15}},
		
		'deepWater': {display: ['\u2652'], fgColor: 'darkblue', bgColor: 'rgb(1,1,1)', lightColor: null, blockFov: false, blockMovement: false, flammable: false, type: 'deep water', key: 'deepWater', name: 'a deep water', walkMessage: '', walkAttempt: walkAttemptFunctions.deepWater, walkEffect: walkEffectFunctions.deepWaterEffect, modifiers: {speed: -35}},
		
		'burntGround': {display: [',', '.'], fgColor: 'rgb(70,70,70)', bgColor: 'rgb(1,1,1)', lightColor: null, blockFov: false, blockMovement: false, flammable: false, type: 'burnt ground', key: 'burntGround', name: 'a burnt ground', walkMessage: 'A burnt ground.', walkAttempt: walkAttemptFunctions.defaultWalkAttempt, walkEffect: walkEffectFunctions.defaultWalkEffect, modifiers: null}
	}
	
	var cells = {maxDungeonLevel: 0};
	
	function initCells(level){
		
		cells[level] = new Array(screen.options.width);
		
		for(var i=0; i<screen.options.width; i++){
			
			cells[level][i] = new Array(screen.options.height);
			
			for(var j=0; j<screen.options.height; j++){
				
				cells[level][i][j] = {};
				cells[level][i][j].level = level;
				cells[level][i][j].x = i;
				cells[level][i][j].y = j;
				cells[level][i][j].isVisible = false;
				cells[level][i][j].hasBeenDiscovered = false;
				cells[level][i][j].isLit = false,
				cells[level][i][j].isOnFire = false;
				cells[level][i][j].type = {};
				cells[level][i][j].entity = null;
				cells[level][i][j].lightSource = {source: null, coords: []};
				cells[level][i][j].inventory = [];
				
				setTerrain(level, i, j, 'wall');
			}
		}
		
		cells[level].stairsDown = null;
		cells[level].stairsUp = null;
		cells[level].floorTiles = {};
		cells[level].rooms;
		cells[level].specialRooms = [];
		cells[level].levelGenerated = null; //mapa utworzona w module generator przy pomocy new ROT.Map...
		setTimeEngine(level);
	}
	
	function setTerrain(level, cellX, cellY, terrainType){
		
		cells[level][cellX][cellY].type = {
			
			display: terrain[terrainType].display.random(),
			fgColor: terrain[terrainType].fgColor,
			bgColor: terrain[terrainType].bgColor,
			lightColor: terrain[terrainType].lightColor,
			blockFov: terrain[terrainType].blockFov,
			blockMovement: terrain[terrainType].blockMovement,
			flammable: terrain[terrainType].flammable,
			type: terrain[terrainType].type,
			key: terrain[terrainType].key,
			name: terrain[terrainType].name,
			walkMessage: terrain[terrainType].walkMessage,
			walkAttempt: terrain[terrainType].walkAttempt,
			walkEffect: terrain[terrainType].walkEffect,
			modifiers: terrain[terrainType].modifiers
		}
	}
	
	function setTimeEngine(level){
		
		cells[level].time = {};
		
		cells[level].time['scheduler'] = new ROT.Scheduler.Speed();
		cells[level].time['engine'] = new ROT.Engine(cells[level].time.scheduler);
	}
	
	function clearVisibility(cells){
		
		for(var i=0; i<screen.options.width; i++){
			
			for(var j=0; j<screen.options.height; j++){
				
				cells[i][j].isVisible = false;
			}
		}
	}
	
	return {
		cells: cells,
		initCells: initCells,
		terrain: terrain,
		setTerrain: setTerrain,
		clearVisibility: clearVisibility
	}
});