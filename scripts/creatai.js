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
           examineGroundResult = examineGroundItems(monster, examineFovResult), //returns object {'pick up': (index or null), 'no_action': true or false}
           examineInventoryResult = examineInventory(monster); //returns array of objects {action: action, index: index, slot: slot, priority: priority}

       //if monster is panicked, he runs away from source (hostile monster) of panic
       if(monster.retreatEntity !== null) {

           var escapeArray = [], //will contain possible cells to escape with distance
               examinedCell,
               isTreatInSight = false,
               currentRetreatPath;

           //monster examines current field of view in search of hostile which is cause of panic
           for(var i=0; i<monster.currentFov.length; i++) {

               examinedCell = map.cells[monster.position.level][monster.currentFov[i].x][monster.currentFov[i].y];

               if(examinedCell.entity === monster.retreatEntity) {

                   //if panic source is found, we remember his position
                   isTreatInSight = true;
                   monster.lastSeenTreatPosition.x = examinedCell.x;
                   monster.lastSeenTreatPosition.y = examinedCell.y;
               }
           }

           /*
           monster examines his current field of view, and for each reachable cell, we push it into escapeArray with coordinates and distance
            */
           for(var i=0; i<monster.currentFov.length; i++){

               examinedCell = map.cells[monster.position.level][monster.currentFov[i].x][monster.currentFov[i].y];

               if(isTreatInSight === true && pathfinding.findPath(examinedCell.x, examinedCell.y, monster.position.x, monster.position.y, monster, 'block').length > 0){

                   //if panic source is in field of view, each examined cell gets distance between that cell and hostile
                   escapeArray.push({x: examinedCell.x, y: examinedCell.y, distance: screen.getDistance(examinedCell.x, examinedCell.y, monster.retreatEntity.position.x, monster.retreatEntity.position.y)});
               }else if(isTreatInSight === false && pathfinding.findPath(monster.lastSeenTreatPosition.x, monster.lastSeenTreatPosition.y, examinedCell.x, examinedCell.y, monster, 'block').length > 0){

                   //if panic source is not in field of view, each examined cell gets distance equal of distance between that cell and last remembered hostile position
                   escapeArray.push({x: examinedCell.x, y: examinedCell.y, distance: screen.getDistance(examinedCell.x, examinedCell.y, monster.lastSeenTreatPosition.x, monster.lastSeenTreatPosition.y)});
               }
           }

           //we sort escapeArray by distance
           screen.bubbleSort(escapeArray, 'distance');

           //we calculate path between monster and cell of greatest distance from panic source
           currentRetreatPath = pathfinding.findPath(escapeArray[escapeArray.length - 1].x, escapeArray[escapeArray.length - 1].y, monster.position.x, monster.position.y, monster, 'block');

           //if such path exists, we move monster
           if(currentRetreatPath.length > 0) {

               monster.move(currentRetreatPath[0].x - monster.position.x, currentRetreatPath[0].y - monster.position.y);
           }else{

               if(isTreatInSight === true && screen.getDistance(monster.position.x, monster.position.y, monster.retreatEntity.position.x, monster.retreatEntity.position.y) < 1.5){

                   monster.move(retreatEntity.position.x - monster.position.x, retreatEntity.position.y - monster.position.y);
               }else if(isTreatInSight === true && screen.getDistance(monster.position.x, monster.position.y, monster.retreatEntity.position.x, monster.retreatEntity.position.y) > 1.5) {
                   //kod odpowiadający za losowe wiadomości o mercy itp.

               }else if(isTreatInSight === false){

                   //losowa wiadomość o wnerwie
               }
           }
           return;
           /*
            IF ENTITY ISN'T PANICKED (END OF PANIC IF STATEMENT)
            we examine if monster wants to use any item from its inventory. If yes, we call proper action from examineInventoryResult and stop whole nextStep function
            */
       }else if(examineInventoryResult.length > 0){

           switch(examineInventoryResult[0].action){

               case 'equip':

                   monster.equip(examineInventoryResult[0].index, examineInventoryResult[0].slot);
                   break;
               case 'unequip':

                   monster.unequip(examineInventoryResult[0].slot);
                   break;
               case 'use':

                   examineInventoryResult[0].item.useEffect(examineInventoryResult[0].item, monster);
                   break;
           }

           return;
       }

       //IF ENTITY IS NOT PANICKED, AND DON'T HAVE ANYTHING IN INVENTORY TO USE
       if(examineGroundResult['no_action'] === true) {

           //if entity reached his current goal, we reset it
           if (monster.currentGoal !== null && monster.position.x === monster.currentGoal.x && monster.position.y === monster.currentGoal.y) {

               monster.currentGoal = null;
           }

           //if most interesing thing in FOV is hostile, we set his coordinates as current goal (so monster would follow his last known coordinates, if track is lost at some point
           if(examineFovResult[0] && examineFovResult[0].type === 'hostile'){

               monster.currentGoal = {x: examineFovResult[0].x, y: examineFovResult[0].y};
           }

           //if monster doesn't have any goal in current turn, we set one
           if(monster.currentGoal === null) {

               setGoal(monster);
           }
           //if monster has anything interesing in his current Fov, his currentGoal is changed
           if (examineFovResult.length > 0) {

               monster.currentGoal = examineFovResult[0];
           }

           /*
            now we calculate next step. nextStep is {x: x, y: y} coordinates object, first element of array returned by findPath method. First thing, for current goal we check if there exists clear path (not blocked by other monsters/player). If such path doesn't exist (is blocked), nextStep is first element of array returned by findPath method with enabled path blocked by other creatures
            */

           if (pathfinding.findPath(monster.currentGoal.x, monster.currentGoal.y, monster.position.x, monster.position.y, monster, 'block').length > 0) {

               nextStep = pathfinding.findPath(monster.currentGoal.x, monster.currentGoal.y, monster.position.x, monster.position.y, monster, 'block')[0];
           } else {

               nextStep = pathfinding.findPath(monster.currentGoal.x, monster.currentGoal.y, monster.position.x, monster.position.y, monster, 'pass')[0]
           }
           //check if next step cell is empty or is occupied by hostile
           if(map.cells[monster.position.level][nextStep.x][nextStep.y].entity === null || (map.cells[monster.position.level][nextStep.x][nextStep.y].entity !== null && monster.checkIfHostile(map.cells[monster.position.level][nextStep.x][nextStep.y].entity) === true)) {

               monster.move(nextStep.x - monster.position.x, nextStep.y - monster.position.y); //we call monster move() method for direction towards monster next step
               monster.waitCounter = 0; //and we reset monster wait counter, in case in previous turn it was non zero
           }else if(map.cells[monster.position.level][nextStep.x][nextStep.y].entity !== null && monster.checkIfHostile(map.cells[monster.position.level][nextStep.x][nextStep.y].entity) !== true){

               var encounteredEntity = map.cells[monster.position.level][nextStep.x][nextStep.y].entity;
               //else if next step cell is occupied by friendly entity, monster waits 1 turns and if nothing changes, sets new goal
               if(monster.waitCounter > 1){

                   monster.waitCounter = 0;
                   setGoal(monster);
               }else{
                   console.log(monster.waitCounter);
                   monster.waitCounter++;
               }

               /*if(encounteredEntity.type.type !== 'player') {

                   if (encounteredEntity.swap.ready === false && monster.checkIfHostile(encounteredEntity) !== true) {

                       monster.swap.ready = true;
                       monster.swap.entity = encounteredEntity;
                   } else if (encounteredEntity.swap.ready === true && encounteredEntity.swap.entity === monster) {

                       monster.swapPlaces(encounteredEntity);
                   } else if (encounteredEntity.swap.ready === true && encounteredEntity.swap.entity !== monster) {

                       setGoal(monster);
                   }
               }*/
           }

       }else if(examineGroundResult['no_action'] === false){

           monster.pickUp(examineGroundResult['pick_up']);
       }

       function setGoal(monster){

           //we choose random floor tile
           var newGoal = getCoordinates(Object.keys(map.cells[monster.position.level].floorTiles).random());
           //if there is no path to choosen floor tile, we call function again
           if(pathfinding.findPath(newGoal.x, newGoal.y, monster.position.x, monster.position.y, monster, 'pass').length === 0){

               setGoal(monster);
           }else{

               monster.currentGoal = newGoal;
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
                       slatedForRemoval: false,
                       distance: screen.getDistance(examinedCell.x, examinedCell.y, monster.position.x, monster.position.y),
                       priority: undefined
                   });

                   setPriority(monster, cellsOfInterest[cellsOfInterest.length - 1]);
               }

               if(examinedCell.inventory.length > 0 && monster.status.berserk.value === 0){

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
                           slatedForRemoval: false,
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
               if(target.type === 'hostile' && target.distance >= 4){

                   //distant hostiles gets lowest priority
                   target.priority = 5;
               }else if(target.type === 'item' && (target.target.type === 'potions' || target.target.type === 'scrolls') && (target.target.group === 'boost' || target.target.group === 'healing')){

                   //if there is no close hostiles, and there are boosting or healing items in field of view
                   target.priority = 4;
               }else if(target.type === 'item' && (target.target.type === 'armours' || target.target.type === 'helmets' || target.target.type === 'legs' || target.target.type === 'boots')){

                   target.priority = 3;
               }else if(target.type === 'item' && target.target.type === 'weapons' && monster.equipment['right hand'].description === 'empty'){

                   //if there are no close hostiles, and monster is bare handed and there is a weapon in his field of view
                   target.priority = 1;
               }else if(target.type === 'hostile' && target.distance < 4){

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

                   //in first step we check if there exist clear path to item. If not, ignore it.
                   var pathToCurrentItem = pathfinding.findPath(items[i].x, items[i].y, monster.position.x, monster.position.y, monster, 'pass');

                   if(pathToCurrentItem.length === 0 && (monster.position.x !== items[i].x || monster.position.y !== items[i].y)){

                       items[i].slatedForRemoval = true;
                   }

                   if(items[i].target.type === 'weapons'){

                       //first we consider weapons. If examined weapon max damage is lower or equal to current weapon, ignore it
                       if(combat.calcMax(monster.weapon.damage) >= combat.calcMax(items[i].target.damage)){

                           if(!(monster.favouredWeaponType === 'ranged' && items[i].target.sort === 'ranged' && monster.weapon.ranged !== true)){

                               items[i].slatedForRemoval = true;
                           }
                       }

                       //if examined weapon is ranged, and monster doesn't like ranged weapons, ignore it
                       if((items[i].target.sort === 'ranged') && monster.favouredWeaponType !== 'ranged'){

                           items[i].slatedForRemoval = true;
                       }

                       //now we look if items already have other weapon. If yes, we remove worst of two, so monster will pick up always best weapon

                       for(var j=0; j<i; j++){

                           if(items[j].slatedForRemoval !== true && items[i].slatedForRemoval !== true && items[j].target.type === 'weapons'){

                               if(combat.calcMax(items[j].target.damage) < combat.calcMax(items[i].target.damage)){

                                   items[j].slatedForRemoval = true;
                               }else{

                                   items[i].slatedForRemoval = true;
                               }
                           }
                       }
                   }else if(items[i].target.type === 'armours' || items[i].target.type === 'helmets' || items[i].target.type === 'legs' || items[i].target.type === 'boots'){

                       //next we examine armours. We iterate through monster equipment. If item type is same as equipped item type, we compare them
                       //if examined items defense is lower or equal than currently worn, ignore it
                       for(var n in monster.equipment){

                           if(monster.equipment[n].description !== 'empty' && monster.equipment[n].type === items[i].target.type && monster.equipment[n].armourBonus >= items[i].target.armourBonus){

                               items[i].slatedForRemoval = true;
                           }
                       }
                       //if there are two armour pieces of same type in field of view, monster will pick up better one
                       for(var j=0; j<i; j++){

                           if(items[j].slatedForRemoval !== true && items[i].slatedForRemoval !== true && (items[j].target.type === items[i].target.type)){

                               if(items[j].target.armourBonus < items[i].target.armourBonus){

                                   items[j].slatedForRemoval = true;
                               }else{

                                   items[i].slatedForRemoval = true;
                               }
                           }
                       }
                   }else if((items[i].target.type === 'potions' && monster.abilities.cantDrinkPotions === true) || (items[i].target.type === 'scrolls' && monster.abilities.illiterate === true)){

                       items[i].slatedForRemoval = true;
                   }else if(items[i].target.type === 'ammunition' && monster.favouredWeaponType !== 'ranged'){

                       items[i].slatedForRemoval = true;
                   }
               }

               //we remove all items from items array which has been marked to remove

               for(var i=0; i<items.length; i++){

                   if(items[i].slatedForRemoval === true){

                       items.splice(i, 1);
                       i--;
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

               if(cellsOfInterest.length > 0 && examinedCell.inventory[i] === cellsOfInterest[0].target && monster.status.berserk.value === 0){

                   return {'pick_up': i, 'no_action': false};
               }
           }

           return {'pick_up': null, 'no_action': true};
       }
   }

   function examineInventory(monster){

       //array with inventory item indexes and set priority of that item
       var items = [],
           enemyInSight = [],
           examinedCell,
           examinedItem,
           enemyDistance;

       lookForHostiles(monster);

       for(var i=0; i<monster.inventory.length; i++){

           examinedItem = monster.inventory[i];

           if(enemyInSight.length === 0){

               if(examinedItem.type === 'armours' || examinedItem.type === 'legs' || examinedItem.type === 'helmets' || examinedItem.type === 'boots'){

                   if(monster.equipment[examinedItem.slot]) {

                       if (monster.equipment[examinedItem.slot].description === 'empty') {

                           items.push({action: 'equip', index: i, slot: examinedItem.slot, priority: 2});
                       } else {

                           if (examinedItem.armourBonus > monster.equipment[examinedItem.slot].armourBonus) {

                               items.push({
                                   action: 'unequip',
                                   index: examinedItem.slot,
                                   slot: examinedItem.slot,
                                   priority: 2
                               });
                           }
                       }
                   }
               }else if(examinedItem.type === 'weapons'){

                   /*
                   if monster's favoured weapon type is ranged, and he has proper ammunition in his inventory, monster wants to equip ranged weapon
                    */
                   if(examinedItem.sort === 'ranged' && monster.favouredWeaponType === 'ranged' && searchForItemName(monster, examinedItem.ammoType) === true){

                       if(monster.weapon.sort && monster.weapon.sort === 'ranged'){

                           if(combat.calcMax(monster.weapon.damage) < combat.calcMax(examinedItem.damage)){

                               items.push({action: 'unequip', index: 'right hand', slot: examinedItem.slot, priority: 1});
                           }
                       }else if(monster.weapon.natural === false){

                           items.push({action: 'unequip', index: 'right hand', slot: examinedItem.slot, priority: 1});
                       }else if(monster.weapon.natural === true){

                           items.push({action: 'equip', index: i, slot: 'right hand', priority: 2});
                       }
                   }else if(examinedItem.sort !== 'ranged'){

                       if(!(monster.favouredWeaponType === 'ranged' && monster.weapon.sort && monster.weapon.sort === 'ranged')) {

                           if (combat.calcMax(monster.weapon.damage) < combat.calcMax(examinedItem.damage)) {

                               if (monster.weapon.natural === true) {

                                   items.push({action: 'equip', index: i, slot: 'right hand', priority: 2});
                               } else {

                                   items.push({
                                       action: 'unequip',
                                       index: 'right hand',
                                       slot: examinedItem.slot,
                                       priority: 1
                                   });
                               }
                           }
                       }
                   }
               }else if(examinedItem.type === 'ammunition'){

                   if(monster.weapon.ammoType && monster.weapon.ammoType === examinedItem.name){

                       items.push({action: 'equip', index: i, slot: 'left hand', priority: 1});
                   }
               }
           }else if(enemyInSight.length > 0){

               enemyDistance = screen.getDistance(monster.position.x, monster.position.y, enemyInSight[0].x, enemyInSight[0].y);

               if(monster.status.berserk.value === 0) {

                   if (enemyDistance >= 4) {

                       if(monster.equipment[examinedItem.slot]) {

                           if (examinedItem.type === 'armours' || examinedItem.type === 'legs' || examinedItem.type === 'helmets' || examinedItem.type === 'boots') {

                               if (monster.equipment[examinedItem.slot].description === 'empty') {

                                   items.push({action: 'equip', index: i, slot: examinedItem.slot, priority: 2});
                               } else {

                                   if (examinedItem.armourBonus > monster.equipment[examinedItem.slot].armourBonus) {

                                       items.push({
                                           action: 'unequip',
                                           index: examinedItem.slot,
                                           slot: examinedItem.slot,
                                           priority: 2
                                       })
                                   }
                               }
                           }
                       }
                   }

                   if (examinedItem.type === 'weapons') {

                       if (combat.calcMax(monster.weapon.damage) < combat.calcMax(examinedItem.damage)) {

                           if (monster.weapon.natural === true) {

                               items.push({action: 'equip', index: i, slot: 'right hand', priority: 1});
                           } else {

                               items.push({
                                   action: 'unequip',
                                   index: 'right hand',
                                   slot: examinedItem.slot,
                                   priority: 2
                               });
                           }
                       }
                   } else if (examinedItem.type === 'potions' && monster.hp < (0.33 * monster.maxHp) && examinedItem.group === 'healing') {

                       items.push({action: 'use', index: i, priority: 1, item: examinedItem});
                   }

                   if (enemyDistance < 4) {

                       if (examinedItem.type === 'potions' || examinedItem.type === 'scrolls') {

                           if (examinedItem.group === 'boost') {

                               items.push({action: 'use', index: i, priority: 1, item: examinedItem});
                           } else if (examinedItem.group === 'escape' && monster.hp < 0.25 * monster.maxHp) {

                               items.push({action: 'use', index: i, priority: 2, item: examinedItem});
                           }
                       }
                   }
               }
           }
       }

       screen.bubbleSort(items, 'priority');

       return items;

       function lookForHostiles(monster){

           for(var i=0; i<monster.currentFov.length; i++){

               examinedCell = map.cells[monster.position.level][monster.currentFov[i].x][monster.currentFov[i].y];

               if(examinedCell.entity !== null && monster.checkIfHostile(examinedCell.entity) === true){

                   enemyInSight.push({x: monster.currentFov[i].x, y: monster.currentFov[i].y, entity: examinedCell.entity, distance: screen.getDistance(monster.position.x, monster.position.y, examinedCell.x, examinedCell.y)});
               }
           }

           if(enemyInSight.length > 0){

               screen.bubbleSort(enemyInSight, 'distance');
           }
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

   /*
   function responsible for searching monster inventory for item with certain name. Returns true if item is found, returns false otherwise
    */
   function searchForItemName(monster, name){

       var examinedItem;

       for(var i=0; i<monster.inventory.length; i++){

           examinedItem = monster.inventory[i];

           if(examinedItem.name && examinedItem.name === name){

               return true;
           }
       }

       for(var n in monster.equipment){

           examinedItem = monster.equipment[n];

           if(examinedItem.name && examinedItem.name === name){

               return true;
           }
       }

       return false;
   }

   return{

       ai: ai
   }
});
