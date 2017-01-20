define(['map', 'screen', 'noise', 'pathfinding', 'light', 'animalai', 'combat', 'monsterList', 'items', 'status', 'creatai', 'messages'], function(map, screen, noise, pathfinding, light, animalai, combat, monsterList, items, status, creatai, messages){

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
				entity: monsterList.monsterType[type].hostileList.entity,
				group: monsterList.monsterType[type].hostileList.group
			};

			this.currentFov = [];
            this.currentGoal = null;
			this.position = {level: onLevel};
			this.display = monsterList.monsterType[type].display;
			this.fgColor = monsterList.monsterType[type].fgColor;
			this.bgColor = monsterList.monsterType[type].bgColor;
			this.lookDescription = monsterList.monsterType[type].lookDescription;
			this.waitCounter = 0; //used when monster collides in corridor with other monster (with no other way around). Monster waits 3 turns and sets new goal
			this.swap = {ready: false, entity: null};// object used when two non hostile monsters collide in corridor. Ready is boolean meaning whether monster is ready to swap
			// entity is monster with which monster will swap places. Used inside creatai.js module
			this.retreatEntity = null; //hostile wants to avoid and flee from. It is set in combat module, when monster is injured and has less than 10% hp
			this.lastSeenTreatPosition = {}; //stores coordinates of last seen treat from which monster flees (they are used if treat is not visible)
			this.lookingForHostile = false;
			
			this.size = monsterList.monsterType[type].size;
			this.favouredStat = monsterList.monsterType[type].favouredStat;
			this.type = {
				messageDisplay: monsterList.monsterType[type].type.messageDisplay, 
				type: monsterList.monsterType[type].type.type, 
				family: monsterList.monsterType[type].type.family, 
				species: monsterList.monsterType[type].type.species,
				group: monsterList.monsterType[type].type.group,
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
			this.xp = monsterList.monsterType[type].xp;
			this.experienceLevel = 1;
			this.experience = 0;
			this.hp = combat.calcMax(this.HD) + Math.floor(this.stats.constitution / 2 - 5);
			this.maxHp = this.hp;
            this.favouredWeaponType = monsterList.monsterType[type].favouredWeaponType;
			
			this.abilities = {
				breatheUnderWater: monsterList.monsterType[type].abilities.breatheUnderWater, 
				canFly: monsterList.monsterType[type].abilities.canFly, 
				canOpenDoors: monsterList.monsterType[type].abilities.canOpenDoors,
				fearless: monsterList.monsterType[type].abilities.fearless,
				cantDrinkPotions: monsterList.monsterType[type].abilities.cantDrinkPotions,
				illiterate: monsterList.monsterType[type].abilities.illiterate,
				mindless: monsterList.monsterType[type].abilities.mindless,
				isSuffocating: false, 
				suffocateCounter: 0
			};

			this.ai = monsterList.monsterType[type].ai;
			this.defaultWeapon = monsterList.monsterType[type].defaultWeapon;
			this.weapon = this.defaultWeapon;

            this.inventory = [];
			this.equipment = monsterList.monsterType[type].equipment;
			
			this.modifiers = [];
			this.terrainModifier = {source: undefined, stats: null};

			this.status = {

				'prone': {value: 0, activatedEveryTurn: status.entityStatus.prone.activatedEveryTurn, activateEffect: status.entityStatus.prone.activateEffect, removeEffect: 				status.entityStatus.prone.removeEffect, initEffect: status.entityStatus.prone.initEffect, modifiers: {}},

				'bleeding': {value: 0, activatedEveryTurn: status.entityStatus.bleeding.activatedEveryTurn, activateEffect: status.entityStatus.bleeding.activateEffect, 				removeEffect: status.entityStatus.bleeding.removeEffect, initEffect: status.entityStatus.bleeding.initEffect, modifiers: {}},

				'stunned': {value: 0, activatedEveryTurn: status.entityStatus.stunned.activatedEveryTurn, activateEffect: status.entityStatus.stunned.activateEffect, removeEffect: status.entityStatus.stunned.removeEffect, initEffect: status.entityStatus.stunned.initEffect, modifiers: {}, counter: 0},

				'poisoned': {value: 0, activatedEveryTurn: status.entityStatus.poisoned.activatedEveryTurn, activateEffect: status.entityStatus.poisoned.activateEffect, removeEffect: status.entityStatus.poisoned.removeEffect, initEffect: status.entityStatus.poisoned.initEffect, modifiers: {}, counter: 0},

				'afraid': {value: 0, activatedEveryTurn: function(){}, activateEffect: function(){}, removeEffect: function(){}, initEffect: function(){}, modifiers: {}, counter: 0},

                'paralyzed': {value: 0, activatedEveryTurn: status.entityStatus.paralyzed.activatedEveryTurn, activateEffect: status.entityStatus.paralyzed.activateEffect, removeEffect: status.entityStatus.paralyzed.removeEffect, initEffect: status.entityStatus.paralyzed.initEffect, modifiers: {}, counter: 0},

                'berserk': {value: 0, activatedEveryTurn: status.entityStatus.berserk.activatedEveryTurn, activateEffect: status.entityStatus.berserk.activateEffect, removeEffect: status.entityStatus.berserk.removeEffect, initEffect: status.entityStatus.berserk.initEffect, modifiers: {}, counter: 0}
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

			this.terrainModifiers();
			
			//this.position.level = 0;
			//this.position.x = 5;
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
				if(map.cells[level][x][y].type.type != 'floor' && map.cells[level][x][y].type.type != 'grass' && map.cells[level][x][y].type.type != 'dead grass'){
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

				if(map.cells[this.position.level][tmpX][tmpY].type.type === 'closed doors'){

					map.setTerrain(this.position.level, tmpX, tmpY, 'openDoors');

					if(map.cells[this.position.level][this.position.x][this.position.y].isVisible === true && map.cells[this.position.level][tmpX][tmpY].isVisible === true){

						screen.placeMessage(screen.capitalizeString(this.type.messageDisplay) + ' open doors');
					}else if(map.cells[this.position.level][this.position.x][this.position.y].isVisible === false && map.cells[this.position.level][tmpX][tmpY].isVisible === true){

                        screen.placeMessage('Something unseen open doors.');
					}
				}else {

                    return 'wall';
                }
			}else if(map.cells[this.position.level][tmpX][tmpY].entity !== null){

				combat.doCombatMelee(this, map.cells[this.position.level][tmpX][tmpY].entity, 'melee');
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

				combat.doCombatMelee(this, map.cells[this.position.level][tmpX][tmpY].entity, 'melee');
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

            for(var i=0; i<this.hostileList.group.length; i++){

                if(entity.type.group === this.hostileList.group[i]){

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

            for(var n in this.equipment){

                if(this.equipment[n].description !== 'empty'){

                    this.inventory.push(this.equipment[n]);
                    this.equipment[n] = {description: 'empty'};
                }
            }

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
			this.doModifiers();
			this.gainLevel();
		}

		updateScreenStats(){


		}

		receiveDamage(number){

			this.hp -= number;

			if(this.hp < 1){

                screen.placeVisibleMessage(screen.capitalizeString(this.type.messageDisplay) + ' dies.', map.cells[this.position.level][this.position.x][this.position.y]);

				map.cells[this.position.level].time.scheduler.remove(this);
				map.cells[this.position.level][this.position.x][this.position.y].entity = null;
			}

			screen.display.clear();
			screen.drawVisibleCells(map.cells[this.position.level]);
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

            var examinedCell = map.cells[this.position.level][this.position.x][this.position.y],
				hasMonsterItem = checkIfMonsterHasItem.bind(this)(examinedCell.inventory[index]),
				stackable = (examinedCell.inventory[index].stackable && examinedCell.inventory[index].quantity > 1);

            screen.placeVisibleMessage(screen.capitalizeString(this.type.messageDisplay) + ' picks up ' + (stackable ? ('bundle of ' + examinedCell.inventory[index].quantity + ' ' + screen.removeFirst(examinedCell.inventory[index].description) + 's') : examinedCell.inventory[index].description) + '.', examinedCell);

            if(examinedCell.inventory[index].stackable){

				if(hasMonsterItem === null){

                    this.inventory.push(examinedCell.inventory[index]);
                    examinedCell.inventory[index].owner = this;
                    examinedCell.inventory.splice(index, 1);
				}else{

					this.inventory[hasMonsterItem].quantity += examinedCell.inventory[index].quantity;
                    examinedCell.inventory.splice(index, 1);
				}
			}else {

                this.inventory.push(examinedCell.inventory[index]);
                examinedCell.inventory[index].owner = this;
                examinedCell.inventory.splice(index, 1);
            }

            function checkIfMonsterHasItem(item){

                for(var i=0; i<this.inventory.length; i++){

                    if(item.name === this.inventory[i].name){

                        return i;
                    }
                }

                return null;
            }
        }

        equip(index, slot){

			screen.placeVisibleMessage(screen.capitalizeString(this.type.messageDisplay) + ' equips ' + this.inventory[index].description + '.', map.cells[this.position.level][this.position.x][this.position.y]);

			if(this.inventory[index].modifiers){

				for(var n in this.inventory[index].modifiers){

					if(this.stats[n] + this.inventory[index].modifiers[n] > 0) {

                        this.stats[n] += this.inventory[index].modifiers[n];
                    }
				}
			}

			this.equipment[slot] = this.inventory.splice(index, 1)[0];

			if(slot === 'right hand'){

				this.weapon = this.equipment['right hand'];
			}
		}

		unequip(slot){

			screen.placeVisibleMessage(screen.capitalizeString(this.type.messageDisplay) + ' removes ' + this.equipment[slot].description + '.', map.cells[this.position.level][this.position.x][this.position.y]);

			if(this.equipment[slot].modifiers) {

                for (var n in this.equipment[slot].modifiers) {

                    this.stats[n] -= this.equipment[slot].modifiers[n];
                }
            }

			this.inventory.push(this.equipment[slot]);
			this.equipment[slot] = {description: 'empty'};

			if(slot === 'right hand'){

				this.weapon = this.defaultWeapon;
			}
		}

		doModifiers(){

			for(var i=0; i<this.modifiers.length; i++){

				if(this.modifiers[i].applied === false){

					this.modifiers[i].applied = true;
					
					for(var j=0; j<this.modifiers[i].type.length; j++){
						
						this.stats[this.modifiers[i].type[j].stat] += this.modifiers[i].type[j].value;
					}
					screen.placeVisibleMessage(this.modifiers[i].useText, map.cells[this.position.level][this.position.x][this.position.y], 'red');
				}

				if(this.modifiers[i].counter === 0){

					for(var j=0; j<this.modifiers[i].type.length; j++){
						
						this.stats[this.modifiers[i].type[j].stat] -= this.modifiers[i].type[j].value;
					}
					screen.placeVisibleMessage(this.modifiers[i].wearOffText, map.cells[this.position.level][this.position.x][this.position.y]);
					this.modifiers.splice(i, 1);
					i--;
				}else{

					this.modifiers[i].counter--;
				}
			}
		}

        gainLevel(){

            if(this.experience >= screen.experienceTable[this.experienceLevel + 1].required){

                this.experienceLevel++;
                screen.placeVisibleMessage(screen.capitalizeString(this.type.messageDisplay) + ' looks more experienced!', map.cells[this.position.level][this.position.x][this.position.y], 'red');
                this.stats[this.favouredStat]++; //increase one random stat from class stats
                screen.placeVisibleMessage(screen.capitalizeString(this.type.messageDisplay) + messages.statGainMonsterMessages[this.favouredStat], map.cells[this.position.level][this.position.x][this.position.y], 'red');
                this.stats.baseAttackBonus++;
                this.maxHp += combat.calc(this.HD);
                this.hp = this.maxHp;
            }
        }

        swapPlaces(entity){

			var examinedCell1 = map.cells[this.position.level][this.position.x][this.position.y],
				examinedCell2 = map.cells[entity.position.level][entity.position.x][entity.position.y];

			examinedCell1.entity = entity;
			examinedCell2.entity = this;
			entity.swap.ready = false;
			entity.swap.entity = null;
            this.swap.ready = false;
            this.swap.entity = null;
		}
	}

    function fillLevelWithMonsters(level){

        var levelNumber = level, //level number from which we will choose monster
            chosenMonster,
            chosenLevel,
            levelArray = []; //array of numbers representing levels. We will choose random level from array, and random monster from array

		if(levelNumber > 6){

			levelNumber = 3;
		}else{

			levelNumber = (levelNumber % 2 === 0) ? levelNumber / 2 : (levelNumber - 1) / 2;
		}

        for(var i=0; i<3; i++){

            levelArray.push(levelNumber);
        }

        if(levelNumber > 0){

            levelNumber--;
            levelArray.push(levelNumber);
            levelArray.push(levelNumber);
        }

        if(levelNumber > 1){

            levelNumber--;
            levelArray.push(levelNumber);
        }

        for(var i=0; i<ROT.RNG.getUniformInt(6,8); i++){

            chosenLevel = levelArray.random();
            chosenMonster = monsterList.monsterList[chosenLevel].random().key;
            new Monster(level, chosenMonster);
        }
    }
	
	return{
		
		Monster: Monster,
		fillLevelWithMonsters: fillLevelWithMonsters
	}
});