# Arena-RL

Simple roguelike currently being under construction in early development phase. Written in HTML5 and Javascript with require.js and rot.js.

Things implemented so far:

- random map generation, with different level types(caverns, rooms, arena) and different level themes(forest level, big chasm room with dead trees, lakes and forest level)
- different map tiles with different effects(chasms, shallow and deep water, bush, etc.)
- FOV system
- noise generation
- light system(partially done, see issues)
- fire spreading system
- inventory management and items 
- monsters and combat

You can use http://rawgit.com/ site to preview result without downloading whole repository.

TODO: 
- napisać kod odpowiedzialny za analizę statusu każdego potwora na początku każdej jego tury, przed kalkulacją kolejnego kroku. W przypadku negatywnych statusów (np. powalony na ziemię), zamiast normalnej kalkulacji podjęcie działania do wyeliminowania statusu
- napisać resztę statusów (konfuzja, ogłuszenie, trucizna)

