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
		76: look,
		67: closeDoors,
		68: drop,
        69: equip,
		188: pickUp
	};

	var shiftActions = {

		191: displayInfo,
		188: ascendLevel,
		190: descendLevel
	};

	/*
	hash object containing parameters responsible for handling equip() function for different body parts
	 */

	var equip = {
		//HEAD
		65: ['head', 'helmets'], 66: ['torso', 'armours'], 67: ['right hand', 'weapons'], 68: ['left hand', 'miscellaneous'], 69: ['legs', 'legs'], 70: ['feet', 'boots']
	};

	/*
	defaultEventHandler() - podstawowa funkcja odpowiedzialna za odczytywanie naciśniętych klawiszy. Aktywna na ekranie gry. W innych przypadkach (np. wyświetlanie ekwipunku), zastępowana przez inne funkcje
	*/

	function defaultEventHandler(ev){

		if(ev.which == 16){

			//nic się nie dzieje, shift naciśnięty sam nie powinien dawać żadnego efektu
		}else if(ev.shiftKey === false && (ev.which === 103 || ev.which === 104 || ev.which === 105 || ev.which === 102 || ev.which === 99 || ev.which === 98 || ev.which === 97 || ev.which === 100 || ev.which === 101)){

			this.move(moveActions[ev.which].x, moveActions[ev.which].y);
			map.cells[this.position.level].time.engine.unlock();
		}else if(ev.shiftKey === false && (ev.which === 73 || ev.which === 76 || ev.which === 67 || ev.which === 188 || ev.which === 68 || ev.which === 69)){

			if(ev.which === 76 || ev.which === 67 || ev.which === 188 || ev.which === 68){

				actions[ev.which](this.position.x, this.position.y, this);
			}else{

				actions[ev.which](this);
			}
		}else if(ev.shiftKey === true && (ev.which === 191 || ev.which === 190 || ev.which === 188)){

			shiftActions[ev.which](this);
		}else{

			screen.placeMessage('Unknown command.');
		}
	}
	
	function ascendLevel(player){
		
		if(player.position.level === 0){
			
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
	
	function closeDoors(x, y, player){
		
		var openDoors = [];
		//check cells surrounding player for open doors and push thir coordinates to openDoors array
		for(var i=-1; i<=1; i++){
			
			for(var j=-1; j<=1; j++){
				
				if(i === 0 && j === 0){
					
					continue;
				}
				
				if(map.cells[player.position.level][x+i][y+j].type.type == 'open doors'){
					
					openDoors.push({x: x+i, y: y+j});
				}
			}
		}
		
		switch(openDoors.length){
			
			case 0:
				screen.placeMessage('There is nothing here you can close.');
				break;
				
			case 1:
					
				map.clearVisibility(map.cells[player.position.level]);
				screen.display.clear();
				
				map.setTerrain(player.position.level, openDoors[0].x, openDoors[0].y, 'closedDoors');
				
				player.currentFov = [];
				player.doFov(player);
				
				screen.drawVisibleCells(map.cells[player.position.level]);
				screen.placeMessage('You close the doors.');
				
				map.cells[player.position.level].time.engine.unlock();
				break;
				
			default:
				
				screen.placeMessage('Which door you want to close? (select direction 12346789)');
				player.handleEvent = closeDoorsEventHandler;
		}
		
		function closeDoorsEventHandler(ev){
			
			var direction = moveActions[ev.which];
			// if direction isn't undefined
			if(direction){
				
				if(checkForDoors(direction) === true && direction != {x: 0, y: 0}){
					
					map.setTerrain(player.position.level, x + direction.x, y + direction.y, 'closedDoors');
					
					screen.display.clear();
					map.clearVisibility(map.cells[player.position.level]);
					player.currentFov = [];
					player.doFov(player);
					
					screen.drawVisibleCells(map.cells[player.position.level]);
					screen.placeMessage('You close the doors.');
					
					player.handleEvent = defaultEventHandler;
					map.cells[player.position.level].time.engine.unlock();
				}else {
					
					screen.placeMessage('You can\'t close that.');
					player.handleEvent = defaultEventHandler;
				}
			}else {
				
				screen.placeMessage('You abort your attempt.');
				player.handleEvent = defaultEventHandler;
			}
			
			function checkForDoors(direction){
				
				for(var i=0; i<openDoors.length; i++){
					
					if(x + direction.x === openDoors[i].x && y + direction.y === openDoors[i].y){
						
						return true;
					}
				}
			}
		}
	}
	
	function displayInventory(player){
		
		screen.display.clear();
		
		player.handleEvent = inventoryEventHandler.bind(player);
		
		drawInventory(player);
		
		function inventoryEventHandler(ev){
			
			if(ev.which == 27){
				
				esc(player);
			}
		}
		
		function drawInventory(player){
			
			var drawnText;
			
			screen.display.drawText(8, 0, 'Your current inventory:');
			
			drawObjectInventory(player);
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
				screen.display.drawText(1, 8, '[c] - close');
				screen.display.drawText(1, 9, '[d] - drop');
				screen.display.drawText(1, 10, '[,] - pick up');
                screen.display.drawText(1, 11, '[e] - equip/unequip items');
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
			
		if(map.cells[level][x][y].isVisible === true){
				
			screen.display.draw(x, y, ['_', getDisplayChar(x,y)] , getDisplayColor(x, y), 'cornflowerblue');
		}else{
				
			screen.display.draw(x, y, ['_'] , 'silver', 'transparent');
				
		}
			
		if(screen.lookCount === 0){
			
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
				}else if(map.cells[level][x][y].entity === null && map.cells[level][x][y].inventory.length === 0){
				
					displayText = 'You see ' + map.cells[level][x][y].type.name + '.';
					
					if(map.cells[level][x][y].isOnFire === true){
						
						displayText += ' Wild flames of fire are roaring here.';
					}
				
					return displayText;
				}else if(map.cells[level][x][y].entity === null && map.cells[level][x][y].inventory.length === 1){
					
					displayText = 'You see ' + map.cells[level][x][y].inventory[0].description + '.';
					
					if(map.cells[level][x][y].isOnFire === true){
						
						displayText += ' Wild flames of fire are roaring here.';
					}
				
					return displayText;
				}else if(map.cells[level][x][y].entity === null && map.cells[level][x][y].inventory.length > 1){
					
					displayText = 'Several items are lying here.';
					
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
	
	function verifyNeighbour(level, x, y, cellType){
		
		var count = 0;
		
		for(var i=-1; i<=1; i++){
			
			for(var j=-1; j<=1; j++){
				
				if(map.cells[level][x+i][y+j].type.type == cellType){
					
					count++;
				}
			}
		}
		
		return count;
	}
	
	function pickUp(x, y, player){
		
		var level = player.position.level;
        //list of items with identifiers returned from drawObjectInventory() function, inside displayGroundItems() function
        var list;
		
		if(map.cells[level][x][y].inventory.length === 0){
			
			screen.placeMessage('There isn\'t anything to pick up here.');
		}else if(map.cells[level][x][y].inventory.length === 1 && player.inventory.length <= 12){
			
			screen.placeMessage('You pick up ' + map.cells[level][x][y].inventory[0].description + '.');
			player.inventory.push(map.cells[level][x][y].inventory.splice(0,1)[0]);
			
			screen.display.clear();
			map.clearVisibility(map.cells[level]);
			player.currentFov = [];
			player.doFov(player);
			screen.drawVisibleCells(map.cells[level]);
			
			map.cells[level].time.engine.unlock();
		}else if(map.cells[level][x][y].inventory.length > 1 && player.inventory.length <= 12){
			
			displayGroundItems(level, x, y);
		}else if(player.inventory.length > 12){
			
			screen.placeMessage('Your inventory is full. You can\'t carry anything more.');
		}
		
		function displayGroundItems(level, x, y){
			
			var drawnText;
			
			screen.display.clear();
			player.handleEvent = pickUpEventHandler;
			screen.display.drawText(8, 0, 'Select item to pick up:');
			
			list = drawObjectInventory(map.cells[level][x][y]);
		}
		
		function pickUpEventHandler(ev){
			
			if(ev.which === 27){
				
				esc(player);
			}else if(map.cells[level][x][y].inventory[ev.which - 65] != undefined){
                /*
                 we look for item identifier in list array. Because list is sorted alphabetically, item position in screen display is not the same as position in player inventory
                 */
                var identifier = list[ev.which - 65].identifier;

				screen.placeMessage('You pick up ' + map.cells[level][x][y].inventory[identifier].description + '.');
                //remove item from cell inventory list and push it into player inventory
				this.inventory.push(map.cells[level][x][y].inventory.splice(identifier, 1)[0]);
				
				esc(player);
				
				map.cells[level].time.engine.unlock();		
			}
		}
	}

	function equip(player){
        //first we draw body slots and their equipment on screen
        var drawnText = 'Select body part to equip/unequip:',
            currentRow = 2;

        screen.display.clear();
        player.handleEvent = equipEventHandler;
        screen.display.drawText(Math.floor((screen.options.width - drawnText.length) / 2), 0, drawnText);

        for(var n in player.equipment){

            drawnText = '%c{darkgoldenrod}[' + String.fromCharCode(96 + (currentRow / 2)) + ']' + n + '%c{}: ' + screen.removeFirst(player.equipment[n].description);
            screen.display.drawText(0, currentRow, drawnText);

            currentRow += 2;
        }

        function equipEventHandler(ev){

            if(ev.which === 27){

                esc(player);
            }else if(ev.which === 65 || ev.which === 66 || ev.which === 67 || ev.which === 68 || ev.which === 69 || ev.which === 70){
                /*
                we call equipItem function bound to player. First argument is choosen body slot, second is item type suitable for that body slot
                 */
                equipItem.bind(player)(equip[ev.which][0], equip[ev.which][1]);
            }
        }

        function equipItem(equipmentType, itemType){

            var list;

            screen.display.clear();

            if(this.equipment[equipmentType].description === 'empty') {

                screen.display.drawText(5, 0, 'Select item you want to equip:');
                //we draw on screen only item of type suitable to choosen body part
                list = drawObjectTypeInventory(this, itemType);

                this.handleEvent = wearEventHandler;
            }else {

                screen.placeMessage('You remove ' + this.equipment[equipmentType].description + '.');
                this.inventory.push(this.equipment[equipmentType]);
                this.equipment[equipmentType] = {description: 'empty'};

                esc(this);
                map.cells[this.position.level].time.engine.unlock();
            }

            function wearEventHandler(ev) {

                if (ev.which === 27) {

                    esc(this);
                }else if(ev.which - 65 < list.length) {

                    var identifier = list[ev.which - 65].identifier;

                    screen.placeMessage('You equip ' + this.inventory[identifier].description + '.');
                    this.equipment[equipmentType] = this.inventory.splice(identifier, 1)[0];

                    esc(this);
                    map.cells[this.position.level].time.engine.unlock();
                }
            }
		}
	}
	
	function drop(x, y, player){
		
		var level = player.position.level;
        //list of items with identifiers returned from drawObjectInventory() function
        var list;
		
		if(player.inventory.length === 0){
			
			screen.placeMessage('Your inventory is empty.');
		}else{
			
			screen.display.clear();
			player.handleEvent = dropEventHandler;
			screen.display.drawText(10, 0, 'Select item to drop:');
            //we draw inventory objects sorted alphabetically
			list = drawObjectInventory(player);
		}
		
		function dropEventHandler(ev){
			
			if(ev.which === 27){
				
				esc(player);
			}else if(player.inventory[ev.which - 65] != undefined){
			    /*
			    we look for item identifier in list array. Because list is sorted alphabetically, item position in screen display is not the same as position in player inventory
			     */
				var identifier = list[ev.which - 65].identifier;

				screen.placeMessage('You drop ' + player.inventory[identifier].description + '.');
				
				if(map.cells[player.position.level][player.position.x][player.position.y].inventory.length <= 12){
									
					map.cells[player.position.level][player.position.x][player.position.y].inventory.push(player.inventory.splice(identifier, 1)[0]);
				}else{
					/*
					if map cell inventory is full(has 12 items), we iterate through all neighbour cells. If examined cell doesn't block movement and doesn't have full inventory, item is dropped there
					*/
					var examinedCell;
					
					for(var n in moveActions){
						
						examinedCell = map.cells[player.position.level][player.position.x + moveActions[n].x][player.position.y + moveActions[n].y];
						
						if(examinedCell.type.blockMovement == false && examinedCell.inventory.length <= 12){
						
							examinedCell.inventory.push(player.inventory.splice(identifier, 1)[0]);
							break;
						}
					}
				}
				
				esc(player);
				
				map.cells[player.position.level].time.engine.unlock();
			}
		}
	}
	/*
	drawObjectInventory(object) - function responsible for drawing object(player, monster, map cell) inventory on screen. Object drawn are sorted alphabetically. First we iterate through object inventory and push all items into list array, with their type and identifier which tells item index in object's inventory. Next list is sorted and result is drawn on screen. Function returns list, so identifiers can be used in functions responsible for picking up, droping, etc.
	*/
	function drawObjectInventory(object){

	    var list = [],
			itemClass = null,
			drawnText,
			currentRow = 2;

        for(var i=0; i<object.inventory.length; i++){

            list.push({item: object.inventory[i], type: object.inventory[i].type, identifier: i});
        }

        screen.bubbleSort(list, 'type');

        for(var i=0; i<list.length; i++){
			
			/*
			we draw item type name between different item types. In each step we compare currently examined item type. If it isn't equal to previously drawn item type, we draw it, and change value of itemClass to new type
			*/
			if(list[i].type != itemClass){
				
				itemClass = list[i].type;
				drawnText = '----- ' + list[i].type + ' -----';
				screen.display.drawText(Math.floor((screen.options.width - drawnText.length) / 2), currentRow, drawnText);
				currentRow++;
			}

            drawnText = '%c{darkgoldenrod}[' + String.fromCharCode(97+i) + ']%c{}' + screen.removeFirst(list[i].item.description);
            screen.display.drawText(1, currentRow, drawnText);
			
			currentRow++;
        }

        return list;
	}

    //similiar to function drawObjectInventory(), but we draw only certain type of items
    function drawObjectTypeInventory(object, type){

        var list = [],
            itemClass = null,
            drawnText,
            currentRow = 2;

        for(var i=0; i<object.inventory.length; i++){

			if(object.inventory[i].type === type) {

				list.push({item: object.inventory[i], type: object.inventory[i].type, identifier: i});
			}
        }

        screen.bubbleSort(list, 'type');

        for(var i=0; i<list.length; i++){

            if(list[i].item.type === type) {

                drawnText = '%c{darkgoldenrod}[' + String.fromCharCode(97 + i) + ']%c{}' + screen.removeFirst(list[i].item.description);
                screen.display.drawText(1, currentRow, drawnText);

                currentRow++;
            }
        }

        return list;
    }

	//wyjście z danego ekranu z powrotem do głównego ekranu gry
	function esc(player){

        screen.display.clear();
        screen.drawVisibleCells(map.cells[player.position.level]);
        player.handleEvent = defaultEventHandler;
    }
	
	return {
		
		displayInventory: displayInventory,
		defaultEventHandler: defaultEventHandler
	}
});