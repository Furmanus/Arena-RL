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
			}else if(x === entity.position.x && y === entity.position.y){
				
				return true;
			}else if(map.cells[entity.position.level][x][y].type.blockMovement === true){
				
				return false;
			}else if(map.cells[entity.position.level][x][y].entity !== null){
				
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
			}else{

				var result;
				
				switch(map.cells[entity.position.level][x][y].type.type){
					
					case 'chasm':
					
					result = (entity.abilities.canFly === true) ? true : false;
					break;
					
					case 'deep water':
					
					result = (entity.abilities.breatheUnderWater === true) ? true : false;
					break;
					
					case 'closed doors':

					result = (entity.abilities.canOpenDoors === true) ? true : false;
					break;
					
					default:
					
					result = true;
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

	/*
	draws straight line from start cell to goal cell for entity. blockingCells is an array of cell types blocking line
	 */
	function bresenham(startX, startY, goalX, goalY, entity, blockingCells){

        var dx = Math.abs(goalX-startX),
        	dy = Math.abs(goalY-startY),
        	sx = (startX < goalX) ? 1 : -1,
        	sy = (startY < goalY) ? 1 : -1,
        	err = dx-dy,
			result = [];

        while(true){

        	if(validateBlockingCells(map.cells[entity.position.level][startX][startY], blockingCells) === 'block'){

				break;
			}

            result.push({x: startX, y: startY});

            if ((startX === goalX) && (startY === goalY)) {

                break;
            }

            var e2 = 2*err;
            if (e2 >-dy){

            	err -= dy;
            	startX  += sx;
            }
            if (e2 < dx){

            	err += dx;
            	startY  += sy;
            }
        }

        return result;

        function validateBlockingCells(cell, blockingCells){

			for(var i=0; i<blockingCells.length; i++){

				if(cell.type.type === blockingCells[i]){

					return 'block';
				}
			}

			return 'pass';
		}
	}
	
	return {
	
		findPath: findPath,
		bresenham: bresenham
	}
});