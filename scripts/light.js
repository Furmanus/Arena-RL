define(['screen', 'map'], function(screen, map){
	
	//tablica kolorów światła dla różnych przedmiotów/źródeł
	
	var lightSources = {
		
		'torch': {color: 'rgb(255,255,153)', range: 3},
		'fire': {color: 'rgb(226,188,34)', range: 2}
	}
	
	function getCoordinates(key){
		
		var comaIndex = key.search(','),
			x = parseInt(key.substring(0, comaIndex)),
			y = parseInt(key.substring(comaIndex + 1));
			
		return {x: x, y: y};
	}
	// NIE MIESZA ŚWIATEŁ, DO POPRAWIENIA
	function emitLight(level, x, y, chosenColor, lightRange){
		
		var lightData = {};
		
		var lightPasses = function(examinedX, examinedY) { 
			
			
			if(examinedX < 0 || examinedY < 0 || examinedX > screen.options.width - 1 || examinedY > screen.options.height - 1){
				
				return false;
			}else if(map.cells[level][examinedX][examinedY].type.blockFov === true && (examinedX != x || examinedY != y)){
				
				return false;
			}else if(map.cells[level][examinedX][examinedY].type.blockFov === true && (examinedX === x && examinedY === y)){
				
				return true;
			}else{
				
				return true;
			}
		}
		
		var fov = new ROT.FOV.PreciseShadowcasting(lightPasses, {topology: 4});
	
		var reflectivity = function(x,y){
		
			if(map.cells[level][x][y].type.blockFov == true){
			
				return 0;
			}else{
			
				return 0.005;
			}
		}
		
		var light = new ROT.Lighting(reflectivity, {range: lightRange, passes: 2});
		light.setFOV(fov);
	
		light.setLight(x, y, chosenColor);
	
		var lightingCallback = function(currentX, currentY, color) {
				
			lightData[currentX + ',' + currentY] = color;
			map.cells[level][currentX][currentY].isLit = true;
		}
	
		light.compute(lightingCallback);
		
		var coordinates,
			ambientLight = [100,100,100],
			lights,
			baseColor,
			finalColor;
		
		for(var n in lightData){
			
			coordinates = getCoordinates(n);
			
			if(screen.getDistanceSquare(x, y, coordinates.x, coordinates.y) <= lightRange){
					
				baseColor = (map.cells[level][coordinates.x][coordinates.y].type.type == 'floor' ? [100,100,100] : [50,50,50]);
				
				lights = ambientLight;
			
				lights = ROT.Color.add(lights, lightData[n]);
			
				finalColor = ROT.Color.multiply(baseColor, lights);
			
				map.cells[level][coordinates.x][coordinates.y].type.lightColor = ROT.Color.toRGB(finalColor);
				map.cells[level][x][y].lightSource.coords.push({x: coordinates.x, y: coordinates.y});
			}
		}
	}
	
	class LightSource {
		
		//type to typ swiatła z tablicy lightSources, object to obiekt gdzie źródło światła zostanie umieszczone (pole na planszy);
		
		constructor(type, object){
			
			this.position = {};
			this.stats = {speed: 1000};
			this.color = lightSources[type].color;
			this.range = lightSources[type].range;	
			
			this.position.level = object.level;
			this.position.x = object.x;
			this.position.y = object.y;
			
			map.cells[this.position.level].time.scheduler.add(this, true);
			object.lightSource.source = this;
		}
		
		getSpeed(){
			
			return this.stats.speed;
		}
		
		act(){
			
			emitLight(this.position.level, this.position.x, this.position.y, this.color, this.range);
		}
		
		douse(){
			
			var source = map.cells[this.position.level][this.position.x][this.position.y].lightSource;
			
			for(var i=0; i<source.coords.length; i++){
				
				map.cells[this.position.level][source.coords[i].x][source.coords[i].y].type.lightColor = null;
				map.cells[this.position.level][source.coords[i].x][source.coords[i].y].isLit = false;
			}

			map.cells[this.position.level][this.position.x][this.position.y].lightSource = {source: null, coords: []};
			map.cells[this.position.level].time.scheduler.remove(this);
		}
	}
	
	class IgniteFire{
		
		constructor(level, x, y){
			
			this.queue = [];
			this.speed = 110;
			this.directions = [{x: -1, y: -1}, {x: -1, y: 0}, {x: -1, y: 1}, {x: 0, y: -1}, {x: 0, y: 1}, {x: 1, y: -1}, {x: 1, y: 0}, {x: 1, y: 1}];
			
			this.queue.push({level: level, x: x, y: y, fire: new LightSource('fire', map.cells[level][x][y]), counter: 16});
			map.cells[level][x][y].isOnFire = true;
			map.cells[level].time.scheduler.add(this, true);
		}
		
		getSpeed(){
			
			return this.speed;
		}
		
		spreadFire(level, x, y){
			
			var tmpX,
				tmpY;
			
			for(var i=0; i<this.directions.length; i++){
				
				tmpX = x + this.directions[i].x;
				tmpY = y + this.directions[i].y;
				
				if(map.cells[level][tmpX][tmpY].isOnFire === true || map.cells[level][tmpX][tmpY].type.flammable === false){
					
					continue;
				}else{
					
					this.queue.push({level: level, x: tmpX, y: tmpY, fire: new LightSource('fire', map.cells[level][tmpX][tmpY]), counter: 16});
					map.cells[level][tmpX][tmpY].isOnFire = true;
				}
			}
		}
		/*
		act() - po kolei sprawdza wszystkie elementy kolejki queue. Na początku obniża wartosc counter każdego elementu o 1. Gdy wynosi ona 8 wywołuje metodę spreadFire() dla współrzędnych danego elementu kolejki. Gdy wartosć counter wynosi 0 wywoływana jest metoda douse() dla współrzędnych danego elementu kolejki, zmienia typ terenu na burntGround, zmienia własnosć terentu isOnFire na false i usuwa dany element z kolejki
		*/
		act(){
			
			var level, x, y;
			
			for(var i=0; i<this.queue.length; i++){
				
				level = this.queue[i].level;
				x = this.queue[i].x;
				y = this.queue[i].y;
				this.queue[i].counter--;
				
				if(this.queue[i].counter == 8){
					
					this.spreadFire(this.queue[i].level, this.queue[i].x, this.queue[i].y);
				}else if(this.queue[i].counter == 0){
					
					this.queue[i].fire.douse();
					map.setTerrain(level, x, y, 'burntGround');
					map.cells[level][x][y].isOnFire = false;
					this.queue.splice(i, 1);
					//because we removed one element from queue, we need to substract one from i counter - otherwise one element would be ommited
					i--;
				}
			}
			
			if(this.queue.length == 0){
				
				map.cells[level].time.scheduler.remove(this);
			}
		}
	}
	
	return {
		emitLight: emitLight,
		lightSources: lightSources,
		LightSource: LightSource,
		IgniteFire: IgniteFire
	}
});