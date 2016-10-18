define(['map', 'screen', 'noise', 'pathfinding', 'light'], function(map, screen, noise, pathfinding, light){
	
	var monsterType = {
		
		'rat': {display: 'r', fgColor: 'darkgoldenrod', bgColor: 'transparent', lookDescription: 'a rat', type: {messageDisplay: 'rat', type: 'monster', family: 'animal', species: 'rat', name: 'a rat'}, stats: {speed: 110, perception: 8}, ai: null,
		abilities: {breatheUnderWater: true, canFly: false, isSuffocating: false, canOpenDoors: false, suffocateCounter: 0}}
	};
	
	class Monster{
		
		constructor(onLevel, type){
			
			this.position = {level: onLevel};
			this.display = monsterType[type].display;
			this.fgColor = monsterType[type].fgColor;
			this.bgColor = monsterType[type].bgColor;
			this.lookDescription = monsterType[type].lookDescription;
			this.type = {messageDisplay: monsterType[type].type.messageDisplay, type: monsterType[type].type.type, family: monsterType[type].type.family, species: monsterType[type].type.species, name: monsterType[type].type.name};
			
			this.stats = {speed: monsterType[type].stats.speed, perception: monsterType[type].stats.perception};
			this.abilities = {breatheUnderWater: monsterType[type].abilities.breatheUnderWater, canFly: monsterType[type].abilities.canFly, canOpenDoors: monsterType[type].abilities.canOpenDoors, isSuffocating: false, suffocateCounter: 0};
			
			this.init();
			map.cells[this.position.level].time.scheduler.add(this, true);
		}
		
		init(){
			
			var x, y,
				level = this.position.level,
				start = startPosition.bind(this);
			
			start();
			
			//this.position.level = 0;
			//this.position.x = 7;
			//this.position.y = 5;
			
			function startPosition(){
				x = ROT.RNG.getUniformInt(1 , screen.options.width - 2);
			    y = ROT.RNG.getUniformInt(1 , screen.options.height - 2);
				
				if(map.cells[level][x][y].entity != null){
					start();
				}
				/*
				if(map.cells[level][x][y].isVisible == true){
					
					start();
				}
				*/
				if(map.cells[level][x][y].type.type != 'floor' && map.cells[level][x][y].type.type != 'grass' && map.cells[level][x][y].type.type != 'dead grass' && map.cells[level][x][y].type.type != 'sand'){
					start();
				}
				
				this.position.x = x;
				this.position.y = y;
				map.cells[level][x][y].entity = this;
			}
		}
		
		getSpeed(){
			
			return this.stats.speed;
		}
		
		/*
		moves entity towards selected coordinates (x and y vary from -1 to 1))
		*/
		
		move(x,y){
			
			var tmpX = this.position.x + x,
				tmpY = this.position.y + y;
			
			if(map.cells[this.position.level][tmpX][tmpY].type.blockMovement === true){
				
				return 'wall';
			}else if(map.cells[this.position.level][tmpX][tmpY].entity !== null){
				
				return 'entity';
			}else{
				
				map.cells[this.position.level][this.position.x][this.position.y].entity = null;
				
				this.position.x = tmpX;
				this.position.y = tmpY;
				
				map.cells[this.position.level][this.position.x][this.position.y].entity = this;
				
				return 'moved';
			}
		}
		
		act(){
			
			
		}
	}
	
	return{
		
		Monster: Monster
	}
});