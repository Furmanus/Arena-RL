/**
 * Created by Furman on 08.12.2016.
 */

requirejs(['main', 'player', 'screen'], function(main, player, screen){

   //main.start();
   //main.startTest();

    function setStartScreen(){

        var selectedClass,
            selectedDisplay,
            selectedName;

        clearBody();

        var xhr= new XMLHttpRequest();
        xhr.open('GET', 'https://github.com/Furmanus/Arena-RL/blob/master/startScreen.html', false);
        xhr.onreadystatechange= function() {

            //if(xhr.readyState === 4 && xhr.status === 200) {

                document.body.innerHTML = this.responseText;
            //}
        };
        xhr.send();

        document.getElementById('domName').addEventListener('change', nameChange, true);
        document.getElementById('domClass').addEventListener('change', changeClass, true);
        document.getElementById('domDisplay').addEventListener('change', changeDisplay, true);

        document.getElementById('domStart').addEventListener('click', startGame, true);

        function startGame(){

            selectedClass = document.getElementById('domClass').value;
            selectedDisplay = document.getElementById('domDisplay').value;

            player.playerOptions.name = selectedName;
            player.playerOptions.class = selectedClass;

            if(player.playerOptions.name && validateName() === true) {

                clearBody();

                var xhr = new XMLHttpRequest();
                xhr.open('GET', 'https://github.com/Furmanus/Arena-RL/blob/master/gameScreen.html', false);
                xhr.onreadystatechange = function () {

                    //if(xhr.readyState === 4 && xhr.status === 200) {

                        document.body.innerHTML = this.responseText;
                    //}
                };
                xhr.send();

                document.body.style.display = 'flex';
                main.start();
                //main.startTest();
            }else if(!(player.playerOptions.name) || validateName() !== true){

                document.getElementById('nameWarning').innerHTML = 'Please enter your name!';
            }
        }

        function nameChange(){

            selectedName = document.getElementById('domName').value;
        }

        function changeClass(){

            selectedClass = document.getElementById('domClass').value;
        }

        function changeDisplay(){

            selectedDisplay = document.getElementById('domDisplay').value;
        }

        function validateName(){

            if(player.playerOptions.name.length > 0){

                for(var i=0; i<player.playerOptions.name.length; i++){

                    if(player.playerOptions.name[i] !== ' '){

                        return true;
                    }else if(i === player.playerOptions.name.length - 1 && player.playerOptions.name[i] === ' '){

                        return false;
                    }
                }
            }

            return false;
        }
    }

    function clearBody(){

        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    }

    setStartScreen();
});