define(['map', 'screen', 'noise', 'pathfinding', 'light', 'animalai'], function(map, screen, noise, pathfinding, light, animalai){
	
	var monsterType = {
		
		'rat': {display: 'r', fgColor: 'darkgoldenrod', bgColor: 'transparent', lookDescription: 'a rat', type: {messageDisplay: 'rat', type: 'monster', family: 'animal', species: 'rat', name: 'a rat'}, stats: {speed: 110, perception: 8}, ai: animalai.ai, abilities: {breatheUnderWater: true, canFly: false, isSuffocating: false, canOpenDoors: false, suffocateCounter: 0}}
	};
	
	class Monster{
		
		constructor(onLevel, type){

			this.currentFov = [];
            this.currentGoal = null;
			this.position = {level: onLevel};
			this.display = monsterType[type].display;
			this.fgColor = monsterType[type].fgColor;
			this.bgColor = monsterType[type].bgColor;
			this.lookDescription = monsterType[type].lookDescription;
			this.type = {messageDisplay: monsterType[type].type.messageDisplay, type: monsterType[type].type.type, family: monsterType[type].type.family, species: monsterType[type].type.species, name: monsterType[type].type.name};
			
			this.stats = {speed: monsterType[type].stats.speed, perception: monsterType[type].stats.perception};
			this.abilities = {breatheUnderWater: monsterType[type].abilities.breatheUnderWater, canFly: monsterType[type].abilities.canFly, canOpenDoors: monsterType[type].abilities.canOpenDoors, isSuffocating: false, suffocateCounter: 0};

			this.ai = monsterType[type].ai;
			
			this.init();
            this.doFov(this);

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

                screen.placeMessage(screen.capitalizeString(screen.removeFirst(this.type.name)) + ' bumps into ' + map.cells[this.position.level][tmpX][tmpY].entity.type.name + '.');
				return 'entity';
			}else{

				this.currentFov = [];
				map.cells[this.position.level][this.position.x][this.position.y].entity = null;
				
				this.position.x = tmpX;
				this.position.y = tmpY;
				
				map.cells[this.position.level][this.position.x][this.position.y].entity = this;
				this.doFov(this);
				
				return 'moved';
			}
		}

		doFov(monster){

            function lightPasses(x, y){

                if(x < 0 || y < 0 || x > screen.options.width - 1 || y > screen.options.height - 1){

                    return false;
                }

                if(map.cells[monster.position.level][x][y].type.blockFov === true && x == monster.position.x && y == monster.position.y){

                    return true;
                }else if(map.cells[monster.position.level][x][y].type.blockFov === false){

                    return true;
                }else {

                    return false;
                }
            }

            var fov = new ROT.FOV.PreciseShadowcasting(lightPasses);

            fov.compute(monster.position.x, monster.position.y, 60, function(x, y, r, visibility){

                if(x < 0 || y < 0 || x > screen.options.width - 1 || y >  screen.options.height - 1){

                    return;
                }else if(map.cells[monster.position.level][x][y].isLit === true){

                    monster.currentFov.push({x: x, y: y});
                }else if(screen.getDistanceSquare(x, y, monster.position.x, monster.position.y) <= monster.stats.perception){

                    monster.currentFov.push({x: x, y: y});
                }else {

                    return;
                }
            });
        }
		
		act(){
			
			this.ai.nextStep(this);
		}
	}
	
	return{
		
		Monster: Monster
	}
});