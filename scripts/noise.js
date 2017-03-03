define(['screen', 'map'], function(screen, map){
	
	function getCoordinates(key){
		
		var comaIndex = key.search(','),
			x = parseInt(key.substring(0, comaIndex)),
			y = parseInt(key.substring(comaIndex + 1));
			
		return {x: x, y: y};
	}
	
	//DO DODANIA JEDNA FUNKCJONALNOŚĆ, DLA KAŻDEGO POLA POWINNA BYĆ ZWRACANA INTENSYWNOŚĆ DŹWIĘKU NA TYM POLU
	
	/*
	emitNoise() - funkcja odpowiadająca za tworzenie i propagację dźwięku. Działa na zasadzie algorytmu flood fill. Parametry level, x, y odpowiadają poziomowi i współrzędnym punktu z którego emitowany jest dźwięk. Parametr intensity odpowiada głośności - im większa wartość, tym dalej dźwięk będzie propagowany. Parametr callback(level, x, y) to funkcja zwrotna wywoływana dla każdego pola do którego dźwięk dojdzie (np. zmiana wartości danego pola, zmiana parametrów potwora znajdującego się na nim).
	*/
	
	function emitNoise(level, x, y, intensity, callback){
		
		var loudness = intensity,
			newX,
			newY,
			queue = [],
			visitedCells = {};
		
		/*
		queue to kolejka pól dla których będzie wywoływana funkcja zwrotna. Ponadto dla każdego pola z kolejki będą dodawani jego sąsiedzi o ile spełnią warunki. Zmienna visitedCells to zbiór współrzędnych pól już odwiedzonych. Używana poniżej, aby nie dodawać danego pola do kolejki więcej niż jeden raz. Zaczynamy od pola startowego i oznaczamy je jako odwiedzone
		*/
	
		visitedCells[x+','+y] = 1;
		
		/*
		główna pętla while. Odpowiedzialna za wywoływanie funkcji callback dla pierwszego elementu kolejki, dodawanie kolejnych elementów do kolejki. Na sam koniec usuwany jest jej pierwszy element. Pętla jest przerywana w przypadku gdy natężenie dźwięku spadnie do zera.
		*/
		
		while(queue.length > 0){
			
			if(queue[0].loudness < 1){
				
				break;
			}
			
			callback(level, queue[0].x, queue[0].y);
			
			//dodajemy sąsiadów badanego pola do kolejki, o ile nie byli już wcześniej dodani i nie blokują dźwięku
			
			for(var i=-1; i<=1; i++){
				
				for(var j=-1; j<=1; j++){
					
					newX = queue[0].x + i;
					newY = queue[0].y + j;
					
					if(i == 0 && j == 0){
						
						continue;
					}
					
					if(newX < 0 || newX > screen.options.width - 1 || newY < 0 || newY > screen.options.height - 1){
						
						continue;
					}
					
					if(visitedCells[newX + ',' + newY] == 1){
						
						continue;
					}
					
					if(map.cells[level][newX][newY].type.type == 'wall'){
						
						continue;
					}
					
					//jeżeli dany sąsiad spełnia wszystkie kryteria, dodajemy go do kolejki i odznaczamy jako odwiedzonego
					queue.push({x: newX, y: newY, loudness: queue[0].loudness - 1});
					visitedCells[newX + ',' + newY] = 1;
				}
			}
			
			queue.shift();
		}
	}
	
	return {
		
		emitNoise: emitNoise
	}
});