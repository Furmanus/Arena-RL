define(['map', 'screen', 'noise', 'pathfinding', 'light', 'animalai', 'combat', 'monsterList', 'items', 'status'], function(map, screen, noise, pathfinding, light, animalai, combat, monsterList, items, status){
		
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

			this.HD = monsterList.monsterType[type].HD;
			this.hp = combat.calcMax(this.HD) + Math.floor(this.stats.constitution / 2 - 5);
			this.maxHp = this.hp;
			
			this.abilities = {
				breatheUnderWater: monsterList.monsterType[type].abilities.breatheUnderWater, 
				canFly: monsterList.monsterType[type].abilities.canFly, 
				canOpenDoors: monsterList.monsterType[type].abilities.canOpenDoors, 
				isSuffocating: false, 
				suffocateCounter: 0};

			this.ai = monsterList.monsterType[type].ai;
			this.defaultWeapon = monsterList.monsterType[type].defaultWeapon;
			this.weapon = this.defaultWeapon;

            this.inventory = [];
			this.equipment = monsterList.monsterType[type].equipment;
			
			this.modifiers;
			this.terrainModifier = {source: undefined, stats: null};

			this.status = {

				'fallen': {value: 0}
			};
			
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
		terrainModifiers() - function applying terrain modifiers to player. Used at beginning of act() method. Description of algorithm is in equal method in player module
		*/

		terrainModifiers(){

			var level = this.position.level,
				x = this.position.x,
				y = this.position.y,
				modifiers = map.cells[level][x][y].type.modifiers;

			if(modifiers !== null){

				if(map.cells[level][x][y].type.type !== this.terrainModifier.source.type.type){

					for(var n in this.terrainModifier.stats){

						this.stats[n] -= this.terrainModifier.stats[n];
					}

					this.terrainModifier = {source: map.cells[level][x][y], stats: {}};

					for(var n in modifiers){

						if(this.stats[n] + modifiers[n] > 0) {

							this.terrainModifier.stats[n] = modifiers[n];
						}else{

							this.terrainModifier.stats[n] = -this.stats[n] + 1;
						}
					}

					for(var n in this.terrainModifier.stats){

						this.stats[n] += this.terrainModifier.stats[n];
					}
				}else if(map.cells[level][x][y].type.type === this.terrainModifier.source.type.type){

					this.terrainModifier.source = map.cells[level][x][y];
				}
			}else if(modifiers === null){

				if(this.terrainModifier.stats !== null){

					for(var n in this.terrainModifier.stats){

						this.stats[n] -= this.terrainModifier.stats[n];
					}
				}

				this.terrainModifier = {source: map.cells[level][x][y], stats: null};
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

		dropCorpse(){

			new items.Corpse(this.type.species, map.cells[this.position.level][this.position.x][this.position.y]);
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