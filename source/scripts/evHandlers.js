/*
moduł funkcji odpowiedzialnych za zmiany na ekranie(wyświetlanie ekwipunku, komenda "look", itp.)
*/

define(['screen', 'map', 'generator'], function(screen, map, generator){
	
	/*
	obiekt odpowiedzialny za kierunki poruszania się postaci. Klucze to keycodesy przycisków na klawiaturze numerycznej
	*/
	
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
	
	//odwołania do funkcji odpowiedzialnych za różne rzeczy
	
	var actions = {
		
		73: displayInventory,
		76: look
	};
	
	var shiftActions = {
		
		191: displayInfo,
		188: ascendLevel,
		190: descendLevel
	};
	
	/*
	defaultEventHandler() - podstawowa funkcja odpowiedzialna za odczytywanie naciśniętych klawiszy. Aktywna na ekranie gry. W innych przypadkach (np. wyświetlanie ekwipunku), zastępowana przez inne funkcje
	*/
	
	function defaultEventHandler(ev){
		
		if(ev.which == 16){
			
			//nic się nie dzieje, shift naciśnięty sam nie powinien dawać żadnego efektu
		}else if(ev.shiftKey == false && (ev.which == 103 || ev.which == 104 || ev.which == 105 || ev.which == 102 || ev.which == 99 || ev.which == 98 || ev.which == 97 || ev.which == 100 || ev.which == 101)){
			
			this.move(moveActions[ev.which].x, moveActions[ev.which].y);
			map.cells[this.position.level].time.engine.unlock();
		}else if(ev.shiftKey == false && (ev.which == 73 || ev.which == 76)){
			
			if(ev.which == 76){
				
				actions[ev.which](this.position.x, this.position.y, this);
			}else{
				
				actions[ev.which](this);
			}
		}else if(ev.shiftKey == true && (ev.which == 191 || ev.which == 190 || ev.which == 188)){
			
			shiftActions[ev.which](this);
		}else{
			
			screen.placeMessage('Unknown command.');
		}
	}
	
	function ascendLevel(player){
		
		if(player.position.level == 0){
			
			screen.placeMessage('Stairs are blocked by pile of huge rocks. You can\'t pass that way.');
		}else{
			
			screen.display.clear();
			map.cells[player.position.level][player.position.x][player.position.y].entity = null;
			
			//zatrzymujemy silnik czasu na obecnym poziomie i usuwamy z niego gracza
			map.cells[player.position.level].time.engine.lock();
			map.cells[player.position.level].time.scheduler.remove(player);
			
			//aktualizujemy współrzędne gracza na nowy poziom i współrzędne schodów w górę
			player.position.level--;
			player.position.x = map.cells[player.position.level].stairsDown.x;
			player.position.y = map.cells[player.position.level].stairsDown.y;
			
			map.cells[player.position.level][player.position.x][player.position.y].entity = player;
			
			player.doFov(player);
			screen.drawVisibleCells(map.cells[player.position.level]);
			
			//dodajemy gracza do silnika czasu na nowym poziomie i uruchamiamy silnik
			map.cells[player.position.level].time.scheduler.add(player, true);
			map.cells[player.position.level].time.engine.start();
			
			screen.placeMessage('You climb up the stairs.');
		}
	}
	
	//funkcja uruchamiana w momencie zejścia przez gracza schodami w dół
	
	function descendLevel(player){
			
		//usuwamy gracza z pozycji schodów w dół aktualnego poziomu
		screen.display.clear();
		map.cells[player.position.level][player.position.x][player.position.y].entity = null;
			
		//zatrzymujemy silnik czasu na obecnym poziomie i usuwamy z niego gracza
		map.cells[player.position.level].time.engine.lock();
		map.cells[player.position.level].time.scheduler.remove(player);
		
		if(player.position.level == map.cells.maxDungeonLevel){
			
			//generujemy nowy poziom, jeżeli gracz znajduje się na najniższym obecnie wygenerowanym poziomie
			generator.generateRandomLevel();
		}
			
		//aktualizujemy współrzędne gracza na nowy poziom i współrzędne schodów w górę
		player.position.level++;
		player.position.x = map.cells[player.position.level].stairsUp.x;
		player.position.y = map.cells[player.position.level].stairsUp.y;
			
		map.cells[player.position.level][player.position.x][player.position.y].entity = player;
			
		player.doFov(player);
		screen.drawVisibleCells(map.cells[player.position.level]);
			
		//dodajemy gracza do silnika czasu na nowym poziomie i uruchamiamy silnik
		map.cells[player.position.level].time.scheduler.add(player, true);
		map.cells[player.position.level].time.engine.start();
			
		screen.placeMessage('You walk down the stairs.');
		
	}
	
	function displayInventory(player){
		
		screen.display.clear();
		screen.display.drawText(8, 2, 'Your current inventory:');
		player.handleEvent = inventoryEventHandler.bind(player);
		
		function inventoryEventHandler(ev){
			
			if(ev.which == 27){
				
				screen.display.clear();
				screen.drawVisibleCells(map.cells[this.position.level]);
				this.handleEvent = defaultEventHandler;
			}
		}
	}
	
	function displayInfo(player){
		
		screen.display.clear();
		screen.display.drawText(2, 2, '[a]About');
		screen.display.drawText(2, 3, '[b]Keybindings');
		
		player.handleEvent = infoEventHandler.bind(player);
		
		function infoEventHandler(ev){
			
			switch(ev.which){
				case 27:
				
				screen.display.clear();
				screen.drawVisibleCells(map.cells[this.position.level]);
				this.handleEvent = defaultEventHandler;
				
				break;
				
				case 65:
				
				screen.display.clear();
				screen.display.drawText(16, 2, 'Arena RL');
				screen.display.drawText(8, 3, 'Copyright 2016 by Furman');
				this.handleEvent = escapeEventHandler.bind(player);
				
				break;
				
				case 66:
				
				screen.display.clear();
				screen.display.drawText(14, 2, 'Keybindings');
				screen.display.drawText(1, 4, '[i] - inventory');
				screen.display.drawText(1, 5, '[l] - look');
				screen.display.drawText(1, 6, '[<] - go down');
				screen.display.drawText(1, 7, '[>] - go up');
				this.handleEvent = escapeEventHandler.bind(player);
				
				break
			}
		}
	}
	
	//event handler dla ekranów w których jedynym aktywnym przyciskiem jest escape
	
	function escapeEventHandler(ev){
		
		if(ev.which == 27){
			
			screen.display.clear();
			screen.drawVisibleCells(map.cells[this.position.level]);
			this.handleEvent = defaultEventHandler;
		}
	}
	
	/*
	look() - funkcja wyświetlająca opis aktualnego położenia kursora na ekranie. Startuje od pozycji na której znajduje się gracz, następnie wyświetla opis danego pola. Zastępuje podstawowy event listener swoim własnym. Następnie dla naciśniętego klawisza kierunku, funkcja wywołuje samą siebie dla innych współrzędnych
	*/
	
	function look(x,y, player){
		
		var level = player.position.level
			
		screen.display.clear();
		screen.drawVisibleCells(map.cells[player.position.level]);
			
		player.handleEvent = lookEventHandler.bind(player);
			
		if(map.cells[level][x][y].isVisible == true){
				
			screen.display.draw(x, y, ['_', getDisplayChar(x,y)] , getDisplayColor(x, y), 'cornflowerblue');
		}else{
				
			screen.display.draw(x, y, ['_'] , 'silver', 'transparent');
				
		}
			
		if(screen.lookCount == 0){
			
			screen.placeMessage(returnLookText(x,y));
			screen.lookCount ++;
				
		}else if(screen.lookCount > 0){
				
			document.getElementById('messageBox').lastChild.innerHTML = returnLookText(x,y);		
		}
			
		function lookEventHandler(ev){
			
			if(ev.which != 27 && ev.which != 32 && (ev.which == 103 || ev.which == 104 || ev.which == 105 || ev.which == 102 || ev.which == 99 || ev.which == 98 || ev.which == 97 || ev.which == 100)){
					
				if(x + moveActions[ev.which].x >= 0 && y + moveActions[ev.which].y >= 0 && x + moveActions[ev.which].x <= screen.options.width - 1 && y + moveActions[ev.which].y <= screen.options.height - 1){	
					
					look(x + moveActions[ev.which].x, y + moveActions[ev.which].y, this);
						
				}
			}else if(ev.which == 27 || ev.which == 32){
					
				screen.display.clear();
				screen.drawVisibleCells(map.cells[this.position.level]);
				this.handleEvent = defaultEventHandler;
				screen.lookCount = 0;
					
			}
		}
			
		function getDisplayChar(x,y){
				
			if(map.cells[level][x][y].entity != null){
					
				return map.cells[level][x][y].entity.display;
			}else {
					
				return map.cells[level][x][y].type.display;
			}
		}
		
		function getDisplayColor(x,y){
			
			if(map.cells[level][x][y].entity != null){
				
				return map.cells[level][x][y].entity.fgColor;
			}else {
				
				return map.cells[level][x][y].type.fgColor;
			}
		}
		
		function getDisplayBgColor(x,y){
		
			return map.cells[level][x][y].type.bgColor;
		}
		
		function returnLookText(x,y){
			
			var displayText;
			
			if(map.cells[level][x][y].isVisible === true){
				
				if(map.cells[level][x][y].entity != null){
				
					displayText = 'You see ' + map.cells[level][x][y].entity.lookDescription + '.';
					
					if(map.cells[level][x][y].isOnFire === true){
						
						displayText += ' Wild flames of fire are roaring here.';
					}
			
					return displayText;
				}else if(map.cells[level][x][y].entity == null){
				
					displayText = 'You see ' + map.cells[level][x][y].type.name + '.';
					
					if(map.cells[level][x][y].isOnFire === true){
						
						displayText += ' Wild flames of fire are roaring here.';
					}
				
					return displayText;
				}
			}else{
				
				displayText = 'You can\'t see that place.';
				
				return displayText;
			}
		}
	}
	
	return {
		
		displayInventory: displayInventory,
		defaultEventHandler: defaultEventHandler
	}
});