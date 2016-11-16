/**
 * Created by Furman on 13.11.2016.
 */

define(['map', 'screen', 'pathfinding', 'combat'], function(map, screen, pathfinding, combat){

   var ai = {

       nextStep: nextStep,
       examineStatus: examineStatus
   };

   function nextStep(monster){

       var nextStep,
           examineFovResult = examineFov(monster),
           examineGroundResult = examineGroundItems(monster, examineFovResult);

       if(examineGroundResult['no_action'] === true) {

           if (monster.currentGoal !== null && monster.position.x === monster.currentGoal.x && monster.position.y === monster.currentGoal.y) {

               monster.currentGoal = null;
           }

           //if monster doesn't have any goal in current turn, we set one
           setGoal(monster);
           //if monster has anything interesing in his current Fov, his currentGoal is changed
           if (examineFovResult.length > 0) {

               monster.currentGoal = examineFovResult[0];
           }

           /*
            now we calculate next step. nextStep is {x: x, y: y} coordinates object, first element of array returned by findPath method. First for current goal we check if there exists clear path (not blocked by other monsters/player). If such path doesn't exist (is blocked), nextStep is first element of array returned by findPath method with enabled path blocked by other creatures
            */

           if (pathfinding.findPath(monster.currentGoal.x, monster.currentGoal.y, monster.position.x, monster.position.y, monster, 'block').length > 0) {

               nextStep = pathfinding.findPath(monster.currentGoal.x, monster.currentGoal.y, monster.position.x, monster.position.y, monster, 'block')[0];
           } else {

               nextStep = pathfinding.findPath(monster.currentGoal.x, monster.currentGoal.y, monster.position.x, monster.position.y, monster, 'pass')[0]
           }

           //we call monster move() method for direction towards monster next step

           monster.move(nextStep.x - monster.position.x, nextStep.y - monster.position.y);
       }else if(examineGroundResult['no_action'] === false){

           monster.pickUp(examineGroundResult['pick_up']);
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

       function examineFov(monster){

           var cellsOfInterest = [], //returned array of interesing map coordinates
               examinedCell; //currently examined cell

           /*
           we iterate through monster current field of view
            */
           for(var i=0; i<monster.currentFov.length; i++){

               examinedCell = map.cells[monster.position.level][monster.currentFov[i].x][monster.currentFov[i].y];

               if(examinedCell.entity !== null && examinedCell.entity !== monster && monster.checkIfHostile(examinedCell.entity) === true){

                   //if examined cell has hostile monster we push that cell into our array
                   cellsOfInterest.push({
                       x: monster.currentFov[i].x,
                       y: monster.currentFov[i].y,
                       type: 'hostile',
                       target: examinedCell.entity,
                       index: null,
                       distance: screen.getDistance(examinedCell.x, examinedCell.y, monster.position.x, monster.position.y),
                       priority: undefined
                   });

                   setPriority(monster, cellsOfInterest[cellsOfInterest.length - 1]);
               }

               if(examinedCell.inventory.length > 0){

                   /*
                   if examined cell inventory isn't empty and there are no entities other than examining monster, we iterate through mentioned inventory, and push all the items found. Later we will filter them by removing not interesing items
                    */
                   for(var j=0; j<examinedCell.inventory.length; j++) {

                       cellsOfInterest.push({
                           x: monster.currentFov[i].x,
                           y: monster.currentFov[i].y,
                           type: 'item',
                           target: examinedCell.inventory[j],
                           index: j,
                           distance: screen.getDistance(examinedCell.x, examinedCell.y, monster.position.x, monster.position.y),
                           priority: undefined
                       });

                       setPriority(monster, cellsOfInterest[cellsOfInterest.length - 1]);
                   }
               }
           }

           //we filter items in monster field of view, and remove not needed items
           filterFovItems(monster, cellsOfInterest);

           //we sort obtained cellsOFInterest array two times. First by distance parameter, second time by priority (so in case if there are two object of same priority
           //monster would pick up closest one)

           screen.bubbleSort(cellsOfInterest, 'distance');
           screen.bubbleSort(cellsOfInterest, 'priority');

           //if monster inventory is already full, he will not pick up any additional items

           if(monster.inventory.length > 12){

               cellsOfInterest = [];
           }

           return cellsOfInterest;

           /*
           target is element (usually last) of cellsOfInterest array. Function which set up priorities for certain objects (hostile monsters, items) for selected monster.
            */
           function setPriority(monster, target){

               //basic value
               target.priority = 6;
               if(target.type === 'hostile' && target.distance >= 3){

                   //distant hostiles gets lowest priority
                   target.priority = 5;
               }else if(target.type === 'item' && (target.target.type === 'potions' || target.target.type === 'scrolls') && (target.target.group === 'boost' || target.target.group === 'healing')){

                   //if there is no close hostiles, and there are boosting or healing items in field of view
                   target.priority = 4;
               }else if(target.type === 'item' && target.target.type === 'weapons' && monster.equipment['right hand'].description === 'empty'){

                   //if there are no close hostiles, and monster is bare handed and there is a weapon in his field of view
                   target.priority = 4;
               }else if(target.type === 'hostile' && target.distance < 3){

                   //if there is hostile in nearest vicinity
                   target.priority = 2;
               }else if((target.target.type === 'potions' || target.target.type === 'scrolls') && (target.target.group === 'healing' || target.target.group === 'escape') && monster.hp < monster.maxHp * 0.25){

                   //if monster is in critical condition and there is a healing or escape item in field of view, it gets highest priority
                   target.priority = 1;
               }
           }

           /*
           function which filters items in monster's fov and removes not needed items
            */
           function filterFovItems(monster, items){

               for(var i=0; i<items.length; i++){

                   //first we consider weapons. If examined weapon max damage is lower or equal than current weapon, ignore it
                   if(items[i].target.type === 'weapons'){

                       if(combat.calcMax(monster.weapon.damage) >= combat.calcMax(items[i].target.damage)){

                           items.splice(i, 1);
                           i--;
                       }
                   }else if(items[i].target.type === 'armours' || items[i].target.type === 'helmets' || items[i].target.type === 'legs' || items[i].target.type === 'boots'){

                       //next we examine armours. We iterate through monster equipment. If item type is same as equipped item type, we compare them
                       //if examined items defense is lower or equal than currently weared, ignore it
                       for(var n in monster.equipment){

                           if(monster.equipment[n].description !== 'empty' && monster.equipment[n].type === items[i].target.type && monster.equipment[n].defense >= items[i].target.defense){

                               items.splice(i, 1);
                               i--;
                           }
                       }
                   }
               }
           }
       }

       /*
       function which examines ground items in monster current position. If top priority item is there, monster picks it up. Top priority item is always first element of cellsOfInterest array (because it was sorted by priority parameter in examineFov method)
        */
       function examineGroundItems(monster, cellsOfInterest){

           var examinedCell = map.cells[monster.position.level][monster.position.x][monster.position.y];

           for(var i=0; i<examinedCell.inventory.length; i++){

               if(examinedCell.inventory[i] === cellsOfInterest[0].target){

                   return {'pick_up': i, 'no_action': false};
               }
           }

           return {'pick_up': null, 'no_action': true};
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

   return{

       ai: ai
   }
});
