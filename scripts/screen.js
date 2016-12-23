define(['main'], function(main){

	var displayMode = 'ASCII'; //can be ASCII(avaible), tiles(not yet) or unicode tiles(not yet). Set in main module, setStartScreen function

	var experienceTable = {

		1: {required: 0},
		2: {required: 1000},
		3: {required: 3000},
		4: {required: 6000},
		5: {required: 10000},
		6: {required: 15000},
		7: {required: 21000},
		8: {required: 28000},
		9: {required: 36000},
		10: {required: 45000},
		11: {required: 55000},
		12: {required: 66000},
		13: {required: 78000},
		14: {required: 91000},
		15: {required: 105000},
		16: {required: 120000},
		17: {required: 136000},
		18: {required: 153000},
		19: {required: 171000},
		20: {required: 190000}
	};

	//list of stats gained on every fourth level by different classes
	var statGain = {

		'fighter': ['strength', 'strength', 'dexterity', 'constitution']
	};

	//current position of upper left corner of camera

	var cameraPosition = {

		x: undefined,
		y: undefined
	}

	//for map building inside map and generator modules
	var options = {
		width: 50,
		height: 40,
		fontSize: 15,
		forceSquareRatio: true
	};
	//for display options used inside drawVisibleCells
	var displayOptions = {

        width: 36,
        height: 36,
        fontSize: 17,
        forceSquareRatio: true
	};

	//for display options used inside evHandlers module for non game screen like inventory, equip, etc.
	var screenOptions = {

        width: 40,
        height: 40,
        fontSize: 15,
        forceSquareRatio: true
	}
	
	/*
	zmienna lookCount używana do komendy look z modułu evHandlers. Jeżeli większa od 0, to ostatnia wiadomość jest zamieniana na nową
	*/
	
	var lookCount = 0
	
	var currentMessage = null,
		currentMessageCount = 1;



	var display = new ROT.Display(displayOptions);
	//document.getElementById('screen').appendChild(display.getContainer());
	//display.getContainer().style.border = '1px solid silver';

	
	function drawCells(cells){
		
		for(var i=0; i<options.width; i++){
			
			for(var j=0; j<options.height; j++){
				
				
				if(cells[i][j].entity != null){
					
					display.draw(i, j, cells[i][j].entity.display, cells[i][j].entity.fgColor, cells[i][j].entity.bgColor);
				}else if(cells[i][j].entity == null){
					
					display.draw(i, j, cells[i][j].type.display, cells[i][j].type.fgColor, cells[i][j].type.bgColor);
				}
			}
		}
	}

	/*
	function which converts coordinate of either 'width' or 'height' (second parameter) to current x and y screen coordinates. Used inside look function inside evHandlers module, because with moving camera map coordinates are not always equal to screen coordinates. Idea is very basic - we take current upper left camera position (updated every screen draw inside drawVisibleCells function) and from given value we substract appriopiate x or y camera position.
	 */
	function convertCoordinate(value, type){

		var result;

		if(type === 'width') {

            result = value - cameraPosition.x;
        }else if(type === 'height') {

            result = value - cameraPosition.y;
        }

		return result;
	}
	
	function drawVisibleCells(cells){

		var currentColor,
		 	main = require('main'),
			x, //current x position of player
			y, //current y position of player
			startX, //x upper left position of camera
			startY; //y upper left position of camera

		//we get player position from main module, if it isn't undefined (which happens right at start of the game)
		if(main.exports.player) {

            x = main.exports.player.position.x;
			y = main.exports.player.position.y;
        }else{

			x = 0;
			y = 0;
		}

        if(x < displayOptions.width / 2){

            startX = 0;
        }else if(x > options.width - (displayOptions.width / 2)){

            startX = options.width - displayOptions.width;
        }else{

            startX = Math.floor(x - (displayOptions.width / 2));
        }

        if(y < displayOptions.height / 2){

            startY = 0;
        }else if(y > options.height - (displayOptions.height / 2)){

            startY = options.height - displayOptions.height;
        }else{

            startY = Math.floor(y - (displayOptions.height / 2));
        }

        //we give information about camera position to external object, so other function will be able to use it
        cameraPosition.x = startX;
        cameraPosition.y = startY;

		for(var i=0; i<displayOptions.width; i++){
			
			for(var j=0; j<displayOptions.height; j++){

				//first we have to check whether examined cell is lit, if yes, cell background color is equal to lightcolor
				if(cells[startX + i][startY + j].isVisible === true && cells[startX + i][startY + j].isLit === false){
					
					if(cells[startX + i][startY + j].entity != null){
					
						display.draw(i, j, cells[startX + i][startY + j].entity.display, cells[startX + i][startY + j].entity.fgColor, cells[startX + i][startY + j].entity.bgColor);
					}else if(cells[startX + i][startY + j].entity === null && cells[startX + i][startY + j].inventory.length === 0){
					
						display.draw(i, j, cells[startX + i][startY + j].type.display, cells[startX + i][startY + j].type.fgColor, cells[startX + i][startY + j].type.bgColor);
					}else if(cells[startX + i][startY + j].entity === null && cells[startX + i][startY + j].inventory.length > 0){
						
						display.draw(i, j, cells[startX + i][startY + j].inventory[0].display, cells[startX + i][startY + j].inventory[0].fgColor, cells[startX + i][startY + j].inventory[0].bgColor);
					}
				}else if(cells[startX + i][startY + j].isVisible === true && cells[startX + i][startY + j].isLit === true){
					
					if(cells[startX + i][startY + j].entity != null){
					
						display.draw(i, j, cells[startX + i][startY + j].entity.display, cells[startX + i][startY + j].entity.fgColor, cells[startX + i][startY + j].entity.bgColor);
					}else if(cells[startX + i][startY + j].entity === null && cells[startX + i][startY + j].inventory.length === 0){
					
						display.draw(i, j, cells[startX + i][startY + j].type.display, cells[startX + i][startY + j].type.fgColor, cells[startX + i][startY + j].type.lightColor);
					}else if(cells[startX + i][startY + j].entity === null && cells[startX + i][startY + j].inventory.length > 0){
						
						display.draw(i, j, cells[startX + i][startY + j].inventory[0].display, cells[startX + i][startY + j].inventory[0].fgColor, cells[startX + i][startY + j].inventory[0].bgColor);
					}
				}else if(cells[startX + i][startY + j].isVisible === false && cells[startX + i][startY + j].hasBeenDiscovered === true){
					
					currentColor = ROT.Color.fromString(cells[startX + i][startY + j].type.fgColor);
					
					currentColor[0] -= 120;
					currentColor[1] -= 120;
					currentColor[2] -= 120;
					
					currentColor = ROT.Color.toRGB(currentColor);
					
					display.draw(i, j, cells[startX + i][startY + j].type.display, currentColor, cells[startX + i][startY + j].type.bgColor);
				}
			}
		}
	}
	
	function capitalizeString(string){
		var result = string.replace(string.charAt(0), string.charAt(0).toUpperCase());
			
		return result;
	}
	
	function bubbleSort(arr, key){
		
		var n = arr.length,
			tmpElement;
  
		do{
			for(i=0; i<n-1; i++){
				if(arr[i][key] > arr[i+1][key]){
					tmpElement = arr[i];
					arr[i] = arr[i+1];
					arr[i+1] = tmpElement;
				}
			}
			n--;
		}while(n>1)
	}

	function getDistance(x1, y1, x2, y2) {
		
		var result = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
		return result;
	}
	
	function getDistanceSquare(x1, y1, x2, y2){
		
		var result = Math.floor(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));
		return result;
	}
	
	function setWindows(){
		
		var messageWindow = document.getElementById('messages'),
			playerWindow = document.getElementById('player'),
			screenWidth = document.getElementById('screen').offsetWidth,
			screenHeight = document.getElementById('screen').offsetHeight,
			windowWidth = document.body.offsetWidth,
			windowHeight = document.body.offsetHeight,
			messageWindowWidth = Math.floor((windowWidth - screenWidth) / 2) + 'px';
			playerWindowWidth = Math.floor((windowWidth - screenWidth) / 2) + 'px';
			messageWindowHeight = screenHeight + 'px';
			playerWindowHeight = screenHeight + 'px';
			
		messageWindow.style.width = messageWindowWidth;
		playerWindow.style.width = playerWindowWidth;
		messageWindow.style.minHeight = messageWindowHeight;
		playerWindow.style.minHeight = playerWindowHeight;
	}
	
	function placeMessage(string, color){
		
		if(string != currentMessage && string.length > 0){
			var message = document.createElement('li');
			message.innerHTML = string;
			currentMessage = string;
			currentMessageCount = 1;
			
			document.getElementById('messageBox').appendChild(message);
			document.getElementById('messages').scrollTop = message.offsetTop; 
		}else if(string == currentMessage && string.length > 0){
			
			currentMessageCount++;
			document.getElementById("messageBox").lastChild.innerHTML = currentMessage + ' x' + currentMessageCount;
		}

        if(color){

            document.getElementById("messageBox").lastChild.style.color = color;
        }
		
		if(document.getElementById('messageBox').childNodes.length > 120){
			
			document.getElementById('messageBox').removeChild(document.getElementById('messageBox').getElementsByTagName('li')[0]);
		}
	}
	
	function placeTemporaryMessage(string){
		
		if(string != currentMessage && string.length > 0){
			var message = document.createElement('li');
			message.innerHTML = string;
			
			document.getElementById('messageBox').appendChild(message);
			document.getElementById('messages').scrollTop = message.offsetTop; 
		}else if(string == currentMessage && string.length > 0){
			
			currentMessageCount++;
			document.getElementById("messageBox").lastChild.innerHTML = currentMessage + ' x' + currentMessageCount;
		}
		
		if(document.getElementById('messageBox').childNodes.length > 120){
			
			document.getElementById('messageBox').removeChild(document.getElementById('messageBox').getElementsByTagName('li')[0]);
		}
	}

	function placeVisibleMessage(string, cell, color){

		if(cell.isVisible === true) {

			if (string != currentMessage && string.length > 0) {
				var message = document.createElement('li');
				message.innerHTML = string;
				currentMessage = string;
				currentMessageCount = 1;

				document.getElementById('messageBox').appendChild(message);
				document.getElementById('messages').scrollTop = message.offsetTop;
			} else if (string == currentMessage && string.length > 0) {

				currentMessageCount++;
				document.getElementById("messageBox").lastChild.innerHTML = currentMessage + ' x' + currentMessageCount;
			}

			if(color){

                document.getElementById("messageBox").lastChild.style.color = color;
			}

			if (document.getElementById('messageBox').childNodes.length > 120) {

				document.getElementById('messageBox').removeChild(document.getElementById('messageBox').getElementsByTagName('li')[0]);
			}
		}
	}

	//removes "a" or "an" from beginning of string
	function removeFirst(string){
		var result = string;
		
		if(string.charAt(0) == 'a' && string.charAt(1) == ' '){
			result = string.slice(2);
			return result;
		}else if(string.charAt(0) == 'a' && string.charAt(1) == 'n' && string.charAt(2) == ' '){
			result = string.slice(3);
			return result;
		}else {
			return result;
		}
	}
	
	return{
		display: display,
		options: options,
		drawCells: drawCells,
		bubbleSort: bubbleSort,
		getDistance: getDistance,
		setWindows: setWindows,
		placeMessage: placeMessage,
		capitalizeString: capitalizeString,
		lookCount: lookCount,
		drawVisibleCells: drawVisibleCells,
		getDistanceSquare: getDistanceSquare,
		removeFirst: removeFirst,
		placeVisibleMessage: placeVisibleMessage,
		currentMessage: currentMessage,
		placeTemporaryMessage: placeTemporaryMessage,
		experienceTable: experienceTable,
		statGain: statGain,
		displayOptions: displayOptions,
		screenOptions: screenOptions,
		convertCoordinate: convertCoordinate,
		cameraPosition: cameraPosition,
		displayMode: displayMode
	}
});