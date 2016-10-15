/**
 * Created by Furman on 14.10.2016.
 */
/*
module containing hash object of functions used in evHandlers module in equip() function
*/
define(['screen', 'map'], function(screen, map){

    var equip = {
        //HEAD
        65: function(ev){


        },

        //TORSO
        66: function(){

            var list;

            screen.display.clear();

            if(this.equipment.torso.description === 'empty') {

                screen.display.drawText(5, 0, 'Select item you want to wear:');

                list = drawObjectInventory(this, 'armours');

                this.handleEvent = wearTorsoEventHandler;
            }

            function wearTorsoEventHandler(ev){

                var identifier = list[ev.which - 65].identifier;

                screen.placeMessage('You wear ' + this.inventory[identifier].description + '.');
                this.equipment.torso = this.inventory.splice(identifier, 1)[0];

                esc(this);
            }
        },

        //RIGHT HAND
        67: function(ev){


        },
        //LEFT HAND
        68: function(ev){


        },
        //LEGS
        69: function(ev){


        },
        //FEET
        70: function(ev){


        }
    };
    //similiar to function in evHandlers module, but we draw only certain type of items
    function drawObjectInventory(object, type){

        var list = [],
            itemClass = null,
            drawnText,
            currentRow = 2;

        for(var i=0; i<object.inventory.length; i++){

            list.push({item: object.inventory[i], type: object.inventory[i].type, identifier: i});
        }

        screen.bubbleSort(list, 'type');

        for(var i=0; i<list.length; i++){

            if(list[i].item.type === type) {

                drawnText = '%c{darkgoldenrod}[' + String.fromCharCode(97 + i) + ']%c{}' + screen.removeFirst(list[i].item.description);
                screen.display.drawText(1, currentRow, drawnText);

                currentRow++;
            }
        }

        return list;
    }

    function esc(player){

        screen.display.clear();
        screen.drawVisibleCells(map.cells[player.position.level]);
        player.handleEvent = defaultEventHandler;
        //JAK SIĘ Z POWROTEM ODWOLAC DO EVHANDLERS??
    }

    return{

        equip: equip
    }
});