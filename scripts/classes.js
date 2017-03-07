define([], function(){

	//list of stats gained on every level by different classes
	var statGain = {

		'fighter': ['strength', 'strength', 'dexterity', 'constitution'],
		'archer': ['dexterity', 'dexterity', 'dexterity', 'strength', 'constitution']
	};

	/*
	each class when gaining level gets additional hp equal to highest roll from multiple rolls 1d(class HD). numberOfHDRoll object represent how many rolls certain class will have after gaining level 
	*/
	var numberOfHDRoll = {

		'fighter': 2,
		'archer': 1
	}

	return {

		statGain: statGain,
		numberOfHDRoll: numberOfHDRoll
	}
});