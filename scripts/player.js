define(['screen', 'map', 'noise', 'light', 'evHandlers', 'combat', 'status', 'messages'], function(screen, map, noise, light, evHandlers, combat, status, messages){

	var playerOptions = {

		name: undefined,
		class: undefined
	};

	class Player{
		
		constructor(){
			
			var thatEntity = this;
			this.display = '@';
			this.fgColor = 'silver';
			this.bgColor = 'transparent';
			this.size = 'medium';
			this.position = {};
			this.currentFov = [];
			
			this.abilities = {
				
				breatheUnderWater: false,
				canFly: false,
				cantDrinkPotions: false,
				isSuffocating: false,
				canOpenDoors: true,
				suffocateCounter: 0
			};

			this.modifiers = [];
			this.terrainModifier = {source: undefined, stats: null};
			this.equipmentModifiers = {
				
				'head': {},
				'torso': {},
				'right hand': {},
				'left hand': {},
				'legs': {},
				'feet': {}
			};
			
			this.stats = {
				
				strength: 15,
				dexterity: 15,
				constitution: 15,
				intelligence: 15, 
				wisdom: 15, 
				charisma: 15,
				
				speed: 30,
				perception: 50,
				
				baseAttackBonus: 1,
				defense: 10
			};
			
			this.HD = '1d8';
			this.hp = 8 + Math.floor(this.stats.constitution / 2 - 5) + 8;
			this.xp = 0;
			this.experience = 0;
			this.experienceLevel = 1;
			this.class = playerOptions.class;
			this.name = playerOptions.name;
            this.maxHp = this.hp;
			this.lookDescription = 'anonymous brave adventurer';
			this.type = {messageDisplay: 'you', type: 'player', species: 'human', family: 'player', name: 'you'};
			
			this.inventory = [];

            this.equipment = {

                'head': {description: 'empty'},
                'torso': {description: 'empty'},
                'right hand': {description: 'empty'},
                'left hand': {description: 'empty'},
                'legs': {description: 'empty'},
                'feet': {description: 'empty'}
            };

            this.status = {

				'prone': {value: 0, activatedEveryTurn: status.entityStatus.prone.activatedEveryTurn, activateEffect: status.entityStatus.prone.activateEffect, removeEffect: status.entityStatus.prone.removeEffect, initEffect: status.entityStatus.prone.initEffect,  modifiers: {}},

				'bleeding': {value: 0, activatedEveryTurn: status.entityStatus.bleeding.activatedEveryTurn, activateEffect: status.entityStatus.bleeding.activateEffect, removeEffect: status.entityStatus.bleeding.removeEffect, initEffect: status.entityStatus.bleeding.initEffect, modifiers: {}},

				'stunned': {value: 0, activatedEveryTurn: status.entityStatus.stunned.activatedEveryTurn, activateEffect: status.entityStatus.stunned.activateEffect, removeEffect: status.entityStatus.stunned.removeEffect, initEffect: status.entityStatus.stunned.initEffect, modifiers: {}, counter: 0},

				'poisoned': {value: 0, activatedEveryTurn: status.entityStatus.poisoned.activatedEveryTurn, activateEffect: status.entityStatus.poisoned.activateEffect, removeEffect: status.entityStatus.poisoned.removeEffect, initEffect: status.entityStatus.poisoned.initEffect, modifiers: {}, counter: 0},

                'paralyzed': {value: 0, activatedEveryTurn: status.entityStatus.paralyzed.activatedEveryTurn, activateEffect: status.entityStatus.paralyzed.activateEffect, removeEffect: status.entityStatus.paralyzed.removeEffect, initEffect: status.entityStatus.paralyzed.initEffect, modifiers: {}, counter: 0},

				'berserk': {value: 0, activatedEveryTurn: status.entityStatus.berserk.activatedEveryTurn, activateEffect: status.entityStatus.berserk.activateEffect, removeEffect: status.entityStatus.berserk.removeEffect, initEffect: status.entityStatus.berserk.initEffect, modifiers: {}, counter: 0}
			};

            this.defaultWeapon = {name: 'fist', description: 'a fist', natural: true, damage: '1d2', critical: [20], dmgType: 'unarmed', criticalMultiplier: 2, criticalHit: [null]};
            this.weapon = this.defaultWeapon;

            this.killCount = 0; //count of killed monsters
			this.deathCause = {type: undefined, source: undefined}; //either entity or object {type: {type: <cause of death>}} used in evHandlers module, generateDeathScreen method
			
			this.init();
			this.handleEvent = evHandlers.defaultEventHandler;
		}
		
		init(){
			
			var stairsUp = map.cells[0].stairsUp;
			
			this.position.level = 0;
			this.position.x = stairsUp.x;
			this.position.y = stairsUp.y;
			this.position.lastVisitedCell = null;
			
			map.cells[0][stairsUp.x][stairsUp.y].entity = this;
			map.cells[0].time.scheduler.add(this, true);
			this.doFov(this);
			screen.drawVisibleCells(map.cells[this.position.level]);
			
			this.updateScreenStats();
            document.getElementById('domDungeonLevel').innerHTML = this.position.level + 1;
		}
		
		//getSpeed() - zwraca prędkość na potrzeby schedulera
		
		getSpeed(){
			
			return this.stats.speed;
		}
		
		//act() - metoda wywoływana domyślnie przez silnik czasu
		
		act(){

			if(this.status.paralyzed.value !== 1) {

                this.terrainModifiers();
                this.doModifiers();
                window.addEventListener('keydown', this, true);
                this.applyStatus();
                this.gainLevel();
                map.cells[this.position.level].time.engine.lock();
            }else{

                //napisać kod odpowiedzialny za 100 ms przerwy pomiędzy kolejnymi uruchomieniami silnika
                this.terrainModifiers();
                this.doModifiers();
                this.applyStatus();
			}

			this.updateScreenStats();
		}
		
		//handleEvent() - domyślna metoda przypisana metodzie addEventListener('keydown', this, true)
		
		handleEvent(ev){
			
		}
		
		//aktualizuje informację o graczu wyświetlane na ekranie
		
		updateScreenStats(){
			
			document.getElementById('domSpeed').innerHTML = this.stats.speed;
            document.getElementById('domHp').innerHTML = this.hp;
            document.getElementById('domMaxHp').innerHTML = this.maxHp;
            document.getElementById('domStrength').innerHTML = this.stats.strength;
            document.getElementById('domDexterity').innerHTML = this.stats.dexterity;
            document.getElementById('domConstitution').innerHTML = this.stats.constitution;
            document.getElementById('domIntelligence').innerHTML = this.stats.intelligence;
            document.getElementById('domWisdom').innerHTML = this.stats.wisdom;
            document.getElementById('domCharisma').innerHTML = this.stats.charisma;
            document.getElementById('domPlayerName').innerHTML = this.name;
            document.getElementById('domPlayerLevel').innerHTML = this.experienceLevel + ' ';
            document.getElementById('domPlayerClass').innerHTML = this.class;

			for(var n in this.status){

				if(this.status[n].value === 1){

					document.getElementById(n).innerHTML = n;
				}else{

					document.getElementById(n).innerHTML = ' ';
				}
			}
		}
		
		/*
		move() - funkcja odpowiedzialna za poruszanie się. x, y to wartości od -1 do 1 odpowiadające kierunkom ruchu poziomo/pionowo. Trzeci argument opcjonalny, określa czy ruch jest losowy czy nie (przyjmuje wartosc true lub false)
		*/
		
		move(x, y, random){
			
			var tmpX,
				tmpY,
				randomX = [-1, 0, 1].random(),
				randomY = [-1, 0, 1].random();

			if(random === true){

				tmpX = this.position.x + randomX;
				tmpY = this.position.y + randomY;
			}else{

                tmpX = this.position.x + x;
				tmpY = this.position.y + y;
			}

			if(map.cells[this.position.level][tmpX][tmpY].entity != null && map.cells[this.position.level][tmpX][tmpY].entity != this){
				
				combat.doCombatMelee(this, map.cells[this.position.level][tmpX][tmpY].entity);
				
				map.clearVisibility(map.cells[this.position.level]);
				screen.display.clear();
				this.currentFov = [];
				
				this.doFov(this);
				screen.drawVisibleCells(map.cells[this.position.level]);
				//screen.drawCells(map.cells[this.position.level]);
				
				map.cells[this.position.level].time.engine.unlock();
				
			}else{
			
				var	walkAttempt = map.cells[this.position.level][tmpX][tmpY].type.walkAttempt(this, tmpX, tmpY);
				
				if(walkAttempt == 'continue'){
				
					if(map.cells[this.position.level][tmpX][tmpY].type.blockMovement === true){
				
						screen.placeMessage(screen.capitalizeString(map.cells[this.position.level][tmpX][tmpY].type.name) + ' is blocking your movement.');
					}else{
					
						map.clearVisibility(map.cells[this.position.level]);
						screen.display.clear();
						this.currentFov = [];
				
						map.cells[this.position.level][this.position.x][this.position.y].entity = null;
						this.position.lastVisitedCell = map.cells[this.position.level][this.position.x][this.position.y];
				
						this.position.x += x;
						this.position.y += y;
					
						map.cells[this.position.level][this.position.x][this.position.y].entity = this;
						map.cells[this.position.level][this.position.x][this.position.y].type.walkEffect(this, this.position.x, this.position.y);
					
						screen.placeMessage(map.cells[this.position.level][this.position.x][this.position.y].type.walkMessage);
						
						if(map.cells[this.position.level][this.position.x][this.position.y].isOnFire === true){
							//KOD ODPOWIEDZIALNY ZA OBRAŻENIA OD OGNIA, po zaimplementowaniu hp
							screen.placeMessage('There are roaring flames here! You are on fire!');
						}else if(map.cells[this.position.level][this.position.x][this.position.y].inventory.length === 1){
							
							screen.placeMessage('There is ' + map.cells[this.position.level][this.position.x][this.position.y].inventory[0].description + ' lying here.');
						}else if(map.cells[this.position.level][this.position.x][this.position.y].inventory.length > 1){
							
							screen.placeMessage('Several items are lying here.');
						}

						if(this.status.prone.value === 1){

							screen.placeMessage('You crawl.');
						}
				
						this.doFov(this);
						screen.drawVisibleCells(map.cells[this.position.level]);
						//screen.drawCells(map.cells[this.position.level]);
				
						map.cells[this.position.level].time.engine.unlock();
					}
				}else if(walkAttempt == 'stop'){
				
					map.clearVisibility(map.cells[this.position.level]);
					screen.display.clear();
				
					this.doFov(this);
					screen.drawVisibleCells(map.cells[this.position.level]);
					//screen.drawCells(map.cells[this.position.level]);
				
					map.cells[this.position.level].time.engine.unlock();
				}else if(walkAttempt == 'abort'){
				
					screen.placeMessage('You abort your attempt.');
				}	
			}
			
			this.updateScreenStats();
		}
		
		//kalkulacja aktualnego pola widzenia
		
		doFov(player){
		
		/*
		lightPasses(x,y) - funkcja przekazywana jako funkcja zwrotna do konstruktora obiektu ROT.FOV.PreciseShadowcasting. Określa dla danych współrzędnych x, y czy pole jest widoczne (zwraca wartość true) lub niewidoczne (zwraca wartość false).
		*/
		
			function lightPasses(x, y){
				
				if(x < 0 || y < 0 || x > screen.options.width - 1 || y > screen.options.height - 1){
					
					return false;
				}
				
				if(map.cells[player.position.level][player.position.x][player.position.y].type.type != 'deep water'){
					
					if(map.cells[player.position.level][x][y].type.blockFov === true && x == player.position.x && y == player.position.y){
					
						return true;
					}else if(map.cells[player.position.level][x][y].type.blockFov === false){
					
						return true;
					}else {
					
						return false;
					}
				}else if(map.cells[player.position.level][player.position.x][player.position.y].type.type == 'deep water'){
					
					if(screen.getDistanceSquare(x, y, player.position.x, player.position.y) < 2){
						
						return true;
					}else{
						
						return false;
					}
				}
			}
			
			var fov = new ROT.FOV.PreciseShadowcasting(lightPasses);
			
			/*
			obliczanie aktualnego pola widzenia dla punktu początkowego player.position.x i player.position.y i zasięgu r. Czwarty argument to funkcja zwrotna wywoływana dla tych współrzędnych x i y, dla których funkcja lightPasses zwraca wartość true
			*/
			
			fov.compute(player.position.x, player.position.y, 60, function(x, y, r, visibility){
				
				if(x < 0 || y < 0 || x > screen.options.width - 1 || y >  screen.options.height - 1){
					
					return;
				}else if(map.cells[player.position.level][x][y].isLit === true){
					
					map.cells[player.position.level][x][y].isVisible = true;
					map.cells[player.position.level][x][y].hasBeenDiscovered = true;
					player.currentFov.push({x: x, y: y});
				}else if(screen.getDistanceSquare(x, y, player.position.x, player.position.y) <= player.stats.perception){
					
					map.cells[player.position.level][x][y].isVisible = true;
					map.cells[player.position.level][x][y].hasBeenDiscovered = true;
					player.currentFov.push({x: x, y: y});
				}else {
					
					return;
				}
			});
		}
		
		/*
		terrainModifiers() - function applying terrain modifiers to player. Used at beginning of act() method. Current terrain modifiers are stored in entity this.terrainModifier object. This object has two cells: source which stores referrence to cell which is source to stored modifiers and stats which is object which holds modifiers to entity stats in form of object {statName: value}
		*/
		
		terrainModifiers(){
			
			var level = this.position.level,
				x = this.position.x,
				y = this.position.y,
				modifiers = map.cells[level][x][y].type.modifiers;
			//if newly stepped on cell has modifiers
			if(modifiers !== null){
				/*
				if current cell type is not equal to previous cell type, we remove all modifiers from current terrainModifier entity object, replace terrainModifier with new object with new source, and then we fill new terrainModifier object with modifiers from current source. In last step we apply new modifiers from terrainModifier
				*/
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
					
				/*
				if new cell type is same type as previously visited cell, nothing happens, we only update terrainModifier source (which doesn't really matter)
				*/
                }else if(map.cells[level][x][y].type.type === this.terrainModifier.source.type.type){

                    this.terrainModifier.source = map.cells[level][x][y];
                }
            }else if(modifiers === null){
				
				/*
				if newly stepped on cell has no modifiers, and previously visited cell had modifiers, we remove them, and update terrainModifer object with new source and set stats variable to null
				*/
				
                if(this.terrainModifier.stats !== null){

                    for(var n in this.terrainModifier.stats){

                        this.stats[n] -= this.terrainModifier.stats[n];
                    }
                }

                this.terrainModifier = {source: map.cells[level][x][y], stats: null};
            }
		}
		
		/*
		function which iterates through player's modifiers array. If modifier wasn't activated, modifier is added to player corresponding stat. If modifier was activated, on each iteration function substracts one from counter value. If counter value equals zero, modifier is substracted from player corresponding stat and modifier itself is removed from array
		*/
		
		doModifiers(){
			
			for(var i=0; i<this.modifiers.length; i++){
				
				if(this.modifiers[i].applied === false){
					
					this.modifiers[i].applied = true;
					
					for(var j=0; j<this.modifiers[i].type.length; j++){
						
						this.stats[this.modifiers[i].type[j].stat] += this.modifiers[i].type[j].value;
					}
					screen.placeMessage(this.modifiers[i].useText);
					this.updateScreenStats();
				}
				
				if(this.modifiers[i].counter === 0){
					
					for(var j=0; j<this.modifiers[i].type.length; j++){
						
						this.stats[this.modifiers[i].type[j].stat] -= this.modifiers[i].type[j].value;
					}
					
					screen.placeMessage(this.modifiers[i].wearOffText);
					this.modifiers.splice(i, 1);
					this.updateScreenStats();
					i--;
				}else{
					
					this.modifiers[i].counter--;
				}
			}
		}

		dropCorpse(){


        }

        dropWeapon(){

			if(this.equipment['right hand'].description !== 'empty'){

				screen.placeMessage('You drop your ' + this.equipment['right hand'].name + '(' + this.equipment['right hand'].damage + ').', 'red');
				map.cells[this.position.level][this.position.x][this.position.y].inventory.push(this.equipment['right hand']);
				this.equipment['right hand'].owner = this;
				this.equipment['right hand'] = {description: 'empty'};
				this.weapon = this.defaultWeapon;
			}
		}

        receiveDamage(number, source){

			this.hp -= number;

			if(this.hp < 1){

				map.cells[this.position.level].time.scheduler.remove(this);
				this.updateScreenStats();
				map.cells[this.position.level].time.engine.lock();
				this.handleEvent = function(){};
                screen.placeMessage('You die...');
				this.deathCause.type = source;
				evHandlers.generateDeathScreen(this);
			}else {

                screen.display.clear();
                screen.drawVisibleCells(map.cells[this.position.level]);
            }
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
		function responsible for gaining levels
		 */
		gainLevel(){

			if(this.experience >= screen.experienceTable[this.experienceLevel + 1].required){

				var gainedStat = screen.statGain[this.class].random();

				this.experienceLevel++;
				screen.placeMessage('You have gained a level!', 'blue');
				this.stats[gainedStat]++; //increase one random stat from class stats
				screen.placeMessage(messages.statGainMessages[gainedStat], 'blue');
				this.stats.baseAttackBonus++;
				this.maxHp += combat.calc(this.HD);
				this.hp = this.maxHp;
			}
		}
	}
	
	return{
		
		Player: Player,
		playerOptions: playerOptions
	}
});