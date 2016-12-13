define(['screen', 'map', 'pathfinding'], function(screen, map, pathfinding){
	
	//obiekt przechowujący odwołania do funkcji odpowiedzialnych za konstrukcję poziomów
	
	var levelTypes = {
		
		'uniform': createUniformLevel,
		'digger': createDiggerLevel,
		'arena': createArenaLevel,
		'cavern': createCavernLevel
	};
	
	/*
	obiekt przechowujący odwołania do funkcji odpowiedzialnych za tworzenie specjalnych pomieszczeń/poziomów, funkcje wywoływane są z argumentami (level, lev). Pierwszy argument to numer poziomu, drugi to wygenerowane pola z generatora ROT (na którym użyta jest metoda 'create');
	*/
	
	var specialRooms = {
			
		'forest': createForestRoom,
		'chasm': createChasmRoom,
		'lake': generateLake,
		'lake and forest': generateLakeAndForest,
	};
	
	function createUniformLevel(level){
		
		var callback = function(x,y,value){
			
			if(value == 1){
				
				map.setTerrain(level, x, y, 'wall');
			}else if(value === 0){
				
				var key = x + ',' + y;
				
				map.setTerrain(level, x, y, 'floor');
				
				/*
				zapełnia obiekt floorTiles dla danego poziomu współrzędnymi x i y wygenerowanych podłóg. Współrzędne są przechowywane w postaci stringa 'x,y' i mogą być później odzyskane przy pomocy metody getCoordinates(key)
				*/
				map.cells[level].floorTiles[key] = 1;
			}
		}
		
		var lev = new ROT.Map.Uniform(screen.options.width, screen.options.height, {roomDugPercentage: 0.2}),
			rooms;
		
		lev.create(callback);	
		
		/*
		pobiera listę pokoi i przechowuje w postaci tablicy. Współrzędne pokoju przechowywane są pod zmiennymi _x1, _x2, _y1, _y2.
		*/
		rooms = lev.getRooms();
		
		/*
		ustawia listę właściwości dla poziomu oraz przechowuje tablicę wygenerowanych pokoi oraz mapę wygenerowanego poziomu (pod zmienną lev)
		*/
		map.cells[level].rooms = rooms;
		map.cells[level].type = 'uniform';
		map.cells[level].hasRooms = true;
		map.cells[level].levelGenerated = lev;
		
		placeDoors(rooms, level);
		placeStairsDown(rooms, level);
		placeStairsUp(rooms, level);
		
		//specialRooms['forest'](level, lev);
		//specialRooms['chasm'](level, lev);
	}
	
	function createDiggerLevel(level){
		
		var callback = function(x,y,value){
			
			if(value == 1){
				
				map.setTerrain(level, x, y, 'wall');
			}else if(value == 0){
				
				var key = x + ',' + y;
				
				map.setTerrain(level, x, y, 'floor');
				map.cells[level].floorTiles[key] = 1;
			}
		}
		
		var lev = new ROT.Map.Digger(screen.options.width, screen.options.height, {roomDugPercentage: 0.2});
		
		lev.create(callback);
		
		map.cells[level].rooms = lev.getRooms();
		map.cells[level].type = 'digger';
		map.cells[level].hasRooms = true;
		map.cells[level].levelGenerated = lev;
		
		placeDoors(lev.getRooms(), level);
		placeStairsDown(lev.getRooms(), level);
		placeStairsUp(lev.getRooms(), level);
	}
	
	function createArenaLevel(level){
		
		var callback = function(x,y,value){
			
			if(value == 1){
				
				map.setTerrain(level, x, y, 'wall');
			}else if(value == 0){
				
				var key = x + ',' + y;
				
				map.setTerrain(level, x, y, 'floor');
				map.cells[level].floorTiles[key] = 1;
			}
		}
		
		var lev = new ROT.Map.Arena(screen.options.width, screen.options.height, {roomDugPercentage: 0.2});
		
		lev.create(callback);
		
		map.cells[level].type = 'arena';
		map.cells[level].hasRooms = false;
		map.cells[level].levelGenerated = lev;
		
		placeStairsDown([], level);
		placeStairsUp([], level);
		
		//specialRooms['forest'](level, lev);
		//specialRooms['chasm'](level, lev);
		//specialRooms['lake'](level, lev);
		//specialRooms['lake and forest'](level, lev);
	}
	
	function createDividedMazeLevel(level){
		
		var callback = function(x,y,value){
			
			if(value == 1){
				
				map.setTerrain(level, x, y, 'wall');
			}else if(value == 0){
				
				var key = x + ',' + y;
				
				map.setTerrain(level, x, y, 'floor');
				map.cells[level].floorTiles[key] = 1;
			}
		}
		
		var lev = new ROT.Map.DividedMaze(screen.options.width, screen.options.height, {roomDugPercentage: 0.2});
		
		lev.create(callback);
		
		map.cells[level].type = 'dividedMaze';
		map.cells[level].hasRooms = false;
		map.cells[level].levelGenerated = lev;
		
		placeStairsDown([], level);
		placeStairsUp([], level);
	}
	
	function createRogueLevel(level){
		
		var callback = function(x,y,value){
			
			if(value == 1){
				
				map.setTerrain(level, x, y, 'wall');
			}else if(value == 0){
				
				var key = x + ',' + y;
				
				map.setTerrain(level, x, y, 'floor');
				map.cells[level].floorTiles[key] = 1;
			}
		}
		
		var lev = new ROT.Map.Rogue(screen.options.width, screen.options.height, {roomDugPercentage: 0.2});
		
		lev.create(callback);
		
		map.cells[level].type = 'rogue';
		map.cells[level].hasRooms = false;
		map.cells[level].levelGenerated = lev;
		
		placeStairsDown([], level);
		placeStairsUp([], level);
	}
	
	/*
	nie działa jak trzeba, do poprawienia: algorytm nie łączy wszystkich pomieszczeń. Aktualizacja: częściowo naprawione, schody będą zawsze połączone
	*/
	
	function createCavernLevel(level){
		
		var callback = function(x,y,value){
			
			if(x == 0 || y == 0 || x == screen.options.width - 1 || y == screen.options.height - 1){
				
				value = 1;
			}
			
			if(value == 1){
				
				map.setTerrain(level, x, y, 'wall');
			}else if(value == 0){
				
				var key = x + ',' + y;
				
				map.setTerrain(level, x, y, 'floor');
				map.cells[level].floorTiles[key] = 1;
			}
		}
		
		//dobre: born: [6, 7, 8], survive: [2, 3, 4, 5]
		
		var lev = new ROT.Map.Cellular(screen.options.width, screen.options.height, {connected: true, born: [6, 7, 8], survive: [4, 5, 6, 7, 8]});
		
		lev.randomize(0.55);
		
		for(var i=0; i<18; i++){
			
			lev.create(callback);
		}
		
		lev.connect(callback, 0);
		
		/*
			do zrobienia: nie łączy wszystkich pomieszczeń. algorytm traktuje krawędzie planszy jak wolne pola i jeżeli można gdzieś dojść po krawędzi, to traktuje te sektory jako połączone, mimo, iż krawędź jest ścianą. Nie wiem na ten moment jak to naprawić. Aktualizacja: częściowo naprawione, schody będą zawsze połączone.
		*/
		
		map.cells[level].type = 'cavern';
		map.cells[level].hasRooms = false;
		map.cells[level].levelGenerated = lev;
		
		placeStairsDown([], level);
		placeStairsUp([], level);
		
		var	stairsUp = map.cells[level].stairsUp,
			stairsDown = map.cells[level].stairsDown;
		
		connectTwoCells(level, stairsDown, stairsUp, ['stairs up', 'stairs down', 'floor'], ['wall'], ['floor']);
		//specialRooms['forest'](level, lev);
	}
	
	function createRandomWalkCavernLevel(level){
		
		var limit = 500,
			count = 0,
			newDirections = [{x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1}],
			newDirection,
			newX,
			newY,
			key;
			
		doWalk(Math.floor(screen.options.width / 2), Math.floor(screen.options.height / 2));
		
		map.cells[level].type = 'cavern';
		map.cells[level].hasRooms = false;
		
		placeStairsDown([], level);
		placeStairsUp([], level);
		
		function doWalk(x, y){
			
			if(map.cells[level][x][y].type.type == 'wall'){
				
				key = x + ',' + y;
				
				map.cells[level].floorTiles[key] = 1;
				
				map.setTerrain(level, x, y, 'floor');
				count ++;
			}
			
			newDirection = newDirections.random();
			
			newX = x + newDirection.x;
			newY = y + newDirection.y;
			
			if(count < limit){
				
				if(newX < 1 || newY < 1 || newX > screen.options.width - 2 || newY > screen.options.width - 2){
					
					doWalk(x, y);
				}else{
					
					doWalk(newX, newY);
				}
			}
		}
	}
	
	function placeDoors(rooms, level){
		
		var doors, 
			x, 
			y,
			comaIndex;
		
		for(var i=0; i<rooms.length; i++){
			
			doors = rooms[i]._doors;
			
			for(var n in doors){
				
				comaIndex = n.search(',');
				x = parseInt(n.substring(0, comaIndex));
				y = parseInt(n.substring(comaIndex + 1));
				
				map.cells[level][x][y].type = map.terrain.closedDoors;
			}
		}
	}
	
	function placeStairsDown(rooms, level){
		
		var x,
			y,
			comaIndex,
			room,
			floorCoordinates;
		
		if(map.cells[level].hasRooms == true){
			
			room = map.cells[level].rooms.splice(1,1)[0];
			map.cells[level].specialRooms.push({_x1: room._x1, _x2: room._x2, _y1: room._y1, _y2: room._y2, type: 'stairs down'});
			
			x = ROT.RNG.getUniformInt(room._x1 + 1, room._x2 - 1);
			y = ROT.RNG.getUniformInt(room._y1 + 1, room._y2 - 1);
			
			if(map.cells[level][x][y].type.type != 'floor'){
				
				placeStairsDown(rooms, level);
			}else if(map.cells[level].stairsUp != null && screen.getDistance(x, y, map.cells[level].stairsUp.x, map.cells[level].stairsUp.y) < 16){
				
				placeStairsDown(rooms, level);
			}else{
				
				map.cells[level].stairsDown = {x: x, y: y};
				map.setTerrain(level, x, y, 'stairsDown');
			}
		}else if(map.cells[level].hasRooms == false){
			
			floorCoordinates = Object.keys(map.cells[level].floorTiles).random();
			
			comaIndex = floorCoordinates.search(',');
			x = parseInt(floorCoordinates.substring(0, comaIndex));
			y = parseInt(floorCoordinates.substring(comaIndex + 1));
			
			if(map.cells[level][x][y].type.type != 'floor'){
				
				placeStairsDown(rooms, level);
			}else if(map.cells[level].stairsUp != null && screen.getDistance(x, y, map.cells[level].stairsUp.x, map.cells[level].stairsUp.y) < 16){
				
				placeStairsDown(rooms, level);
			}else if(verifyWallNeighbour(level, x, y) == 'wall'){
				
				placeStairsDown(rooms, level);
			}else{
				
				map.cells[level].stairsDown = {x: x, y: y};
				map.setTerrain(level, x, y, 'stairsDown');
			}
		}
	}
	
	function placeStairsUp(rooms, level){
		
		var x,
			y,
			room,
			floorCoordinates;
		
		if(map.cells[level].hasRooms == true){
			
			room = map.cells[level].rooms.splice(1,1)[0];
			map.cells[level].specialRooms.push({_x1: room._x1, _x2: room._x2, _y1: room._y1, _y2: room._y2, type: 'stairs up'});
			
			x = ROT.RNG.getUniformInt(room._x1 + 1, room._x2 - 1);
			y = ROT.RNG.getUniformInt(room._y1 + 1, room._y2 - 1);
			
			if(map.cells[level][x][y].type.type != 'floor'){
				
				placeStairsUp(rooms, level);
			}else if(map.cells[level].stairsDown != null && screen.getDistance(x, y, map.cells[level].stairsDown.x, map.cells[level].stairsDown.y) < 16){
				
				placeStairsUp(rooms, level);
			}else{
				
				map.cells[level].stairsUp = {x: x, y: y};
				map.setTerrain(level, x, y, 'stairsUp');
			}
		}else if(map.cells[level].hasRooms == false){
			
			floorCoordinates = Object.keys(map.cells[level].floorTiles).random();
			
			comaIndex = floorCoordinates.search(',');
			x = parseInt(floorCoordinates.substring(0, comaIndex));
			y = parseInt(floorCoordinates.substring(comaIndex + 1));
			
			if(map.cells[level][x][y].type.type != 'floor'){
				
				placeStairsUp(rooms, level);
			}else if(map.cells[level].stairsDown != null && screen.getDistance(x, y, map.cells[level].stairsDown.x, map.cells[level].stairsDown.y) < 16){
				
				placeStairsUp(rooms, level);
			}else if(verifyWallNeighbour(level, x, y) == 'wall'){
				
				placeStairsUp(rooms, level)
			}else{
				
				map.cells[level].stairsUp = {x: x, y: y};
				map.setTerrain(level, x, y, 'stairsUp');
			}
		}
	}
	
	/*
	funkcja sprawdzająca czy dla danych współrzędnych x i y na poziomie level, te współrzędne mają w sąsiedztwie ściany
	*/
	function verifyWallNeighbour(level, x, y){
		
		for(var i=-1; i<=1; i++){
			
			for(var j=-1; j<=1; j++){
				
				if(map.cells[level][x+i][y+j].type.type == 'wall'){
					
					return 'wall';
				}
			}
		}
	}
	
	/*
	verifyNeighbour() - dla współrzędnych x, y funkcja sprawdzająca czy w siąsiedztwie występuje pole o typie cellType
	*/
	
	function verifyNeighbour(level, x, y, cellType){
		
		for(var i=-1; i<=1; i++){
			
			for(var j=-1; j<=1; j++){
				
				if(map.cells[level][x+i][y+j].type.type == cellType){
					
					return true;
				}
			}
		}
	}
	
	/*
	verifyNeighbourInRange() - funkcja sprawdzająca czy dla współrzędnych x, y czy w zasięgu range występuje pole cellType
	*/
	
	function verifyNeighbourInRange(level, x, y, cellType, range){
		
		for(i=x - range; i<=i + range; i++){
				
			for(j=y - range; j<=j + range; j++){
				
				if(i < 0 || j < 0 || i > screen.options.width - 1 || j > screen.options.height - 1){
				
					continue;
				}	
				if(map.cells[level][i][j].type.type == cellType && screen.getDistance(i, j, x, y) < range){
						
					return true;
				}
			}
		}
	}
	
	function createForestRoom(level, mapLevel){
		
		var startPoint,
			room,
			forestFloorType = ['grass', 'bush', 'grass', 'grass', 'bush', 'tree', 'grass', 'bush'];
		
		if(map.cells[level].type == 'uniform' || map.cells[level].type == 'digger'){
			
			room = map.cells[level].rooms.splice(1,1)[0];
			
			map.cells[level].specialRooms.push({_x1: room._x1, _x2: room._x2, _y1: room._y1, _y2: room._y2, type: 'forest'});
			
			for(var i=room._x1; i<=room._x2;i++){
				
				for(var j=room._y1; j<=room._y2; j++){
					
					if(ROT.RNG.getUniformInt(1,15) != 15){
						
						if(map.cells[level][i][j].type.type == 'floor'){
						
							map.setTerrain(level, i, j, forestFloorType.random());
						}
					}
				}
			}
			
		}else if(map.cells[level].type == 'arena'){
			
			startPoint = {x: 20, y: 20};
			doRandomWalk(level, startPoint.x, startPoint.y, forestFloorType, 6000);
		}else if(map.cells[level].type == 'cavern'){
			
			startPoint = pickStartingPoint(level, mapLevel);
			
			doRandomWalk(level, startPoint.x, startPoint.y, forestFloorType, 6000);
		}
	}
	
	/*
	createChasmRoom() - funkcja tworząca przepaście na poziomie. W przypadku poziomu 'uniform' lub 'digger' wybiera losowo jeden pokój, zapełnia go typem komórki 'chasm' i łączy wszystkie drzwi ze sobą za pomocą mostu. W przypadku poziomu 'arena' losowo używa albo algorytmu generateCarvedTerrain lub algorytmu voronoiMap do zapełnienia poziomu typem pola 'chasm'
	*/
	
	function createChasmRoom(level, mapLevel){
		
		if(map.cells[level].type == 'uniform' || map.cells[level].type == 'digger'){
			
			//wybieramy pokój oraz pobieramy jego drzwi do zmiennej doors
			var room = map.cells[level].rooms.splice(1,1)[0],
				doors = Object.keys(room._doors),
				doorCoordinates = [];
			
			//pobieramy współrzędne wszystkich drzwi do zmiennej doorCoordinates
			for(var i=0; i<doors.length; i++){
				
				doorCoordinates.push(getCoordinates(doors[i]));
			}
				
			for(var i=room._x1; i<=room._x2; i++){
				
				for(var j=room._y1; j<=room._y2; j++){
					
					map.setTerrain(level, i, j, 'chasm');
				}
			}
			
			//łączymy mostem pierwsze drzwi ze wszystkimi kolejnymi
			for(var i=0; i<doorCoordinates.length; i++){
				
				if(i+1 < doorCoordinates.length){
					
					connectTwoCells(level, map.cells[level][doorCoordinates[0].x][doorCoordinates[0].y], map.cells[level][doorCoordinates[i+1].x][doorCoordinates[i+1].y], ['floor', 'closed doors', 'wooden bridge'], ['chasm'], ['woodenBridge']);
				}
			}
			
		}else if(map.cells[level].type == 'arena'){
			
			var	stairsUp = map.cells[level].stairsUp,
				stairsDown = map.cells[level].stairsDown;
				
			if(ROT.RNG.getUniformInt(1,2) == 1){
				
				//tablica kierunków przepaści
				var	directions = ['horizontal', 'vertical'];
			
				generateCarvedTerrain(level, 38, 50, 15, ['chasm'], directions.random());
			
				surroundWithCell(level, stairsUp.x, stairsUp.y, 'floor');
				surroundWithCell(level, stairsDown.x, stairsDown.y, 'floor');
			
				connectTwoCells(level, stairsDown, stairsUp, ['stairs up', 'stairs down', 'floor'], ['chasm'], ['woodenBridge']);
			}else {
				
				var generatedLevel = map.cells[level],
					tiles = ['floor', 'floor', 'chasm'];
				
				voronoiMap(level, tiles);
				
				surroundWithCell(level, generatedLevel.stairsDown.x, generatedLevel.stairsDown.y, 'floor');
				surroundWithCell(level, generatedLevel.stairsUp.x, generatedLevel.stairsUp.y, 'floor');
				
				connectTwoCells(level, stairsDown, stairsUp, ['stairs up', 'stairs down', 'floor'], ['chasm'], ['woodenBridge']);
			}
			
			doRandomWalk(level, Math.floor(screen.options.width / 2), Math.floor(screen.options.height / 2), ['deadTree', 'deadBush', 'deadBush', 'deadGrass', 'deadGrass', 'deadGrass'], 6000);
		}else if(map.cells[level].type == 'cavern'){
			
			var generatedLevel = map.cells[level],
				startPoint;
			
		}
	}

	/*
	generateLake() - funkcja odpowiedzialna za tworzenie jeziora/jezior na poziomie typu 'arena'. Po wygenerowaniu wody za pomocą algorytmu voronoiMap, pola sąsiadujące z polami typu 'floor' są zamieniane na 'shallow water', następnie w kolejnej iteracji po polach mapy "wygładza" krawędzie wody, zamieniając pole 'shallow water' na 'floor' w przypadku gdy nie sąsiaduje ono z 'deep water'. W kolejnej iteracji zamienia pola sąsiadujące z 'shallow water' na 'sand'
	*/
		
	function generateLake(level, mapLevel){
		
		var generatedLevel = map.cells[level];
		
		if(map.cells[level].type == 'arena'){
			
			var tiles = ['floor', 'floor', 'deepWater'],
				examinedCell;
			
			voronoiMap(level, tiles);
			
			surroundWithCell(level, generatedLevel.stairsDown.x, generatedLevel.stairsDown.y, 'floor');
			surroundWithCell(level, generatedLevel.stairsUp.x, generatedLevel.stairsUp.y, 'floor');
			
			for(var i=1; i<screen.options.width - 1; i++){
				
				for(var j=1; j<screen.options.height - 1; j++){
					
					examinedCell = map.cells[level][i][j];
					
					if(examinedCell.type.type == 'deep water' && verifyNeighbour(level, i, j, 'floor') == true){
						
						map.setTerrain(level, i, j, 'shallowWater');
					}
				}
			}
			
			for(var i=1; i<screen.options.width - 1; i++){
				
				for(var j=1; j<screen.options.height - 1; j++){
					
					examinedCell = map.cells[level][i][j];
					
					if(examinedCell.type.type == 'shallow water' && verifyNeighbour(level, i, j, 'deep water') != true){
						
						map.setTerrain(level, i, j, 'floor');
					}else if(examinedCell.type.type == 'floor' && verifyNeighbour(level, i, j, 'shallow water') == true){
						
						map.setTerrain(level, i, j, 'sand');
					}
				}
			}
			
			for(var i=1; i<screen.options.width - 1; i++){
				
				for(var j=1; j<screen.options.height - 1; j++){
					
					examinedCell = map.cells[level][i][j];
					
					if(examinedCell.type.type == 'floor' && verifyNeighbour(level, i, j, 'shallow water') == true){
						
						map.setTerrain(level, i, j, 'sand');
					}
				}
			}
			
			var stairsDown = {x: map.cells[level].stairsDown.x, y: map.cells[level].stairsDown.y},
				stairsUp = {x: map.cells[level].stairsUp.x, y: map.cells[level].stairsUp.y};
			
			connectTwoCells(level, map.cells[level][stairsDown.x][stairsDown.y], map.cells[level][stairsUp.x][stairsUp.y], ['floor', 'shallow water', 'stairs up', 'stairs down', 'sand'], ['shallow water', 'deep water'], ['woodenBridge']);
		}
	}
	
	/*
	generateLakeAndForest() - funkcja generująca w pierwszej kolejności jezioro za pomocą metody generateLake, a następnie za pomocą funkcji doRandomWalk generuje las
	*/
	
	function generateLakeAndForest(level, mapLevel){
		
		generateLake(level, mapLevel);
		
		doRandomWalk(level, 20, 20, ['grass', 'grass', 'grass', 'bush', 'bush', 'tree'], 6000);
	}
	
	function doRandomWalk(level, x, y, cellFillArray, steps){

		var newX = x,
			newY = y,
			count = 0;
		
		randomWalk(newX, newY);
		
		function randomWalk(x, y){

			count++;
			
			if(map.cells[level][x][y].type.type == 'floor'){
				
				map.setTerrain(level, x, y, cellFillArray.random());
			}
			
			newX = x + ROT.RNG.getUniformInt(-1,1);
			newY = y + ROT.RNG.getUniformInt(-1,1);
			
			if(count < steps){
				
				if(newX < 1 || newY < 1 || newX > screen.options.width - 2 || newY > screen.options.height - 2){
					
					randomWalk(x, y);
				}else{
					
					randomWalk(newX, newY);
				}
			}
		}
	}
	
	function findDiagonalPath(level, startX, startY, goalX, goalY, arrayCellsAllowed){
		
		var exports = {path: []};
		
		function callback(x, y){
			
			function checkIfCellAllowed(cell){
				
				for(var i=0; i<arrayCellsAllowed.length; i++){
					
					if(arrayCellsAllowed[i] == cell.type.type){
						
						return 'pass';
					}
				}
			}
			
			if(x < 0 || y < 0 || x > screen.options.width - 1 || y > screen.options.height - 1){
				
				return false;
			}
			
			if(checkIfCellAllowed(map.cells[level][x][y]) == 'pass'){
				
				return true;
			}else{
				
				return false;
			}
		}
		
		var dijkstra = new ROT.Path.Dijkstra(goalX, goalY, callback, {topology: 4});
		
		dijkstra.compute(startX, startY, function(x, y){
			
			exports.path.push({x: x, y: y});
		});
		
		return exports.path;
	}
	
	function surroundWithCell(level, x, y, cellType){
		
		for(var i=-1; i<=1; i++){
			
			for(var j=-1; j<=1; j++){
				
				if(x+i < 1 || x+i > screen.options.width - 2 || y+j < 1 || y+j > screen.options.height - 2){
					
					continue;
				}
				if(i == 0 && j == 0){
					
					continue;
				}
				
				map.setTerrain(level, x+i, y+j, cellType);
			}
		}
	}
	
	function generateCarvedTerrain(level, length, roughness, windyness, arrayCellsAllowed, direction){
		
		var startX,
			startY,
			startWidth,
			startHeight,
			randomNumbers = [-2, -1, 1, 2];
			
		switch(direction){
			
			case 'vertical':
			
			startX = ROT.RNG.getUniformInt(Math.floor(screen.options.width / 2) - 5, Math.floor(screen.options.width / 2) + 5);
			startY = 1;
			startWidth = ROT.RNG.getUniformInt(1, 3);
			fillRectangle(level, startX, startY, startWidth, 0, arrayCellsAllowed.random(), 'floor');
			
			var x = startX,
				y = startY,
				width = startWidth;
				
			while(y < length){
				
				y++;
				
				if(ROT.RNG.getUniformInt(1, 100) <= roughness){
					
					width += randomNumbers.random();
					
					if(width < 3){
						
						width = 3;
					}else if(width > screen.options.width - 3){
						
						width = screen.options.width - 3;
					}
				}
				
				if(ROT.RNG.getUniformInt(1, 100) <= windyness){
					
					x += randomNumbers.random();
					
					if(x < 0){
						
						x = 0;
					}else if(x > screen.options.width - 5){
						
						x = screen.options.width - 5;
					}
				}
					
				fillRectangle(level, x, y, width, 0, arrayCellsAllowed.random(), 'floor');	
			}
			break;
			
			case 'horizontal':
			
			startX = 1;
			startY = ROT.RNG.getUniformInt(Math.floor(screen.options.height / 2) - 5, Math.floor(screen.options.height / 2) + 5);
			startHeight = ROT.RNG.getUniformInt(1, 3);
			fillRectangle(level, startX, startY, 0, startHeight, arrayCellsAllowed.random(), 'floor');
			
			var x = startX,
				y = startY,
				height = startHeight;
				
			while(x < length){
				
				x++;
				
				if(ROT.RNG.getUniformInt(1, 100) <= roughness){
					
					height += randomNumbers.random();
					
					if(height < 3){
						
						height = 3;
					}else if(width > screen.options.height - 3){
						
						height = screen.options.height - 3;
					}
				}
				
				if(ROT.RNG.getUniformInt(1, 100) <= windyness){
					
					y += randomNumbers.random();
					
					if(y < 0){
						
						y = 0;
					}else if(y > screen.options.height - 5){
						
						y = screen.options.height - 5;
					}
				}
					
				fillRectangle(level, x, y, 0, height, arrayCellsAllowed.random(), 'floor');	
			}
			break;
		}
	}
	
	/*
	fillRectangle() - tworzy prostokąt o punkcie początkowym xStart, yStart i promieniach xRadius, yRadius(promienie idą w dół i prawo). W utworzonym prostokącie zamienia pola cellTypeToReplace na cellType
	*/
	
	function fillRectangle(level,xStart,yStart,xRadius,yRadius, cellType, cellTypeToReplace){
		var x = parseInt(xStart) - parseInt(xRadius);
		var y = parseInt(yStart) - parseInt(yRadius);
		
		for(var i= 0; i <= 2*parseInt(xRadius); i++){
			if(i == 0){
				x = x;
			}else{
				x = x + 1;
			}
		
			if(x < 1 || x > screen.options.width - 2){
				continue;
			}
			for(var j = 0; j <= 2*parseInt(yRadius); j++){			
				if(j == 0){
					y = y;
				}else{
					y = y + 1;
				}
			
				if(y >= 1 && y <= screen.options.width - 2){
				
				if(map.cells[level][x][y].type.type == cellTypeToReplace){
					
					map.setTerrain(level, x, y, cellType);
				}
					
					if(j == 2 * yRadius){
						y = yStart - yRadius;
					}
				}
				else if(y > screen.options.width - 1){
					y = yStart - yRadius
					continue;
				}else if(y < 1){
					continue;
				}
			}
		}
	}
	
	/*
	wypełnia pola w promieniu radius dokoła pola o współrzędnych x i y polami o typie cellType
	*/
	
	function surroundWithCircle(level, x, y, cellType, cellToReplace, radius){
		
		for(var i=x - radius; i<=x + radius; i++){
			
			for(var j=y - radius; j<=y + radius; j++){
				if(i < 0 || j < 0 || i > screen.options.width - 1 || j > screen.options.height - 1 || (i==x && j==y)){
					
					continue;
				}
				if(screen.getDistance(x, y, i, j) <= radius && map.cells[level][i][j].type.type == cellToReplace){
					console.log(map.cells[level][i][j].type.type);
					map.setTerrain(level, i, j, cellType);
				}
			}
		}
	}
	
	/*
	connectTwoCells() - algorytm łączący dwa pola na planszy, pod warunkiem, iż nie istnieje bezpośrednia ścieżka łącząca te dwa pola. argument pathRequired to tablica typ pól dozwolonych jako bezpośrednio ścieżka. W przypadku gdy taka ścieżka nie istnieje, łączy dwa pola najkrótszą drogą typami pól określonymi w tablicy pathMade. Zamienia pola z tablicy cellsToReplace na pola z tablicy pathMade
	*/
	
	function connectTwoCells(level, cell1, cell2, pathRequired, cellsToReplace, pathMade){
		
		if(findDiagonalPath(level, cell1.x, cell1.y, cell2.x, cell2.y, pathRequired).length == 0){
			
			var path = findDiagonalPath(level, cell1.x, cell1.y, cell2.x, cell2.y, pathRequired.concat(cellsToReplace));
			
			for(var i=0; i<path.length; i++){
					
				if(verifyIfCellDisallowed(level, path[i].x, path[i].y, cellsToReplace) == 'replace'){
						
					map.setTerrain(level, path[i].x, path[i].y, pathMade.random());
				}
			}
		}
		
		function verifyIfCellDisallowed(level, x, y, cellsToReplace){
			
			for(var i=0; i<cellsToReplace.length; i++){
				
				if(map.cells[level][x][y].type.type == cellsToReplace[i]){
					
					return 'replace';
				}
			}
		}
	}
	
	/*
	getCoordinates(key) - zwraca obiekt koordynatów w postaci {x: x, y: y} z klucza obiektu w postaci {'x,y': value}
	*/
	
	function getCoordinates(key){
		
		var comaIndex = key.search(','),
			x = parseInt(key.substring(0, comaIndex)),
			y = parseInt(key.substring(comaIndex + 1));
			
		return {x: x, y: y};
	}
	
	/*
	pickStartingPoint(level, mapLevel) - algorytm który dla różnych innych algorytmów (np. random walk) wybiera losowo punkt początkowy upewniając się, że nie jest on schodami w górę ani w dół
	*/
	
	function pickStartingPoint(level, mapLevel){
		
		var key = Object.keys(map.cells[level].floorTiles).random(),
			x = getCoordinates(key).x,
			y = getCoordinates(key).y;
			
		if((x == map.cells[level].stairsDown.x && y == map.cells[level].stairsDown.y) || (x == map.cells[level].stairsUp.x && y == map.cells[level].stairsUp.y)){
			
			return pickStartingPoint(level, mapLevel);
		}else{
			
			return {x: x, y: y};
		}
	}
	
	/*
	generateJumpPoints() - algorytm służący do losowego generowania jezior, rozpadlin lub innych podobnych powierzchni.  Zaczyna od pola startX, startY na poziomie level. Następnie porusza się losowo ruchami skoczka szachowego (wykonuje ilość ruchów odpowiadających paramentrowi steps) i na każdym odwiedzonym punkcie tworzy koło o promieniu 2. W promieniu tego koła zamienia każde pole typu cellToReplace na pole typu cellType.
	*/
	//nie działa jak trzeba, zamienia schody na inny typ komórki, co nie powinno mieć miejsca. DO NAPRAWIENIA
	function generateJumpPoints(level, startX, startY, cellToReplace, cellType, steps){
		
		var list = [],
			count = 0,
			newX = startX,
			newY = startY,
			tmpX,
			tmpY,
			directions = [{x: -1, y: -2}, {x: 1, y: -2}, {x: 2, y: -1}, {x: 2, y: 1}, {x: 1, y: 2}, {x: -1, y: 2}, {x: -2, y: 1}, {x: -2, y: -1}],
			currentDirection;
		
		list.push({x: newX, y: newY});
		
		while(count <= steps){
			
			currentDirection = directions.random();
			
			tmpX = newX + currentDirection.x;
			tmpY = newY + currentDirection.y;
			
			if(tmpX < 0 || tmpX > screen.options.width - 1 || tmpY < 0 ||  tmpY > screen.options.height - 1){
				
				continue;
			}
			
			if(map.cells[level][tmpX][tmpY].type.type == cellToReplace){
				
				newX = tmpX;
				newY = tmpY;
				
				list.push({x: newX, y: newY});
			}
			
			count++;
		}
		
		for(var i=0; i<list.length; i++){
			
			surroundWithCell(level, list[i].x, list[i].y, cellType, cellToReplace, 1);
			
			if(map.cells[level][list[i].x][list[i].y].type.type == cellToReplace){
				
				map.setTerrain(level, list[i].x, list[i].y, cellType);
			}
		}
	}
	
	/*
	voronoiMap(level, tilesArray) - funkcja do generowania jezior, przepaści o naturalnych kształtach. Argument tilesArray to tablica typów pól akceptowanych przez algorytm. Algorytm najpierw losuje 18 punktów na planszy i losowo zamienia je na wybrany losowo typ z tablicy tilesArray, tworząc nową tablicę randomPoints. Następnie dla każdego pola na planszy, algorytm wybiera najbliższy punkt z tablicy randomPoints i zamienia badane pole na pole tożsame z rzeczonym najbliższym punktem
	*/
	
	function voronoiMap(level, tilesArray){
		
		var randomPoints = [],
			x,
			y;
			
		for(var i=0; i<18; i++){
			
			addRandomPoints(6);
		}
		
		//funkcja która zapewnia, że wylosowane pola będą w odpowiedniej odległości od już wylosowanych
		
		function addRandomPoints(radius){
			
			if(randomPoints.length == 0){
				
				x = ROT.RNG.getUniformInt(1, screen.options.width - 2);
				y = ROT.RNG.getUniformInt(1, screen.options.height - 2);
				
				randomPoints.push({x: x, y: y, distance: undefined});
			}else{
				
				x = ROT.RNG.getUniformInt(1, screen.options.width - 2);
				y = ROT.RNG.getUniformInt(1, screen.options.height - 2);
				
				if(validatePointsDistance(x, y, radius) == true || map.cells[level][x][y].type.type != 'floor'){
					
					addRandomPoints(radius);
				}else {
					
					randomPoints.push({x: x, y: y, distance: undefined});
					map.setTerrain(level, x, y, tilesArray.random());
				}
			}
		}
		
		//badamy każde pole na planszy i zamieniamy typ na typ najbliższego pola z tablicy randomPoints
		
		var examinedTile;
	
		for(var i=1; i<screen.options.width - 1; i++){
				
			for(var j=1; j<screen.options.height - 1; j++){
					
				examinedTile = map.cells[level][i][j];
				
				//każdemu polu z tablicy randomPoints zmieniamy parametr distance na odległość od aktualnie badanego pola
				
				for(var k=0; k<randomPoints.length; k++){
						
					randomPoints[k].distance = screen.getDistance(i, j, randomPoints[k].x, randomPoints[k].y);
				}
				
				//sortujemy tablicę randomPoints tak, aby najbliższe pole było na indeksie 0
				
				screen.bubbleSort(randomPoints, 'distance');
					
				if(map.cells[level][i][j].type.type != 'stairs up' && map.cells[level][i][j].type.type != 'stairs down'){
						
					map.setTerrain(level, i, j, map.cells[level][randomPoints[0].x][randomPoints[0].y].type.key);
				}
			}
		}
		
		//funkcja która bada odległość danego pola od pól aktualnie istniejących w tablicy randomPoints
		
		function validatePointsDistance(x, y, radius){
				
			for(var i=0; i<randomPoints.length; i++){
					
				if(screen.getDistance(x, y, randomPoints[i].x, randomPoints[i].y) < radius){
						
					return true;
				}
			}
		}
	}
	
	function generateRandomLevel(){

		var currentLevel,
			levelNamesKeys = Object.keys(levelTypes),
			chosenLevelType = levelNamesKeys.random();

		if(map.cells.maxDungeonLevel !== undefined) {

            map.cells.maxDungeonLevel++;
        }else{

			map.cells.maxDungeonLevel = 0;
		}
		currentLevel = map.cells.maxDungeonLevel;

		map.initCells(currentLevel);
		levelTypes[chosenLevelType](currentLevel);
		
		if(chosenLevelType === 'arena'){

			var specialRoomsKeys = Object.keys(specialRooms),
				chosenLevelTheme = specialRoomsKeys.random();
            console.log(chosenLevelType + ' ' + chosenLevelTheme);
			specialRooms[chosenLevelTheme](currentLevel, map.cells[currentLevel].levelGenerated);
		}
	}

	function fillLevelWithMonsters(level){

		
	}
	
	
	return {
		
		createUniformLevel: createUniformLevel,
		createDiggerLevel: createDiggerLevel,
		createDividedMazeLevel: createDividedMazeLevel,
		createRogueLevel: createRogueLevel,
		createArenaLevel: createArenaLevel,
		createCavernLevel: createCavernLevel,
		createRandomWalkCavernLevel: createRandomWalkCavernLevel,
		findDiagonalPath: findDiagonalPath,
		fillRectangle: fillRectangle,
		surroundWithCircle: surroundWithCircle,
		generateRandomLevel: generateRandomLevel,
		fillLevelWithMonsters: fillLevelWithMonsters
	}
});