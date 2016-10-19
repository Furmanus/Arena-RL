/*
created by Furman 2016
*/

define(['screen', 'map'], function(screen, map){
	
	/*
	calculates and returns path from entity current position to goalCell. Third argument "type" determines whether path can pass through other creatures ('pass' value) or not ('block' value)
	*/
	
	function findPath(goalX, goalY, startX, startY, entity, type){
		
		var path = [];
		
		/*
		function used to determine whether map cell of coordinates (x,y) is passable. Returns true if it is, returns false otherwise
		*/
		
		var passableCallback = function(x,y){
			
			if(x < 0 || y < 0 || x > screen.options.width - 1 || y > screen.options.height - 1){
				
				return false;
			}
			
			if(x === entity.position.x && y === entity.position.y){
				
				return true;
			}
			
			if(map.cells[entity.position.level][x][y].type.blockMovement === true){
				
				return false;
			}
			
			if(map.cells[entity.position.level][x][y].entity !== null){
				
				switch(type){
					
					case 'block':
					return false;
					break;
					
					case 'pass':
					return true;
					break;
					
					default:
					console.log('error, algorithm type is not specified');
				}
			}
			
			if(calculateCellForEntity(entity, x, y) === 'pass'){
				
				return true;
			}else if(calculateCellForEntity(entity, x, y) === 'block'){
				
				return false;
			}
			
			//for given monster we calculate whether it can pass certain map cells
			function calculateCellForEntity(entity, x, y){
				
				var result;
				
				switch(map.cells[entity.position.level][x][y].type.type){
					
					case 'chasm':
					
					result = (entity.abilities.canFly === true) ? 'pass' : 'block';
					break;
					
					case 'deep water':
					
					result = (entity.abilities.breatheUnderWater === true) ? 'pass' : 'block';
					break;
					
					case 'closed doors':
					
					result = (entity.abilities.canOpenDoors === true) ? 'pass' : 'block';
					break;
					
					default:
					
					result = 'pass';
					break;
				}
				
				return result;
			}
		}
		
		var astar = new ROT.Path.AStar(goalX, goalY, passableCallback);
		
		/*
		third argument, function is called whenever passableCallback returns true for given coordinates
		*/
		astar.compute(startX, startY, function(x, y){
			
			path.push({level: entity.position.level, x: x, y: y});
			
		});
		
		//we remove first element of path, because it's equal to starting coordinates
		path.shift();
		return path;
	}
	
	return {
	
		findPath: findPath
	
	}
});