define(['map', 'screen', 'noise', 'pathfinding', 'light', 'animalai', 'combat', 'monsterList', 'items', 'status', 'creatai'], function(map, screen, noise, pathfinding, light, animalai, combat, monsterList, items, status, creatai){

    //object literal which contains directions used in several monster methods (right now only in drop method)
    var moveActions = {
        103: {x: -1, y: -1},
        104: {x: 0,y: -1},
        105: {x: 1, y: -1},
        102: {x: 1, y: 0},
        99: {x: 1, y: 1},
        98: {x: 0, y: 1},
        97: {x: -1, y: 1},
        100: {x: -1, y: 0},
        101: {x: 0, y: 0}
    };
		
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

				'prone': {value: 0, activatedEveryTurn: status.entityStatus.prone.activatedEveryTurn, activateEffect: status.entityStatus.prone.activateEffect, removeEffect: 				status.entityStatus.prone.removeEffect, initEffect: status.entityStatus.prone.initEffect, modifiers: {}},

				'bleeding': {value: 0, activatedEveryTurn: status.entityStatus.bleeding.activatedEveryTurn, activateEffect: status.entityStatus.bleeding.activateEffect, 				removeEffect: status.entityStatus.bleeding.removeEffect, initEffect: status.entityStatus.bleeding.initEffect, modifiers: {}},

				'stunned': {value: 0, activatedEveryTurn: status.entityStatus.stunned.activatedEveryTurn, activateEffect: status.entityStatus.stunned.activateEffect, removeEffect: status.entityStatus.stunned.removeEffect, initEffect: status.entityStatus.stunned.initEffect, modifiers: {}, counter: 0},

				'poisoned': {value: 0, activatedEveryTurn: status.entityStatus.poisoned.activatedEveryTurn, activateEffect: status.entityStatus.poisoned.activateEffect, removeEffect: status.entityStatus.poisoned.removeEffect, initEffect: status.entityStatus.poisoned.initEffect, modifiers: {}, counter: 0}
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

		randomMove(){

			var tmpX = this.position.x + [-1, 0, 1].random(),
				tmpY = this.position.y + [-1, 0, 1].random();

			if(map.cells[this.position.level][tmpX][tmpY].type.blockMovement === true){

				return 'wall';
			}else if(map.cells[this.position.level][tmpX][tmpY].entity !== null && map.cells[this.position.level][tmpX][tmpY].entity !== this){

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

            var examinedCell = map.cells[this.position.level][this.position.x][this.position.y];

			new items.Corpse(this.type.species, map.cells[this.position.level][this.position.x][this.position.y]);

            while(this.inventory.length > 0) {

                this.dropItem(0);
            }
		}

		dropWeapon(){

            if(this.weapon.natural === false){

                var examinedCell = map.cells[this.position.level][this.position.x][this.position.y];

                screen.placeVisibleMessage(screen.capitalizeString(this.type.messageDisplay) + ' drops ' + this.weapon.description + '.', map.cells[this.position.level][this.position.x][this.position.y]);
                examinedCell.inventory.push(this.equipment['right hand']);
                this.equipment['right hand'].owner = examinedCell;
                this.equipment['right hand'] = {description: 'empty'};
                this.weapon = this.defaultWeapon;
            }
		}

		dropItem(index){

            var examinedCell = map.cells[this.position.level][this.position.x][this.position.y];

            if(examinedCell.inventory.length <= 12) {

                this.inventory[index].owner = examinedCell;
                examinedCell.inventory.push(this.inventory.splice(index, 1)[0]);
            }else{

                for(var n in moveActions){

                    examinedCell = map.cells[this.position.level][this.position.x + moveActions[n].x][this.position.y + moveActions[n].y];

                    if(examinedCell.type.blockMovement == false && examinedCell.inventory.length <= 12){

                        this.inventory[index].owner = examinedCell;
                        examinedCell.inventory.push(player.inventory.splice(index, 1)[0]);
                        break;
                    }
                }
            }
        }
		
		act(){

			var examinedStatus = this.ai.examineStatus(this);

			this.applyStatus();

			if(examinedStatus === 'status ok') {

				this.ai.nextStep(this);
			}else if(examinedStatus === 'rise'){

				this.rise();
			}else if(examinedStatus === 'stunned'){

				this.randomMove();
			}


			this.terrainModifiers(); //after next step we need to calculate terrain modifiers for other entities turns
		}

		updateScreenStats(){


		}

		receiveDamage(number){

			this.hp -= number;

			if(this.hp < 1){

				map.cells[this.position.level].time.scheduler.remove(this);
				map.cells[this.position.level][this.position.x][this.position.y].entity = null;

				screen.placeVisibleMessage(screen.capitalizeString(entity.type.messageDisplay) + ' dies.');
			}

			screen.display.clear();
			screen.drawVisibleCells(map.cells[defender.position.level]);
		}

		//changes 'prone' status, if it's set to 1(monster is fallen on ground)

		rise(){

			screen.placeVisibleMessage(screen.capitalizeString(this.type.messageDisplay) + ' rises back on feet.', map.cells[this.position.level][this.position.x][this.position.y]);
			this.status.prone.removeEffect(this);
		}

		/*
		 function which iterates through this.status object. For each status which value equals 1 and activatedEveryTurn variable equals true, function calls activateEffect for appriopiate status
		 */
		applyStatus(){

			for(var n in this.status){

				if(this.status[n].value === 1 && this.status[n].activatedEveryTurn === true){

					this.status[n].activateEffect(this);
				}
			}
		}

		/*
		function responsible for picking up items from ground by monster. As an argument it takes index from ground cell inventory
		 */
		pickUp(index){

            var examinedCell = map.cells[this.position.level][this.position.x][this.position.y];

            screen.placeVisibleMessage(screen.capitalizeString(this.type.messageDisplay) + ' picks up ' + examinedCell.inventory[index].description + '.', examinedCell);
            this.inventory.push(examinedCell.inventory[index]);
            examinedCell.inventory[index].owner = this;
            examinedCell.inventory.splice(index, 1);
        }

        equip(index, slot){

			screen.placeVisibleMessage(screen.capitalizeString(this.type.messageDisplay) + ' equips ' + this.inventory[index].description + '.', map.cells[this.position.level][this.position.x][this.position.y]);
			this.equipment[slot] = this.inventory.splice(index, 1)[0];

			if(slot === 'right hand'){

				this.weapon = this.equipment['right hand'];
			}
		}

		unequip(slot){

			screen.placeVisibleMessage(screen.capitalizeString(this.type.messageDisplay) + ' removes ' + this.equipment[slot].description + '.', map.cells[this.position.level][this.position.x][this.position.y]);

			this.inventory.push(this.equipment[slot]);
			this.equipment[slot] = {description: 'empty'};

			if(slot === 'right hand'){

				this.weapon = this.defaultWeapon;
			}
		}
	}
	
	return{
		
		Monster: Monster
	}
});