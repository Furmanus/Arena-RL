define(['screen', 'map', 'noise', 'light', 'evHandlers', 'combat'], function(screen, map, noise, light, evHandlers, combat){	
	
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
				isSuffocating: false,
				canOpenDoors: true,
				suffocateCounter: 0
			};

			this.modifiers = [];
			this.terrainModifier = {source: undefined, stats: null};
			
			this.stats = {
				
				strength: 15,
				dexterity: 15,
				constitution: 15, 
				intelligence: 15, 
				wisdom: 15, 
				charisma: 15,
				
				speed: 30,
				perception: 60,
				
				baseAttackBonus: 1,
				defense: 10
			};
			
			this.HD = '1d8';
			this.hp = 8 + Math.floor(this.stats.constitution / 2 - 5);
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

            this.defaultWeapon = {name: 'fist', description: 'a fist', natural: true, damage: '1d2', critical: [20], dmgType: 'unarmed', criticalMultiplier: 2};
            this.weapon = this.defaultWeapon;
			
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
		}
		
		//getSpeed() - zwraca prędkość na potrzeby schedulera
		
		getSpeed(){
			
			return this.stats.speed;
		}
		
		//act() - metoda wywoływana domyślnie przez silnik czasu
		
		act(){
			
			this.terrainModifiers();
			this.doModifiers();
			window.addEventListener('keydown', this, true);
			map.cells[this.position.level].time.engine.lock();
		}
		
		//handleEvent() - domyślna metoda przypisana metodzie addEventListener('keydown', this, true)
		
		handleEvent(ev){
			
		}
		
		//aktualizuje informację o graczu wyświetlane na ekranie
		
		updateScreenStats(){
			
			document.getElementById('domSpeed').innerHTML = this.stats.speed;
            document.getElementById('domHp').innerHTML = this.hp;
            document.getElementById('domMaxHp').innerHTML = this.maxHp;
		}
		
		/*
		move() - funkcja odpowiedzialna za poruszanie się. x, y to wartości od -1 do 1 odpowiadające kierunkom ruchu poziomo/pionowo
		*/
		
		move(x, y){
			
			var tmpX = this.position.x + x,
				tmpY = this.position.y + y;
			
			if(map.cells[this.position.level][tmpX][tmpY].entity != null && map.cells[this.position.level][tmpX][tmpY].entity != this){
				
				combat.doCombatMelee(this, map.cells[this.position.level][tmpX][tmpY].entity);
				
				map.clearVisibility(map.cells[this.position.level]);
				screen.display.clear();
				this.currentFov = [];
				
				this.doFov(this);
				screen.drawVisibleCells(map.cells[this.position.level]);
				
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
				
						this.doFov(this);
						screen.drawVisibleCells(map.cells[this.position.level]);
				
						map.cells[this.position.level].time.engine.unlock();
					}
				}else if(walkAttempt == 'stop'){
				
					map.clearVisibility(map.cells[this.position.level]);
					screen.display.clear();
				
					this.doFov(this);
					screen.drawVisibleCells(map.cells[this.position.level]);
				
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
		terrainModifiers() - function applying terrain modifiers to player. Used at beginning of act() method.
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
                }else if(map.cells[level][x][y].type.type !== this.terrainModifier.source.type.type){

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
		
		/*
		function which iterates through player's modifiers array. If modifier wasn't activated, modifier is added to player corresponding stat. If modifier was activated, on each iteration function substracts one from counter value. If counter value equals zero, modifier is substracted from player corresponding stat and modifier itself is removed from array
		*/
		
		doModifiers(){
			
			for(var i=0; i<this.modifiers.length; i++){
				
				if(this.modifiers[i].applied === false){
					
					this.modifiers[i].applied = true;
					this.stats[this.modifiers[i].type] += this.modifiers[i].value;
					screen.placeMessage(this.modifiers[i].useText);
					this.updateScreenStats();
				}
				
				if(this.modifiers[i].counter === 0){
					
					this.stats[this.modifiers[i].type] -= this.modifiers[i].value;
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
	}
	
	return{
		
		Player: Player
	}
});