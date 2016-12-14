/*
created by Furman 2016
*/
/*
module containing AI methods for unintelligent animals
*/

define(['map', 'screen', 'pathfinding'], function(map, screen, pathfinding){

    var ai = {

        nextStep: nextStep,
        examineStatus: examineStatus
    };
	
	function nextStep(monster){

        var nextStep,
            examineFovResult = examineFov(monster);

        //if monster reached his current goal, we reset his currentGoal variable
        if(monster.currentGoal !== null && monster.position.x === monster.currentGoal.x && monster.position.y === monster.currentGoal.y){

            monster.currentGoal = null;
        }

        //if monster doesn't have any goal in current turn, we set one
	    setGoal(monster);
        //if monster has anything interesing in his current Fov, his currentGoal is changed
        if(examineFovResult.length > 0){

            monster.currentGoal = examineFovResult[0];
        }

        /*
        now we calculate next step. nextStep is {x: x, y: y} coordinates object, first element of array returned by findPath method. First for current goal we check if there exists clear path (not blocked by other monsters/player). If such path doesn't exist (is blocked), nextStep is first element of array returned by findPath method with enabled path blocked by other creatures
         */

        if(pathfinding.findPath(monster.currentGoal.x, monster.currentGoal.y, monster.position.x, monster.position.y, monster, 'block').length > 0){

            nextStep = pathfinding.findPath(monster.currentGoal.x, monster.currentGoal.y, monster.position.x, monster.position.y, monster, 'block')[0];
        }else{

            nextStep = pathfinding.findPath(monster.currentGoal.x, monster.currentGoal.y, monster.position.x, monster.position.y, monster, 'pass')[0]
        }

        //check if next step cell is empty or is occupied by hostile
        if(map.cells[monster.position.level][nextStep.x][nextStep.y].entity === null || (map.cells[monster.position.level][nextStep.x][nextStep.y].entity !== null && monster.checkIfHostile(map.cells[monster.position.level][nextStep.x][nextStep.y].entity) === true)) {

            //we call monster move() method for direction towards monster next step
            monster.move(nextStep.x - monster.position.x, nextStep.y - monster.position.y);
            //and we reset monster wait counter, in case in previous turn it was non zero
            monster.waitCounter = 0;
        }else if(map.cells[monster.position.level][nextStep.x][nextStep.y].entity !== null && monster.checkIfHostile(map.cells[monster.position.level][nextStep.x][nextStep.y].entity) !== true){

            //else if next step cell is occupied by friendly entity, monster waits 1 turns and if nothing changes, sets new goal
            if(monster.waitCounter > 0){

                monster.waitCounter = 0;
                setGoal(monster);
            }else{

                monster.waitCounter++;
            }
        }

        function setGoal(monster){

            if(monster.currentGoal === null) {
                //we choose random floor tile
                var newGoal = getCoordinates(Object.keys(map.cells[monster.position.level].floorTiles).random());
                //if there is no path to choosen floor tile, we call function again
                if(pathfinding.findPath(newGoal.x, newGoal.y, monster.position.x, monster.position.y, monster, 'pass').length === 0){

                    setGoal(monster);
                }else{

                    monster.currentGoal = newGoal;
                }
            }
        }

        /*
        function which examines monsters current Fov. Function iterates through monster.currentFov array and picks interesing cells from it (in this case only cells with other monsters/player). Picked up cell are stored in cellsOfInterest array, which is sorted by distance, and first element (closest) is returned
         */

        function examineFov(monster){

            var cellsOfInterest = [],
                examinedCell;

            for(var i=0; i<monster.currentFov.length; i++){

                examinedCell = map.cells[monster.position.level][monster.currentFov[i].x][monster.currentFov[i].y];

                if(examinedCell.entity !== null && examinedCell.entity !== monster && monster.checkIfHostile(examinedCell.entity) === true){

                    cellsOfInterest.push({x: monster.currentFov[i].x, y: monster.currentFov[i].y, distance: screen.getDistance(examinedCell.x, examinedCell.y, monster.position.x, monster.position.y), priority: undefined});
                }
            }

            screen.bubbleSort(cellsOfInterest, 'distance');

            return cellsOfInterest;
        }
	}

    function getCoordinates(key){

        var comaIndex = key.search(','),
            x = parseInt(key.substring(0, comaIndex)),
            y = parseInt(key.substring(comaIndex + 1));

        return {x: x, y: y};
    }

    /*
    function which examines current monster statuses, and returns appriopiate action if any negative status is detected. Returns 'status ok' otherwise. Currently only negative status detected is 'prone' (fallen on ground). Will be more complex in case of intelligent monsters capable of using equipment and items
     */

    function examineStatus(entity){

        for(var n in entity.status){

            if(entity.status[n].value === 1){

                if(n === 'prone') {

                    return 'rise';
                }else if(n === 'stunned'){

                    return 'stunned';
                }
            }
        }

        return 'status ok';
    }
	
	return {
		
		ai: ai
	}
});