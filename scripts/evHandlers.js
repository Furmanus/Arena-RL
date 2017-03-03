/*
moduł funkcji odpowiedzialnych za zmiany na ekranie(wyświetlanie ekwipunku, komenda "look", itp.)
*/

define(['screen', 'map', 'generator'], function(screen, map, generator){

	var textPlaced = 0;

	var aimInitiated = false;

	var numberKeysMap = {

		49: '1',
		97: '1',
        50: '2',
        98: '2',
        51: '3',
        99: '3',
        52: '4',
        100: '4',
        53: '5',
        101: '5',
        54: '6',
        102: '6',
        55: '7',
        103: '7',
        56: '8',
        104: '8',
        57: '1',
        105: '1',
        48: '0',
        96: '0'
	};

	/*
	obiekt odpowiedzialny za kierunki poruszania się postaci. Klucze to keycodesy przycisków na klawiaturze numerycznej
	*/

	var moveActions = {
		103: {x: -1, y: -1},
        89: {x: -1, y: -1},
		36: {x: -1, y: -1},
		104: {x: 0,y: -1},
		38: {x: 0,y: -1},
        75: {x: 0,y: -1},
		105: {x: 1, y: -1},
        85: {x: 1, y: -1},
		33: {x: 1, y: -1},
		102: {x: 1, y: 0},
		39: {x: 1, y: 0},
        76: {x: 1, y: 0},
		99: {x: 1, y: 1},
        78: {x: 1, y: 1},
		34: {x: 1, y: 1},
		98: {x: 0, y: 1},
		40: {x: 0, y: 1},
        74: {x: 0, y: 1},
		97: {x: -1, y: 1},
        66: {x: -1, y: 1},
		35: {x: -1, y: 1},
		100: {x: -1, y: 0},
        72: {x: -1, y: 0},
		37: {x: -1, y: 0},
		101: {x: 0, y: 0},
        190: {x: 0, y: 0}
	};

	//odwołania do funkcji odpowiedzialnych za różne rzeczy

	var actions = {

		73: displayInventory,
		88: look,
		67: closeDoors,
		68: drop,
        69: equip,
		81: quaff,
		82: read,
		77: reveal,
		70: aim,
		188: pickUp
	};

	var shiftActions = {

		191: displayInfo,
		188: ascendLevel,
		190: descendLevel,
		82: rise
	};

	/*
	hash object containing parameters responsible for handling equip() function for different body parts
	 */

	var equip = {
		
		65: ['head', 'helmets'], 66: ['torso', 'armours'], 67: ['right hand', 'weapons'], 68: ['left hand', 'ammunition'], 69: ['legs', 'legs'], 70: ['feet', 'boots']
	};

	/*
	defaultEventHandler() - podstawowa funkcja odpowiedzialna za odczytywanie naciśniętych klawiszy. Aktywna na ekranie gry. W innych przypadkach (np. wyświetlanie ekwipunku), zastępowana przez inne funkcje
	*/

	function defaultEventHandler(ev){

		if(ev.which == 16){

			//nic się nie dzieje, shift naciśnięty sam nie powinien dawać żadnego efektu
		}else if(ev.shiftKey === false && (ev.which === 103 || ev.which === 104 || ev.which === 105 || ev.which === 102 || ev.which === 99 || ev.which === 98 || ev.which === 97 || ev.which === 100 || ev.which === 101 || ev.which === 89 || ev.which === 75 || ev.which === 85 || ev.which === 76 || ev.which === 78 || ev.which === 74 || ev.which === 66 || ev.which === 72 || ev.which === 190 || ev.which === 37 || ev.which === 38 || ev.which === 39 || ev.which === 40 || ev.which === 36 || ev.which === 35 || ev.which === 33 || ev.which === 34)){

			this.move(moveActions[ev.which].x, moveActions[ev.which].y);
		}else if(ev.shiftKey === false && (ev.which === 73 || ev.which === 76 || ev.which === 67 || ev.which === 188 || ev.which === 68 || ev.which === 69 || ev.which === 81 || ev.which === 82 || ev.which === 88 || ev.which === 77 || ev.which === 70)){

			if(ev.which === 88 || ev.which === 67 || ev.which === 188 || ev.which === 68 || ev.which === 70){

				actions[ev.which](this.position.x, this.position.y, this);
			}else{

				actions[ev.which](this);
			}
		}else if(ev.shiftKey === true && (ev.which === 191 || ev.which === 190 || ev.which === 188 || ev.which === 82)){

			shiftActions[ev.which](this);
		}else{

			screen.placeMessage('Unknown command.');
		}
	}
	
	function ascendLevel(player){
		
		if(player.position.level === 0 && map.cells[player.position.level][player.position.x][player.position.y].type.type === 'stairs up'){
			
			screen.placeMessage('Stairs are blocked by pile of huge rocks. You can\'t pass that way.');
		}else if(map.cells[player.position.level][player.position.x][player.position.y].type.type === 'stairs up'){
			
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

			document.getElementById('domDungeonLevel').innerHTML = player.position.level + 1;
		}else{

			screen.placeMessage('You can\'t climb up here.');
		}
	}
	
	//funkcja uruchamiana w momencie zejścia przez gracza schodami w dół
	
	function descendLevel(player){

		if(map.cells[player.position.level][player.position.x][player.position.y].type.type === 'stairs down') {

            //usuwamy gracza z pozycji schodów w dół aktualnego poziomu
            screen.display.clear();
            map.cells[player.position.level][player.position.x][player.position.y].entity = null;

            //zatrzymujemy silnik czasu na obecnym poziomie i usuwamy z niego gracza
            map.cells[player.position.level].time.engine.lock();
            map.cells[player.position.level].time.scheduler.remove(player);

            if (player.position.level == map.cells.maxDungeonLevel) {

                var monster = require('monster');
                var items = require('items');
                //generujemy nowy poziom, jeżeli gracz znajduje się na najniższym obecnie wygenerowanym poziomie
                generator.generateRandomLevel();
                monster.fillLevelWithMonsters(map.cells.maxDungeonLevel);
                items.fillLevelWithItems(map.cells.maxDungeonLevel);
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
            document.getElementById('domDungeonLevel').innerHTML = player.position.level + 1;
        }else{

            screen.placeMessage('You can\'t climb down here.');
		}
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
		
		var list;
		
		screen.display.clear();
		screen.display.setOptions(screen.screenOptions);
		
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
			
			list = drawObjectInventory(player);
			
			player.handleEvent = selectItemInventory;
			
			function selectItemInventory(ev){
				
				if(ev.which === 27){
					
					esc(player);
				}else if(ev.which - 65 < list.length){
					
					var identifier = list[ev.which - 65].identifier;
					
					drawnText = '%c{' + this.inventory[identifier].fgColor + '}' + this.inventory[identifier].display + ' %c{}' + this.inventory[identifier].name;

					if(this.inventory[identifier].type === 'weapons'){

						drawnText += ' [' + this.inventory[identifier].damage + ']';

						if(this.inventory[identifier].sort === 'ranged'){

							drawnText += '[' + this.inventory[identifier].range + ']';
						}
					}else if(this.inventory[identifier].type === 'armours' || this.inventory[identifier].type === 'helmets' || this.inventory[identifier].type === 'legs' || this.inventory[identifier].type === 'boots'){

						drawnText += ' [' + this.inventory[identifier].armourBonus + ']';
					}
					
					screen.display.clear();
					screen.display.drawText(Math.floor((screen.displayOptions.width - this.inventory[identifier].display.length - this.inventory[identifier].name.length) / 2), 1, drawnText);
				}
			}
		}
	}
	
	function displayInfo(player){
		
		screen.display.clear();
        screen.display.setOptions(screen.screenOptions);
		screen.display.drawText(2, 2, '[a]About');
		screen.display.drawText(2, 3, '[b]Keybindings');
		
		player.handleEvent = infoEventHandler.bind(player);
		
		function infoEventHandler(ev){
			
			switch(ev.which){
				case 27:
				
				screen.display.clear();
                screen.display.setOptions(screen.displayOptions);
				screen.drawVisibleCells(map.cells[this.position.level]);
				this.handleEvent = defaultEventHandler;
				
				break;
				
				case 65:
				
				screen.display.clear();
				screen.display.drawText(8, 2, 'Arena RL version 0.1');
				screen.display.drawText(8, 3, 'Copyright 2016 - 2017 by Furman');
                screen.display.drawText(8, 4, 'e-mail: furmanus@gmail.com');
				this.handleEvent = escapeEventHandler.bind(player);
				
				break;
				
				case 66:
				
				screen.display.clear();
				screen.display.drawText(14, 2, 'Keybindings');
				screen.display.drawText(1, 4, '[i] - inventory');
				screen.display.drawText(1, 5, '[x] - look');
				screen.display.drawText(1, 6, '[<] - go down');
				screen.display.drawText(1, 7, '[>] - go up');
				screen.display.drawText(1, 8, '[c] - close');
				screen.display.drawText(1, 9, '[d] - drop');
				screen.display.drawText(1, 10, '[,] - pick up');
                screen.display.drawText(1, 11, '[e] - equip/unequip items');
				screen.display.drawText(1, 12, '[q] - drink');
                screen.display.drawText(1, 13, '[f] - shoot with ranged weapon');
				screen.display.drawText(1, 14, '[r] - read');
				screen.display.drawText(1, 15, '[R] - rise on feet/fall on ground');
                screen.display.drawText(1, 16, 'numpad 1,4,7,8,9,6,3,2 - movement');
				screen.display.drawText(1, 17, 'h,j,k,l,y,u,b,n - movement');
				screen.display.drawText(1, 18, 'home,end,pgUp,pgDown - diagonal move');
                screen.display.drawText(1, 19, '. or numpad 5 - wait a turn');
				this.handleEvent = escapeEventHandler.bind(player);
				
				break
			}
		}
	}
	
	//event handler dla ekranów w których jedynym aktywnym przyciskiem jest escape
	
	function escapeEventHandler(ev){
		
		if(ev.which == 27){
			
			screen.display.clear();
            screen.display.setOptions(screen.displayOptions);
			screen.drawVisibleCells(map.cells[this.position.level]);
			this.handleEvent = defaultEventHandler;
		}
	}
	
	/*
	look() - funkcja wyświetlająca opis aktualnego położenia kursora na ekranie. Startuje od pozycji na której znajduje się gracz, następnie wyświetla opis danego pola. Zastępuje podstawowy event listener swoim własnym. Następnie dla naciśniętego klawisza kierunku, funkcja wywołuje samą siebie dla innych współrzędnych
	*/
	
	function look(x, y, player){
		
		var level = player.position.level,
			screenDisplay = {x: screen.convertCoordinate(x, 'width'), y: screen.convertCoordinate(y, 'height')}; //x and y position converted to x and y screen display position
			
		screen.display.clear();
		screen.drawVisibleCells(map.cells[player.position.level]);
			
		player.handleEvent = lookEventHandler.bind(player);
			
		if(map.cells[level][x][y].isVisible === true){
				
			screen.display.draw(screenDisplay.x, screenDisplay.y, ['_', getDisplayChar(x,y)] , getDisplayColor(x, y), 'cornflowerblue');
		}else{
				
			screen.display.draw(screenDisplay.x, screenDisplay.y, ['_'], 'silver', 'transparent');
				
		}
			
		if(screen.lookCount === 0){
			
			screen.placeTemporaryMessage(returnLookText(x,y));
			screen.lookCount ++;
				
		}else if(screen.lookCount > 0){
				
			document.getElementById('messageBox').lastChild.innerHTML = returnLookText(x,y);		
		}
			
		function lookEventHandler(ev){
			
			if(ev.which !== 27 && ev.which !== 32 && (ev.which === 103 || ev.which === 104 || ev.which === 105 || ev.which === 102 || ev.which === 99 || ev.which === 98 || ev.which === 97 || ev.which === 100)){
					
				if(x + moveActions[ev.which].x >= 0 && y + moveActions[ev.which].y >= 0 && x + moveActions[ev.which].x <= screen.options.width - 1 && y + moveActions[ev.which].y <= screen.options.height - 1){
					
					look(x + moveActions[ev.which].x, y + moveActions[ev.which].y, this);
						
				}
			}else if(ev.which === 27 || ev.which === 32){

				screen.display.clear();
				screen.drawVisibleCells(map.cells[this.position.level]);
				this.handleEvent = defaultEventHandler;
				screen.lookCount = 0;
				document.getElementById('messageBox').removeChild(document.getElementById('messageBox').childNodes[document.getElementById('messageBox').childNodes.length - 1]);
					
			}else if(ev.which === 77){
				
				if(map.cells[level][x][y].entity !== null){
					
					displayMonsterInfo(map.cells[level][x][y].entity);
					this.handleEvent = function(ev){
						
						screen.display.clear();
                        screen.display.setOptions(screen.displayOptions);
						screen.drawVisibleCells(map.cells[this.position.level]);
						this.handleEvent = defaultEventHandler;
						screen.lookCount = 0;
						document.getElementById('messageBox').removeChild(document.getElementById('messageBox').childNodes[document.getElementById('messageBox').childNodes.length - 1]);
					};
				}
			}
		}
		
		function displayMonsterInfo(entity){
			
			var drawnText = '%c{' + entity.fgColor + '}' + entity.display +  '%c{} level ' + entity.experienceLevel + ' ' + (entity.type.type === 'player' ? entity.class : entity.type.messageDisplay),
				stats = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma', 'speed', 'defense'],
				properties = {'breatheUnderWater': {description: 'can swim'}, 'canFly': {description: 'flying'}, 'canOpenDoors': {description: 'can open doors'}, 'fearless': {description: 'fearless'}, 'cantDrinkPotions': {description: 'can\'t drink potions'}, 'illiterate': {description: 'illiterate'}, 'mindless': {description: 'mindless'}},
				propertyNumber = 0,
				equipmentNumber = 0;
			
			screen.display.clear();
            screen.display.setOptions(screen.screenOptions);
			screen.display.drawText(Math.floor((screen.options.width - drawnText.length) / 2), 0, drawnText);
			
			for(var i=0; i<stats.length; i++){
				
				drawnText = stats[i] + addWhiteSpaces(stats[i], 12) + ': ' + entity.stats[stats[i]]
				screen.display.drawText(1, 2 + i, drawnText);
			}
			
			screen.display.drawText(20, 2, 'hit points: ' + entity.hp + '/' + entity.maxHp);
			screen.display.drawText(20, 3, 'base to hit: ' + entity.stats.baseAttackBonus);
			screen.display.drawText(20, 4, 'size: ' + entity.size);

			if(entity.type.type === 'player') {

                screen.display.drawText(20, 5, 'xp: ' + entity.experience + '/' + screen.experienceTable[entity.experienceLevel + 1].required);
            }else{

                screen.display.drawText(20, 5, 'xp: ' + entity.xp);
			}
			
			drawnText = '%c{darkgoldenrod}weapon: %c{}' + entity.weapon.name + ' [' + entity.weapon.damage + ']';
			screen.display.drawText(1, 11, drawnText);
			
			for(var n in entity.equipment){
				
				if(entity.equipment[n].type !== 'weapons' && n !== 'right hand' && n !== 'left hand'){
					
					drawnText = '%c{darkgoldenrod}' + n + ':%c{} ' + screen.removeFirst(entity.equipment[n].description) + (entity.equipment[n].description === 'empty' ? '' : ('[' + entity.equipment[n].armourBonus + ']'));
					screen.display.drawText(1, 12 + equipmentNumber, drawnText);
					equipmentNumber++;
				}
			}
			
			for(var n in properties){
				
				if(entity.abilities[n] === true){
					
					drawnText = '%c{darkgoldenrod}' + properties[n].description;
					screen.display.drawText(1, 20 + propertyNumber, drawnText);
					propertyNumber++;
				}
			}
			
			//adds white spaces to string in number equal to difference between string length and goal
			
			function addWhiteSpaces(string, goal){
				
				var number = goal - string.length,
					result = '';
					
				for(var i=0; i<number; i++){
					
					result += ' ';
				}
				
				return result;
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

					displayText = 'You see ' + map.cells[level][x][y].entity.lookDescription;

					if(verifySpecialStatus(map.cells[level][x][y].entity) === true){

						var stateList = [];

						statusList = Object.keys(map.cells[level][x][y].entity.status);

						displayText += ' (';

						for(var i=0; i<statusList.length; i++){

							if(map.cells[level][x][y].entity.status[statusList[i]].value === 1) {

								stateList.push(statusList[i]);
							}
						}

						displayText += stateList.join(', ');
						displayText += ')';
					}

					displayText += '. [M]ore...';

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

                    var examinedItem = map.cells[level][x][y].inventory[0];

					displayText = 'You see ' + (examinedItem.stackable === true ? (examinedItem.quantity > 1 ? ('bundle of ' + examinedItem.quantity + ' ' ) : '') : '') + (examinedItem.stackable === true ? (examinedItem.quantity > 1 ? screen.removeFirst(examinedItem.description) : examinedItem.description) : examinedItem.description) + (examinedItem.stackable === true ? (examinedItem.quantity > 1 ? ('s' + ' ' ) : '') : '');

					if(examinedItem.type === 'weapons'){

						displayText += ' [' + examinedItem.damage + ']';

						if(examinedItem.sort === 'ranged'){

							displayText += '[' + examinedItem.range + ']';
						}
					}else if(examinedItem.type === 'armours' || examinedItem.type === 'helmets' || examinedItem.type === 'legs' || examinedItem.type === 'boots'){

						displayText += ' [' + examinedItem.armourBonus + ']';
					}

					displayText += ' lying here.';
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
			/*
			function used to verify whether entity has any special status (confusion, bleeding, prone, etc.) active
			 */
			function verifySpecialStatus(entity){

				for(var n in entity.status){

					if(entity.status[n].value === 1){

						return true;
					}
				}
			}
		}
	}

	function aim(x, y, player){

		if(player.weapon.sort === 'ranged') {

			if(player.equipment['left hand'].name !== player.weapon.ammoType){

				screen.placeMessage('You need to equip proper ammunition.');
			}else {

                var level = player.position.level,
					hostileCoords = returnHostileCoords(player);

                if(x === player.position.x && y === player.position.y && aimInitiated === false) {

                	if(hostileCoords && screen.getDistance(x, y, hostileCoords.x, hostileCoords.y) < player.weapon.range * 1.5) {

                        x = hostileCoords ? hostileCoords.x : x;
                        y = hostileCoords ? hostileCoords.y : y;
                    }

                    aimInitiated = true;
                }

                var newX = x,
                    newY = y,
                    pathfinding = require('pathfinding'),
                    returnedAimText = returnLookText(x, y),
                    blockingCells = ['wall', 'bush', 'tree', 'dead tree', 'closed doors'],
                    bresenhamLine = pathfinding.bresenham(player.position.x, player.position.y, x, y, player, blockingCells),
                    convertedCoordinateX, //map coordinates converted to current screen coordinates
                    convertedCoordinateY,
                    combat = require('combat');

                if (textPlaced) {
                    //if in last iteration text was placed inside message box, we remove it
					for(var i=0; i<textPlaced; i++) {

                        document.getElementById('messageBox').removeChild(document.getElementById('messageBox').lastChild);
                    }

                    textPlaced = 0;
                }

                screen.display.clear();
                screen.drawVisibleCells(map.cells[player.position.level]);

                //we draw bresenham line to current x and y coordinates, first converting them into screen coordinates
                for (var i = 0; i < bresenhamLine.length; i++) {

                    convertedCoordinateX = screen.convertCoordinate(bresenhamLine[i].x, 'width');
                    convertedCoordinateY = screen.convertCoordinate(bresenhamLine[i].y, 'height');

                    screen.display.draw(convertedCoordinateX, convertedCoordinateY, getDisplayChar(bresenhamLine[i].x, bresenhamLine[i].y), getDisplayColor(bresenhamLine[i].x, bresenhamLine[i].y), 'rgb(128, 0, 0)');
                }
                //if we encounter entity of current cell, we display message
                if (returnedAimText) {

                    screen.placeTemporaryMessage(returnedAimText);
                    textPlaced ++;
                }

                player.handleEvent = aimEventHandler.bind(player);
            }
        }else{

			screen.placeMessage('You are not wielding any ranged weapon.');
		}

        function aimEventHandler(ev){

            if(ev.which !== 27 && ev.which !== 32 && (ev.which === 103 || ev.which === 104 || ev.which === 105 || ev.which === 102 || ev.which === 99 || ev.which === 98 || ev.which === 97 || ev.which === 100)){

            	/*
            	for pressed direction movement key, we calculate if there exists not blocked bresenham line to new coords. If it exists, we call aim function again for new coordinates
            	 */
            	var newBresenhamLine = pathfinding.bresenham(player.position.x, player.position.y, x + moveActions[ev.which].x, y + moveActions[ev.which].y, player, blockingCells);

                if(x + moveActions[ev.which].x >=0 && y + moveActions[ev.which].y >= 0 && x + moveActions[ev.which].x < screen.options.width && y + moveActions[ev.which].y < screen.options.height && validateBresenhamLine(newBresenhamLine) && screen.getDistance(player.position.x, player.position.y, x + moveActions[ev.which].x, y + moveActions[ev.which].y) < 1.5 * player.weapon.range) {

                    var examinedCell = map.cells[player.position.level][newX][newY];

                    newX += moveActions[ev.which].x;
                    newY += moveActions[ev.which].y;

                    if (examinedCell.isVisible === true) {

                        aim(newX, newY, player);
                    }
                }
			}else if(ev.which === 27 || ev.which === 32){

            	aimInitiated = false;

                if (textPlaced) {

                    for(var i=0; i<textPlaced; i++) {

                        document.getElementById('messageBox').removeChild(document.getElementById('messageBox').lastChild);
                    }

                    textPlaced = 0;
                }

				esc(player);
			}else if(ev.which === 70){

				if(x === player.position.x && y === player.position.y){

					screen.placeMessage('You won\'t shoot yourself!');
					textPlaced ++;
				}else {

                    if (textPlaced) {

                        for(var i=0; i<textPlaced; i++) {

                            document.getElementById('messageBox').removeChild(document.getElementById('messageBox').lastChild);
                        }

                        textPlaced = 0;
                    }

                    player.handleEvent = function(){};

                    aimInitiated = false;
                    combat.doRangedAttack(player, bresenhamLine, defaultEventHandler, esc);
                }
			}

			function validateBresenhamLine(line){

				for(var i=0; i<line.length; i++){

					if(map.cells[level][line[i].x][line[i].y].isVisible === false){

						return false;
					}else if(validateCell(map.cells[level][line[i].x][line[i].y]) === false){

						return false;
					}

					if(i !== line.length - 1 && i !== 0 && map.cells[level][line[i].x][line[i].y].entity !== null){

						return false;
					}
				}

				return true;

				function validateCell(cell){

					for(var i=0; i<blockingCells.length; i++){

						if(cell.type.type === blockingCells[i]){

							return false;
						}
					}

					return true;
				}
			}
		}

        function getDisplayChar(x,y){

            if(map.cells[level][x][y].entity != null){

                return map.cells[level][x][y].entity.display;
            }else if(map.cells[level][x][y].inventory.length !== 0) {

            	return map.cells[level][x][y].inventory[0].display;
            }else{

                return map.cells[level][x][y].type.display;
            }
        }

        function getDisplayColor(x,y){

            if(map.cells[level][x][y].entity != null){

                return map.cells[level][x][y].entity.fgColor;
            }else if(map.cells[level][x][y].inventory.length !== 0) {

                return map.cells[level][x][y].inventory[0].fgColor;
            }else {

                return map.cells[level][x][y].type.fgColor;
            }
        }

        function returnLookText(x,y){

            var displayText;

            if(map.cells[level][x][y].isVisible === true){

                if(map.cells[level][x][y].entity != null){

                    displayText = screen.capitalizeString(map.cells[level][x][y].entity.lookDescription);

                    if(verifySpecialStatus(map.cells[level][x][y].entity) === true){

                        var stateList = [];

                        statusList = Object.keys(map.cells[level][x][y].entity.status);

                        displayText += ' (';

                        for(var i=0; i<statusList.length; i++){

                            if(map.cells[level][x][y].entity.status[statusList[i]].value === 1) {

                                stateList.push(statusList[i]);
                            }
                        }

                        displayText += stateList.join(', ');
                        displayText += ')';
                    }

                    if(map.cells[level][x][y].isOnFire === true){

                        displayText += ' Wild flames of fire are roaring here.';
                    }

                    return displayText;
                }
            }
			/*
			 function used to verify whether entity has any special status (confusion, bleeding, prone, etc.) active
			 */
            function verifySpecialStatus(entity){

                for(var n in entity.status){

                    if(entity.status[n].value === 1){

                        return true;
                    }
                }
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

			if(map.cells[level][x][y].inventory[0].stackable === true && map.cells[level][x][y].inventory[0].quantity > 1){

                screen.placeMessage('How many ' + map.cells[level][x][y].inventory[0].name + 's you want to pick up? [' + map.cells[level][x][y].inventory[0].quantity + ']');
			}else {

                screen.placeMessage('You pick up ' + map.cells[level][x][y].inventory[0].description + '.');
            }

            transferItem(map.cells[level][x][y].inventory[0], map.cells[level][x][y], player, 'pick up');

		}else if(map.cells[level][x][y].inventory.length > 1 && player.inventory.length <= 12){
			
			displayGroundItems(level, x, y);
		}else if(player.inventory.length > 12){
			
			screen.placeMessage('Your inventory is full. You can\'t carry anything more.');
		}
		
		function displayGroundItems(level, x, y){
			
			var drawnText;
			
			screen.display.clear();
            screen.display.setOptions(screen.screenOptions);
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

                if(map.cells[level][x][y].inventory[identifier].stackable === true && map.cells[level][x][y].inventory[identifier].quantity > 1){

                    screen.placeMessage('How many ' + map.cells[level][x][y].inventory[identifier].name + 's you want to pick up? [' +  map.cells[level][x][y].inventory[identifier].quantity + ']');
                }else {

                    screen.placeMessage('You pick up ' + map.cells[level][x][y].inventory[identifier].description + '.');
                }

                transferItem(map.cells[level][x][y].inventory[identifier], map.cells[level][x][y], player, 'pick up');
			}
		}
	}

	function equip(player){
        //first we draw body slots and their equipment on screen
        var drawnText = 'Select body part to equip/unequip:',
            currentRow = 2;

        screen.display.clear();
        screen.display.setOptions(screen.screenOptions);
        player.handleEvent = equipEventHandler;
        screen.display.drawText(Math.floor((screen.displayOptions.width - drawnText.length) / 2), 0, drawnText);

        for(var n in player.equipment){

            drawnText = '%c{darkgoldenrod}[' + String.fromCharCode(96 + (currentRow / 2)) + ']' + n + '%c{}: ' + ((player.equipment[n].stackable && player.equipment[n].quantity > 1) ? ('bundle of ' + player.equipment[n].quantity + ' ' + screen.removeFirst(player.equipment[n].description) + 's') : screen.removeFirst(player.equipment[n].description));

            if(player.equipment[n].type === 'weapons'){

            	drawnText += '[' + player.equipment[n].damage + ']';

            	if(player.equipment[n].sort === 'ranged'){

            		drawnText += '[' + player.equipment[n].range + ']';
            	}
            }else if(player.equipment[n].type === 'armours' || player.equipment[n].type === 'helmets' || player.equipment[n].type === 'legs' || player.equipment[n].type === 'boots'){
            	
            	drawnText += '[' + player.equipment[n].armourBonus + ']';
            }

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

            var list,
				stackable,
				index;

            screen.display.clear();

            if(this.equipment[equipmentType].description === 'empty') {

                screen.display.drawText(5, 0, 'Select item you want to equip:');
                //we draw on screen only item of type suitable to choosen body part
                list = drawObjectTypeInventory(this, itemType);

                this.handleEvent = wearEventHandler;
            }else {

				if(this.equipment[equipmentType].type === 'weapons'){

                    this.weapon = this.defaultWeapon;
                }

                screen.placeMessage('You remove ' + ((this.equipment[equipmentType].stackable && this.equipment[equipmentType].quantity > 1) ? (' bundle of ' + this.equipment[equipmentType].quantity + ' ' + screen.removeFirst(this.equipment[equipmentType].description) + 's.') : (this.equipment[equipmentType].description + '.')));
				doEquipmentModifiers(this, this.equipment[equipmentType], 'remove');


				stackable = !!this.equipment[equipmentType].stackable;
				index = checkIfInventoryHasItem(this.equipment[equipmentType], this);

				if(stackable){

					if(index === null){

                        this.inventory.push(this.equipment[equipmentType]);
                        this.equipment[equipmentType] = {description: 'empty'};
					}else{

						this.inventory[index].quantity += this.equipment[equipmentType].quantity;
                        this.equipment[equipmentType] = {description: 'empty'};
					}
				}else{

                    this.inventory.push(this.equipment[equipmentType]);
                    this.equipment[equipmentType] = {description: 'empty'};
				}

                esc(this);
                map.cells[this.position.level].time.engine.unlock();
            }

            function wearEventHandler(ev) {

                if (ev.which === 27) {

                    esc(this);
                }else if(ev.which - 65 < list.length) {

                    var identifier = list[ev.which - 65].identifier;

                    if(this.inventory[identifier].type === 'weapons'){

                        this.weapon = this.inventory[identifier];
                    }

                    screen.placeMessage('You equip ' + ((this.inventory[identifier].stackable && this.inventory[identifier].quantity > 1) ? ('bundle of ' + this.inventory[identifier].quantity + ' ' + screen.removeFirst(this.inventory[identifier].description) + 's.') : (this.inventory[identifier].description + '.')));
                    this.equipment[equipmentType] = this.inventory.splice(identifier, 1)[0];
					doEquipmentModifiers(this, this.equipment[equipmentType], 'apply');

                    esc(this);
                    map.cells[this.position.level].time.engine.unlock();
                }
            }
		}
	}
	
	//third argument type can have two values, 'apply' or 'remove'
	function doEquipmentModifiers(player, item, type){
				
		if(type === 'apply'){	
					
			for(var n in item.modifiers){
				
				if(player.stats[n] + item.modifiers[n] > 0){
					
					player.equipmentModifiers[item.slot][n] = item.modifiers[n];
				}else {
					//if after modifier stat value would be less than 1, we set it to 1, and store substracted value
					player.equipmentModifiers[item.slot][n] = 1 - player.stats[n];
				}
			}
			//we apply modifiers
			for(var n in player.equipmentModifiers[item.slot]){
				
				player.stats[n] += player.equipmentModifiers[item.slot][n];
			}
		}else if(type === 'remove'){
					
			for(var n in item.modifiers){
					
				player.stats[n] -= player.equipmentModifiers[item.slot][n];
			}
			
			player.equipmentModifiers[item.slot] = {};
		}
				
		player.updateScreenStats();
	}
	
	function drop(x, y, player){
		
		var level = player.position.level;
        //list of items with identifiers returned from drawObjectInventory() function
        var list;
		
		if(player.inventory.length === 0){
			
			screen.placeMessage('Your inventory is empty.');
		}else{
			
			screen.display.clear();
            screen.display.setOptions(screen.screenOptions);
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
				var identifier = list[ev.which - 65].identifier,
					stackable = !!player.inventory[identifier].stackable;

				if(stackable && player.inventory[identifier].quantity > 1){

					screen.placeMessage('How many ' + player.inventory[identifier].name + 's you want to drop? [' + player.inventory[identifier].quantity + ']');
					esc(player);
				}else{

                    screen.placeMessage('You drop ' + (stackable ? (player.inventory[identifier].quantity > 1 ? ('bundle of ' + player.inventory[identifier].quantity + ' ') : '') : '') + (stackable ? (player.inventory[identifier].quantity > 1 ? screen.removeFirst(player.inventory[identifier].description) : player.inventory[identifier].description) : player.inventory[identifier].description) + (stackable ? (player.inventory[identifier].quantity > 1 ? 's' : '') : '') + '.');
				}
				
				if(map.cells[player.position.level][player.position.x][player.position.y].inventory.length <= 12){

					transferItem(player.inventory[identifier], player, map.cells[player.position.level][player.position.x][player.position.y], 'drop');
				}else{
					/*
					if map cell inventory is full(has 12 items), we iterate through all neighbour cells. If examined cell doesn't block movement and doesn't have full inventory, item is dropped there
					*/
					var examinedCell;
					
					for(var n in moveActions){
						
						examinedCell = map.cells[player.position.level][player.position.x + moveActions[n].x][player.position.y + moveActions[n].y];
						
						if(examinedCell.type.blockMovement == false && examinedCell.inventory.length <= 12){

                            //player.inventory[identifier].owner = examinedCell;
							//examinedCell.inventory.push(player.inventory.splice(identifier, 1)[0]);
                            transferItem(player.inventory[identifier], player, map.cells[player.position.level][player.position.x][player.position.y], 'drop');
							break;
						}
					}
				}
				
				//esc(player);
				
				//map.cells[player.position.level].time.engine.unlock();
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
			currentRow = 2,
			stackable;

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
				screen.display.drawText(Math.floor((screen.displayOptions.width - drawnText.length) / 2), currentRow, drawnText);
				currentRow++;
			}

			stackable = !!(list[i].item.stackable);

            drawnText = '%c{darkgoldenrod}[' + String.fromCharCode(97+i) + ']%c{}' + ((stackable && list[i].item.quantity > 1) ? (' ' + list[i].item.quantity) : '') + ' ' +  screen.removeFirst(list[i].item.description) + (stackable ? (list[i].item.quantity > 1 ? 's' : '') : '');
            //we check if drawn item type is weapon or armour. If yes, we draw its damage/defense bonus

            if(list[i].item.type === 'weapons'){

            	drawnText += ' [' + list[i].item.damage + ']';

            	if(list[i].item.sort === 'ranged'){

            		drawnText += '[' + list[i].item.range + ']';
            	}
            }else if(list[i].item.type === 'armours' || list[i].item.type === 'helmets' || list[i].item.type === 'legs' || list[i].item.type === 'boots'){

            	drawnText += ' [' + list[i].item.armourBonus + ']';
            }

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
            currentRow = 2,
			stackable;

        for(var i=0; i<object.inventory.length; i++){

			if(object.inventory[i].type === type) {

				list.push({item: object.inventory[i], type: object.inventory[i].type, identifier: i});
			}
        }

        screen.bubbleSort(list, 'type');

        for(var i=0; i<list.length; i++){

            if(list[i].item.type === type) {

            	stackable = !!(list[i].item.stackable);

                drawnText = '%c{darkgoldenrod}[' + String.fromCharCode(97+i) + ']%c{}' + ((stackable && list[i].item.quantity > 1) ? (' ' + list[i].item.quantity) : '') + ' ' +  screen.removeFirst(list[i].item.description) + (stackable ? (list[i].item.quantity > 1 ? 's' : '') : '');

                if(list[i].item.type === 'weapons'){

            		drawnText += ' [' + list[i].item.damage + ']';

            		if(list[i].item.sort === 'ranged'){

            			drawnText += '[' + list[i].item.range + ']';
            		}
            	}else if(list[i].item.type === 'armours' || list[i].item.type === 'helmets' || list[i].item.type === 'legs' || list[i].item.type === 'boots'){

            		drawnText += ' [' + list[i].item.armourBonus + ']';
            	}

                screen.display.drawText(1, currentRow, drawnText);

                currentRow++;
            }
        }

        return list;
    }
	
	/*
	quaff - function responsible for displaying potions from player inventory replacing event listener with it's own responsible for drinking potions
	*/
	
	function quaff(player){
		
		var drawnText = 'Select potion you want to drink:',
            currentRow = 2,
			list;

        screen.display.clear();
        screen.display.setOptions(screen.screenOptions);
        player.handleEvent = quaffEventHandler;
        screen.display.drawText(Math.floor((screen.displayOptions.width - drawnText.length) / 2), 0, drawnText);
		
		list = drawObjectTypeInventory(player, 'potions');
		
		function quaffEventHandler(ev){
			
			if(ev.which === 27){
				
				esc(this);
			}else if(ev.which - 65 < list.length){
				
				var identifier = list[ev.which - 65].identifier;

				player.inventory[identifier].useEffect(player.inventory[identifier], player)
                player.inventory.splice(identifier, 1)[0];

                esc(this);
                map.cells[this.position.level].time.engine.unlock();
			}
		}
	}
	
	function read(player){
		
		var drawnText = 'Select item you want to read:',
            currentRow = 2,
			list;

        screen.display.clear();
        screen.display.setOptions(screen.screenOptions);
        player.handleEvent = readEventHandler;
        screen.display.drawText(Math.floor((screen.displayOptions.width - drawnText.length) / 2), 0, drawnText);
		
		list = drawObjectTypeInventory(player, 'scrolls');
		
		function readEventHandler(ev){
			
			if(ev.which === 27){
				
				esc(this);
			}else if(ev.which - 65 < list.length){
				
				var identifier = list[ev.which - 65].identifier;

				player.inventory[identifier].useEffect(player.inventory[identifier], player)
                player.inventory.splice(identifier, 1)[0];

                esc(this);
                map.cells[this.position.level].time.engine.unlock();
			}
		}
	}

	function rise(player){

		if(player.status.prone.value === 1){

			screen.placeMessage('You rise back on your feet.');
			player.status.prone.removeEffect(player);
			map.cells[player.position.level].time.engine.unlock();
		}else if(player.status.prone.value === 0){

			player.status.prone.initEffect(player);
			map.cells[player.position.level].time.engine.unlock();
		}
	}

	//event handler for situations where player is stunned
	function stunHandleEvent(ev){

		if(ev.which === 16){

			//nothing happens, shift presses alone shouldn't do anything
		}else if(ev.shiftKey === false && (ev.which === 103 || ev.which === 104 || ev.which === 105 || ev.which === 102 || ev.which === 99 || ev.which === 98 || ev.which === 97 || ev.which === 100 || ev.which === 101)){
			//if movement key is presses, we do random move
			this.move(0, 0, true);
			screen.placeMessage('You stagger.');
		}else if(ev.shiftKey === false && (ev.which === 67 || ev.which === 188 || ev.which === 68 || ev.which === 69 || ev.which === 81 || ev.which === 82 || ev.which === 89)){

			switch(ev.which){
				case 81:

					screen.placeMessage('Your hands are too shaky to drink anything!');
					break;
				case 82:

					screen.placeMessage('Your can\'t read anything in your current state');
					break;
				default:

					screen.placeMessage('You are too shaky to do anything!');
			}
		}else if(ev.shiftKey === false && (ev.which === 73 || ev.which === 76)){

			if(ev.which === 73){

				actions[ev.which](this);
			}else{

				actions[ev.which](this.position.x, this.position.y, this);
			}
		}else if(ev.shiftKey === true && (ev.which === 191 || ev.which === 190 || ev.which === 188 || ev.which === 82)){

			if(ev.which === 191){

				shiftActions[ev.which](this);
			}else if(ev.which === 190 || ev.which === 188){

				if(map.cells[this.position.level][this.position.x][this.position.y].type.type === 'stairs up' || map.cells[this.position.level][this.position.x][this.position.y].type.type === 'stairs down') {

					screen.placeMessage('You won\'t risk using stairs in your current state.');
				}else{

					screen.placeMessage('There are no stairs to use here. In your condition it wouldn\'t be wise anyway...');
				}
			}else if(ev.which === 82){

				if(this.status.prone.value === 1){

					screen.placeMessage('You have trouble with getting up on your feet!');
				}else{

					rise(this);
				}
			}
		}else{

			screen.placeMessage('Unknown command.');
		}
	}

	//wyjście z danego ekranu z powrotem do głównego ekranu gry
	function esc(player){

        screen.display.clear();
        screen.display.setOptions(screen.displayOptions);
        screen.drawVisibleCells(map.cells[player.position.level]);
        player.handleEvent = defaultEventHandler;
    }
	//for debugging
    function reveal(player){

		screen.drawCells(map.cells[player.position.level]);
	}

	function generateDeathScreen(player){

    	while(document.getElementById('messageBox').firstChild){

            document.getElementById('messageBox').removeChild(document.getElementById('messageBox').firstChild);
		}

    	screen.display.clear();
    	screen.display.setOptions(screen.deathScreenOptions);

    	if(!player.deathCause.type) {

            screen.display.drawText(1, 1, player.name + ', human ' + player.class + ' died, killed by ' + player.deathCause.source.type.name);
        }else{

            screen.display.drawText(1, 1, player.name + ', human ' + player.class + ' has ' + (player.deathCause.type ? player.deathCause.type : 'been killed by unknown source') + '.');
		}

		if(player.killCount > 0) {

            screen.display.drawText(1, 3, 'He vanquished ' + player.killCount + ' creature' + (player.killCount > 1 ? 's' : '') + '.');
        }else{

            screen.display.drawText(1, 3, 'He didn\'t killed anyone.');
		}
        screen.display.drawText(1, 4, 'He advanced to ' + player.experienceLevel + ' experience level.');

        screen.display.drawText(1, 5, 'He ended his adventures on ' + (player.position.level + 1) + ' dungeon level.' );
        screen.display.drawText(1, 8, 'Press space to restart.' );

        player.handleEvent = deathScreenEventHandler;

        function deathScreenEventHandler(ev){

			if(ev.which === 32){

                window.location.reload(true);
			}
		}
	}

	/*
	function responsible for transfering items between objects(player or map cells) inventory. actionType is string: either 'pick up', 'drop'
	 */
	function transferItem(item, fromObject, goalObject, actionType){

		var index = returnInventoryIndex(item, fromObject),// we find index in inventory of chosen item
			chosenQuantity = item.quantity,
			wasQuantityPicked = false, //boolean indicating whether user pressed on quantity
			items = require('items');

		if(item.stackable && item.quantity > 1){

			if(actionType === 'pick up') {

                goalObject.handleEvent = pickUpManyEventHandler;
            }else if(actionType === 'drop'){

                fromObject.handleEvent = pickUpManyEventHandler;
            }
		}else{

			var goalObjectInvIndex = checkIfInventoryHasItem(item, goalObject);

			if(item.stackable && actionType === 'pick up' && item.type === 'ammunition' && goalObject.equipment['right hand'].ammoType === item.name){

				if(goalObject.equipment['left hand'].description === 'empty'){

                    goalObject.equipment['left hand'] = fromObject.inventory.splice(index, 1)[0];
				}else if(goalObject.equipment['left hand'].name === item.name){

                    goalObject.equipment['left hand'].quantity++;
                    fromObject.inventory.splice(index, 1);
				}
			}else {

                if (goalObjectInvIndex === null) {

                    goalObject.inventory.push(fromObject.inventory.splice(index, 1)[0]);
                    item.owner = goalObject;
                } else {

                    goalObject.inventory[goalObjectInvIndex].quantity++;
                    fromObject.inventory.splice(index, 1);
                }
            }

            if(actionType === 'pick up') {


                map.clearVisibility(map.cells[goalObject.position.level]);
                goalObject.currentFov = [];
                goalObject.doFov(goalObject);
                esc(goalObject);
                map.cells[goalObject.position.level].time.engine.unlock();
            }else if(actionType === 'drop'){


                map.clearVisibility(map.cells[fromObject.position.level]);
                fromObject.currentFov = [];
                fromObject.doFov(fromObject);
                esc(fromObject);
                map.cells[fromObject.position.level].time.engine.unlock();
            }
		}

		function pickUpManyEventHandler(ev){

			var message = document.getElementById('messageBox').lastChild.innerHTML;
			message = message.split('').splice(0, message.indexOf('[') + 1).join('');

			if(wasQuantityPicked === false){

				if(numberKeysMap[ev.which]){

                    chosenQuantity = numberKeysMap[ev.which];
                    wasQuantityPicked = true;
				}
			}else if(numberKeysMap[ev.which] !== undefined || ev.which === 8) {

                if (chosenQuantity === null && numberKeysMap[ev.which]) {

                    chosenQuantity = numberKeysMap[ev.which];
                } else if (chosenQuantity !== null && chosenQuantity.length < 2 && ev.which !== 8) {

                    chosenQuantity += numberKeysMap[ev.which];
                }else if (chosenQuantity !== null && ev.which === 8) {

                    if (chosenQuantity.length === 2 || chosenQuantity.length === 1) {

                        chosenQuantity = chosenQuantity.substring(0, chosenQuantity.length - 1);
                    }

                    if(chosenQuantity.length === 0){

                        chosenQuantity = null;
                    }
                }

            }
			message += (chosenQuantity ? chosenQuantity : '0') + ']';
            document.getElementById('messageBox').lastChild.innerHTML = message;

            //if enter key was pressed
            if(ev.which === 13){

            	var chosenNumber = parseInt(chosenQuantity),
                	goalObjectInvIndex = checkIfInventoryHasItem(item, goalObject),
                    quantityLeft = item.quantity - chosenNumber;

				if(chosenNumber >= item.quantity){

					chosenNumber = item.quantity;

                    if(actionType === 'pick up' && item.type === 'ammunition' && goalObject.equipment['right hand'].ammoType === item.name){

                        if(goalObject.equipment['left hand'].description === 'empty'){

                            goalObject.equipment['left hand'] = fromObject.inventory.splice(index, 1)[0];
                        }else if(goalObject.equipment['left hand'].name === item.name){

                            goalObject.equipment['left hand'].quantity += chosenNumber;
                            fromObject.inventory.splice(index, 1);
                        }
                    }else {

                        if (goalObjectInvIndex === null) {

                            goalObject.inventory.push(fromObject.inventory.splice(index, 1)[0]);
                            item.owner = goalObject;
                        } else {

                            goalObject.inventory[goalObjectInvIndex].quantity += chosenNumber;
                            fromObject.inventory.splice(index, 1);
                        }
                    }
                    screen.placeMessage((actionType === 'pick up' ? 'You pick up bundle of ' : 'You drop bundle of ') + item.quantity + ' ' + screen.removeFirst(item.description) + 's.');

				}else if(chosenNumber < item.quantity && chosenNumber > 0){

					/*
					if action is 'pick up', we check if player isn't wielding weapon using picked up ammunition - if yes, ammunition is transfered to left hand instead of inventory
					 */
                    if(actionType === 'pick up' && item.type === 'ammunition' && goalObject.equipment['right hand'].ammoType === item.name){

                        if(goalObject.equipment['left hand'].description === 'empty'){

                            goalObject.equipment['left hand'] = fromObject.inventory.slice(index, index + 1)[0];
                            goalObject.equipment['left hand'].quantity = chosenNumber;
                            fromObject.inventory[index].quantity = quantityLeft;
                        }else if(goalObject.equipment['left hand'].name === item.name){

                            goalObject.equipment['left hand'].quantity += chosenNumber;
                            fromObject.inventory[index].quantity = quantityLeft;
                        }
                    }else {

                        //if item isn't present, we just transfer chosen quantity, by creating new object
                        if (goalObjectInvIndex === null) {

                            new items.Ammo(item.name, goalObject, chosenNumber);
                            item.quantity = quantityLeft;
                        } else {

                            goalObject.inventory[goalObjectInvIndex].quantity += chosenNumber;
                            item.quantity -= chosenNumber;
                        }
                    }

					screen.placeMessage((actionType === 'pick up' ? 'You pick up ' : 'You drop ') + (chosenNumber > 1 ? ('bundle of ' + chosenNumber + ' ' + screen.removeFirst(item.description) + 's') : item.description) + '.' );
				}

				if(actionType === 'pick up') {


                    map.clearVisibility(map.cells[goalObject.position.level]);
                    goalObject.currentFov = [];
                    goalObject.doFov(goalObject);
                    esc(goalObject);
                    map.cells[goalObject.position.level].time.engine.unlock();
                }else if(actionType === 'drop'){


                    map.clearVisibility(map.cells[fromObject.position.level]);
                    fromObject.currentFov = [];
                    fromObject.doFov(fromObject);
                    esc(fromObject);
                    map.cells[fromObject.position.level].time.engine.unlock();
				}
			}
		}
	}

	/*
	 function which checks if certain item is already in object inventory. Used for dealing with splitting stack of items. Returns object inventory index if item is present, returns null otherwise
	 */
    function checkIfInventoryHasItem(item, object){

        for(var i=0; i<object.inventory.length; i++){

            if(item.name === object.inventory[i].name){

                return i;
            }
        }

        return null;
    }

	/*
	 function which returns index of certain item in object inventory (index of inventory array). If item isn't present in inventory, null is returned
	 */
    function returnInventoryIndex(item, object){

        for(var i=0; i<object.inventory.length; i++){

            if(item === object.inventory[i]){

                return i;
            }
        }

        return null;
    }

    /*
    function which returns coordinates of nearest hostile with clear line of shot(bresenham line). If no hostile is present, null is returned.
     */
    function returnHostileCoords(player){

    	var hostileList = [],
			examinedCell,
			pathfinding = require('pathfinding');

    	for(var i=0; i<player.currentFov.length; i++){

			examinedCell = map.cells[player.position.level][player.currentFov[i].x][player.currentFov[i].y];

			if(examinedCell.entity !== null && examinedCell.entity !== player && checkIfIsHostile(player, examinedCell.entity)){

				var bresenhamLine = pathfinding.bresenham(player.position.x, player.position.y, examinedCell.entity.position.x, examinedCell.entity.position.y, player, ['wall', 'tree', 'deadTree', 'closedDoors']);

				if(examinedCell.entity.position.x === bresenhamLine[bresenhamLine.length - 1].x && examinedCell.entity.position.y === bresenhamLine[bresenhamLine.length - 1].y) {

                    hostileList.push({
                        x: examinedCell.x,
                        y: examinedCell.y,
                        distance: screen.getDistance(player.position.x, player.position.y, player.currentFov[i].x, player.currentFov[i].y)
                    });
                }
			}
		}

		if(hostileList.length > 0){

            screen.bubbleSort(hostileList, 'distance');
            return hostileList[0];
		}else {

            return null;
        }

		function checkIfIsHostile(player, entity){

            for(var i=0; i<entity.hostileList.species.length; i++){

                if(player.type.species === entity.hostileList.species[i]){

                    return true;
                }
            }

            for(var i=0; i<entity.hostileList.family.length; i++){

                if(player.type.family === entity.hostileList.family[i]){

                    return true;
                }
            }

            for(var i=0; i<entity.hostileList.group.length; i++){

                if(player.type.group === entity.hostileList.group[i]){

                    return true;
                }
            }

            for(var i=0; i<entity.hostileList.entity.length; i++){

                if(this === entity.hostileList.entity[i]){

                    return true;
                }
            }
		}
	}
	/*
	event handler used when player tries to enter chasm cell.
	*/
	function chasmConfirmEventHandler(ev){

		if(ev.which === 89){

			document.getElementById('messageBox').removeChild(document.getElementById('messageBox').getElementsByTagName('li')[document.getElementById('messageBox').getElementsByTagName('li').length - 1]);

			map.clearVisibility(map.cells[this.position.level]);
			screen.display.clear();
			this.currentFov = [];
				
			map.cells[this.position.level][this.position.x][this.position.y].entity = null;
			this.position.lastVisitedCell = map.cells[this.position.level][this.position.x][this.position.y];
					
			map.walkEffectFunctions.chasmEffect(this);

			this.doFov(this);
			screen.drawVisibleCells(map.cells[this.position.level]);
			this.handleEvent = defaultEventHandler;
		}else if(ev.which === 78 || ev.which === 32 || ev.which === 27){

			document.getElementById('messageBox').removeChild(document.getElementById('messageBox').getElementsByTagName('li')[document.getElementById('messageBox').getElementsByTagName('li').length - 1]);
			screen.resetMessageCount();
			this.handleEvent = defaultEventHandler;
		}
	}
	
	return {
		
		displayInventory: displayInventory,
		defaultEventHandler: defaultEventHandler,
		doEquipmentModifiers: doEquipmentModifiers,
		stunHandleEvent: stunHandleEvent,
		generateDeathScreen: generateDeathScreen,
		chasmConfirmEventHandler: chasmConfirmEventHandler
	}
});
