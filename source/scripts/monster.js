define(['map', 'screen', 'noise', 'pathfinding', 'light', 'animalai', 'combat', 'monsterList'], function(map, screen, noise, pathfinding, light, animalai, combat, monsterList){
		
	class Monster{
		
		constructor(onLevel, type){
			
			//object with array determining whether certain creature (or whole species/family) is hostile
			this.hostileList = {
				
				species: monsterList.monsterType[type].hostileList.species,
				family: monsterList.monsterType[type].hostileList.family,
				entity: monsterList.monsterType[type].hostileList.entity
			};

			this.currentFov = [];
            this.currentGoal = null;
			this.position = {level: onLevel};
			this.display = monsterList.monsterType[type].display;
			this.fgColor = monsterList.monsterType[type].fgColor;
			this.bgColor = monsterList.monsterType[type].bgColor;
			this.lookDescription = monsterList.monsterType[type].lookDescription;
			
			this.size = monsterList.monsterType[type].size;
			this.type = {
				messageDisplay: monsterList.monsterType[type].type.messageDisplay, 
				type: monsterList.monsterType[type].type.type, 
				family: monsterList.monsterType[type].type.family, 
				species: monsterList.monsterType[type].type.species, 
				name: monsterList.monsterType[type].type.name};
			
			this.stats = {
				strength: monsterList.monsterType[type].stats.strength, 
				dexterity: monsterList.monsterType[type].stats.dexterity, 
				constitution: monsterList.monsterType[type].stats.constitution, 
				intelligence: monsterList.monsterType[type].stats.intelligence, 
				wisdom: monsterList.monsterType[type].stats.wisdom, 
				charisma: monsterList.monsterType[type].stats.charisma, 
				speed: monsterList.monsterType[type].stats.speed, 
				perception: monsterList.monsterType[type].stats.perception, 
				baseAttackBonus: monsterList.monsterType[type].stats.baseAttackBonus, 
				defense: monsterList.monsterType[type].stats.defense};
			
			this.hp = 4 + Math.floor(this.stats.constitution / 2 - 5);
			this.HD = monsterList.monsterType[type].HD;
			
			this.abilities = {
				breatheUnderWater: monsterList.monsterType[type].abilities.breatheUnderWater, 
				canFly: monsterList.monsterType[type].abilities.canFly, 
				canOpenDoors: monsterList.monsterType[type].abilities.canOpenDoors, 
				isSuffocating: false, 
				suffocateCounter: 0};

			this.ai = monsterList.monsterType[type].ai;
			this.defaultWeapon = monsterList.monsterType[type].defaultWeapon;
			this.weapon = this.defaultWeapon;
			
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
				this.position.lastVisitedCell = null;
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

				combat.doCombatMelee(this, map.cells[this.position.level][tmpX][tmpY].entity);
				return 'entity';
			}else if(map.cells[this.position.level][tmpX][tmpY].entity === null){
				
				this.currentFov = [];
				map.cells[this.position.level][this.position.x][this.position.y].entity = null;
				
				this.position.lastVisitedCell = map.cells[this.position.level][this.position.x][this.position.y];
				this.position.x = tmpX;
				this.position.y = tmpY;
				
				map.cells[this.position.level][this.position.x][this.position.y].entity = this;
				
				map.cells[this.position.level][this.position.x][this.position.y].type.walkEffect(this, this.position.x, this.position.y);
				
				screen.display.clear();
				screen.drawVisibleCells(map.cells[this.position.level]);
				
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
		
		/*
		terrainModifiers() - function applying terrain modifiers to player. Used at beginning of act() method.
		*/
		
		terrainModifiers(){
			
			var level = this.position.level,
				x = this.position.x,
				y = this.position.y,
				modifiers = map.cells[level][x][y].type.modifiers;
			
			/*
			if current cell has modifiers, and previously visited cell did not (or player was just "created") - we apply modifiers to monster
			*/
			
			if(this.position.lastVisitedCell === null || this.position.lastVisitedCell.type.modifiers === null){
				
				if(map.cells[level][x][y].type.modifiers !== null){
				
					for(var n in modifiers){
				
						this.stats[n] += modifiers[n];
						
					}
				}
			}else if(this.position.lastVisitedCell.type.modifiers !== null){
			
			/*
			if lastVisitedCell had any modifiers, we have two options: either current cell can have other modifiers (like coming from sand to shallow water), or current cell can have no modifiers (like coming from sand to floor). In former option we remove modifiers from lastVisitedCell and add modifiers from current cell, in latter option we just remove modifiers from lastVisitedCell
			*/
			
				if(map.cells[level][x][y].type.modifiers !== null && map.cells[level][x][y].type.type !== this.position.lastVisitedCell.type.type){
					
					for(var n in modifiers){
						
						this.stats[n] += modifiers[n];
					}
					
					for(var n in this.position.lastVisitedCell.modifiers){
						
						this.stats[n] -= this.position.lastVisitedCell.modifiers[n];
					}
				}else if(map.cells[level][x][y].type.modifiers === null){
					
					for(var n in this.position.lastVisitedCell.type.modifiers){
						
						this.stats[n] -= this.position.lastVisitedCell.type.modifiers[n];
					}
				}
			}
		}
		
		checkIfHostile(entity){
			
			for(var i=0; i<this.hostileList.species.length; i++){
				
				if(entity.type.species === this.hostileList.species[i]){
					
					return true;
				}
			}
			
			for(var i=0; i<this.hostileList.family.length; i++){
				
				if(entity.type.family === this.hostileList.family[i]){
					
					return true;
				}
			}
			
			for(var i=0; i<this.hostileList.entity.length; i++){
				
				if(entity === this.hostileList.entity[i]){
					
					return true;
				}
			}
		}
		
		act(){
			
			this.ai.nextStep(this);
			this.terrainModifiers();
		}
	}
	
	return{
		
		Monster: Monster
	}
});