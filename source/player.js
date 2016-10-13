define(['screen', 'map', 'noise', 'light', 'evHandlers'], function(screen, map, noise, light, evHandlers){	
	
	class Player{
		
		constructor(){
			
			var thatEntity = this;
			this.display = '@';
			this.fgColor = 'silver';
			this.bgColor = 'transparent';
			this.position = {};
			this.currentFov = [];
			
			this.abilities = {
				
				breatheUnderWater: false,
				isSuffocating: false,
				suffocateCounter: 0
			};
			
			this.modifiers = {
				
				
			};
			
			this.stats = {
				
				speed: 100,
				perception: 60
			};
			this.lookDescription = 'anonymous brave adventurer';
			this.type = {messageDisplay: 'you', type: 'player'};
			
			this.inventory = [];
			
			this.init();
			this.handleEvent = evHandlers.defaultEventHandler;
		}
		
		init(){
			
			var stairsUp = map.cells[0].stairsUp;
			
			this.position.level = 0;
			this.position.x = stairsUp.x;
			this.position.y = stairsUp.y;
			
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
			
			window.addEventListener('keydown', this, true);
			map.cells[this.position.level].time.engine.lock();
		}
		
		//handleEvent() - domyślna metoda przypisana metodzie addEventListener('keydown', this, true)
		
		handleEvent(ev){
			
		}
		
		//aktualizuje informację o graczu wyświetlane na ekranie
		
		updateScreenStats(){
			
			document.getElementById('domSpeed').innerHTML = this.stats.speed;
		}
		
		/*
		move() - funkcja odpowiedzialna za poruszanie się. x, y to wartości od -1 do 1 odpowiadające kierunkom ruchu poziomo/pionowo
		*/
		
		move(x, y){
			
			var tmpX = this.position.x + x,
				tmpY = this.position.y + y;
			
			this.terrainModifiers('remove');
			
			if(map.cells[this.position.level][tmpX][tmpY].entity != null && map.cells[this.position.level][tmpX][tmpY].entity != this){
				//TU BĘDZIE KOD ODPOWIEDZIALNY ZA ATAK
				screen.placeMessage('You bump into ' + map.cells[this.position.level][tmpX][tmpY].entity.type.name + '.');
				
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
			
			this.terrainModifiers('apply');
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
		terrainModifiers() - aplikuje lub usuwa (w zależności od parametru type, który może mieć dwie wartości: 'apply' lub 'remove') modyfikatory z pola na którym aktualnie przebywa gracz. Używana w metodzie move()
		*/
		
		terrainModifiers(type){
			
			var level = this.position.level,
				x = this.position.x,
				y = this.position.y,
				modifiers = map.cells[level][x][y].type.modifiers;
				
			for(var n in modifiers){
				
				if(type == 'apply'){
					
					this.stats[n] += modifiers[n];
				}else if(type == 'remove'){
					
					this.stats[n] -= modifiers[n];
				}
			}
		}
	}
	
	return{
		
		Player: Player
	}
});