define([], function(){
	
	var options = {
		width: 40,
		height: 40,
		fontSize: 15,
		forceSquareRatio: true
	};
	
	/*
	zmienna lookCount używana do komendy look z modułu evHandlers. Jeżeli większa od 0, to ostatnia wiadomość jest zamieniana na nową
	*/
	
	var lookCount = 0
	
	var currentMessage = null,
		currentMessageCount = 1;
	
	var display = new ROT.Display(options);
	document.getElementById('screen').appendChild(display.getContainer());
	display.getContainer().style.border = '1px solid silver';
	
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
	
	function drawVisibleCells(cells){
		
		var currentColor;
		
		for(var i=0; i<options.width; i++){
			
			for(var j=0; j<options.height; j++){
				//first we have to check whether examined cell is lit, if yes, cell background color is equal to lightcolor
				if(cells[i][j].isVisible === true && cells[i][j].isLit === false){
					
					if(cells[i][j].entity != null){
					
						display.draw(i, j, cells[i][j].entity.display, cells[i][j].entity.fgColor, cells[i][j].entity.bgColor);
					}else if(cells[i][j].entity === null && cells[i][j].inventory.length === 0){
					
						display.draw(i, j, cells[i][j].type.display, cells[i][j].type.fgColor, cells[i][j].type.bgColor);
					}else if(cells[i][j].entity === null && cells[i][j].inventory.length > 0){
						
						display.draw(i, j, cells[i][j].inventory[0].display, cells[i][j].inventory[0].fgColor, cells[i][j].inventory[0].bgColor);
					}
				}else if(cells[i][j].isVisible === true && cells[i][j].isLit === true){
					
					if(cells[i][j].entity != null){
					
						display.draw(i, j, cells[i][j].entity.display, cells[i][j].entity.fgColor, cells[i][j].entity.bgColor);
					}else if(cells[i][j].entity === null && cells[i][j].inventory.length === 0){
					
						display.draw(i, j, cells[i][j].type.display, cells[i][j].type.fgColor, cells[i][j].type.lightColor);
					}else if(cells[i][j].entity === null && cells[i][j].inventory.length > 0){
						
						display.draw(i, j, cells[i][j].inventory[0].display, cells[i][j].inventory[0].fgColor, cells[i][j].inventory[0].bgColor);
					}
				}else if(cells[i][j].isVisible === false && cells[i][j].hasBeenDiscovered === true){
					
					currentColor = ROT.Color.fromString(cells[i][j].type.fgColor);
					
					currentColor[0] -= 120;
					currentColor[1] -= 120;
					currentColor[2] -= 120;
					
					currentColor = ROT.Color.toRGB(currentColor);
					
					display.draw(i, j, cells[i][j].type.display, currentColor, cells[i][j].type.bgColor);
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
	
	function placeMessage(string){
		
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

	function placeVisibleMessage(string, cell){

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
		}else if(string.charAt(0) == 'a' && string.charAt(1) == 'n'){
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
		placeTemporaryMessage: placeTemporaryMessage
	}
});