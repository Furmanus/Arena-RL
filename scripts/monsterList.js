define(['screen', 'animalai', 'combat', 'creatai'], function(screen, animalai, combat, creatai){

	//monster list by their danger level (numbers equals to level depth on which monster can appear
	var monsterList = {

		0: [{key: 'rat'}, {key: 'raven'}, {key: 'giant beetle'}, {key: 'kobold'}, {key: 'drow'}],
		1: [{key: 'giant centipide'}, {key: 'skeleton'}, {key: 'ghoul'}, {key: 'gnoll'}, {key: 'goblin'}, {key: 'hyena'}, {key: 'horse'}, {key: 'hobgoblin'}],
		2: [{key: 'snake'}, {key: 'wolf'}, {key: 'bugbear'}, {key: 'giant lizard'}, {key: 'lion'}, {key: 'centaur'}, {key: 'ogre'}],
		3: [{key: 'minotaur'}, {key: 'cyclops'}, {key: 'cave bear'}]
	};
	
	var monsterType = {
		
		'rat': {
			display: 'r', 
			fgColor: 'darkgoldenrod', 
			bgColor: 'transparent', 
			lookDescription: 'a rat', 
			type: {messageDisplay: 'rat', type: 'monster', family: 'animal', species: 'rat', group: 'rodent', name: 'a rat'},
			favouredStat: 'dexterity',
			HD: '0.25d8',
			xp: 135,
			size: 'tiny',
            favouredWeaponType: null,
			stats: {strength: 2, dexterity: 15, constitution: 10, intelligence: 2, wisdom: 12, charisma: 2, speed: 20, perception: 8, baseAttackBonus: 0, defense: 10},
			equipment: {
				
				'head': {description: 'empty'},
                'torso': {description: 'empty'},
                'arms': {description: 'empty'},
                'legs': {description: 'empty'}
                
			},
			ai: animalai.ai, 
			abilities: {breatheUnderWater: true, canFly: false, isSuffocating: false, canOpenDoors: false, suffocateCounter: 0, fearless: false, mindless: false, bloodless: false},
			hostileList: {species: ['human', 'snake'], family: [], entity: [], group: []},
			defaultWeapon: {name: 'teeths', description: 'a teeths', natural: true, sort: 'melee', damage: '1d3-4', critical: [20], dmgType: 'bite', criticalMultiplier: 2, criticalHit: [null]}
			},

		'snake': {
			display: 's',
			fgColor: 'lightgreen',
			bgColor: 'transparent',
			lookDescription: 'a snake',
			type: {messageDisplay: 'snake', type: 'monster', family: 'animal', species: 'snake', group: 'reptile', name: 'a snake'},
            favouredStat: 'strength',
			HD: '3d8+6',
			xp: 600,
			size: 'medium',
            favouredWeaponType: null,
			stats: {strength: 17, dexterity: 17, constitution: 13, intelligence: 1, wisdom: 12, charisma: 2, speed: 20, perception: 4, baseAttackBonus: 2, defense: 12},
			equipment: {

				'head': {description: 'empty'},
				'torso': {description: 'empty'}
			},
			ai: animalai.ai,
			abilities: {breatheUnderWater: true, canFly: false, isSuffocating: false, canOpenDoors: false, suffocateCounter: 0, fearless: false, mindless: false, bloodless: false},
			hostileList: {species: ['human', 'rat', 'kobold', 'wolf', 'hyena'], family: [], entity: [], group: ['horses']},
			defaultWeapon: {name: 'teeths', description: 'a teeths', natural: true, sort: 'melee', damage: '1d7', critical: [20], dmgType: 'bite', criticalMultiplier: 2, criticalHit: ['poisoned']}
		},

        'giant lizard': {
            display: 'l',
            fgColor: 'lightgreen',
            bgColor: 'transparent',
            lookDescription: 'a giant lizard',
            type: {messageDisplay: 'giant lizard', type: 'monster', family: 'animal', species: 'giant lizard', group: 'reptile', name: 'a giant lizard'},
            favouredStat: 'strength',
            HD: '3d8+9',
            xp: 600,
            size: 'medium',
            favouredWeaponType: null,
            stats: {strength: 17, dexterity: 15, constitution: 17, intelligence: 2, wisdom: 12, charisma: 6, speed: 18, perception: 8, baseAttackBonus: 2, defense: 13},
            equipment: {

                'head': {description: 'empty'},
                'torso': {description: 'empty'},
				'arms': {description: 'empty'},
                'legs': {description: 'empty'}
            },
            ai: animalai.ai,
            abilities: {breatheUnderWater: true, canFly: false, isSuffocating: false, canOpenDoors: false, suffocateCounter: 0, fearless: false, mindless: false, bloodless: false},
            hostileList: {species: ['human'], family: [], entity: [], group: []},
            defaultWeapon: {name: 'teeths', description: 'a teeths', natural: true, sort: 'melee', damage: '1d8+4', critical: [20], dmgType: 'bite', criticalMultiplier: 2, criticalHit: [null]}
        },

        'giant centipide': {
            display: 'c',
            fgColor: 'lightgreen',
            bgColor: 'transparent',
            lookDescription: 'a giant centipide',
            type: {messageDisplay: 'giant centipide', type: 'monster', family: 'animal', species: 'giant centipide', group: 'vermin', name: 'a giant centipide'},
            favouredStat: 'dexterity',
            HD: '1d8+1',
            xp: 200,
            size: 'medium',
            favouredWeaponType: null,
            stats: {strength: 9, dexterity: 15, constitution: 12, intelligence: 1, wisdom: 10, charisma: 2, speed: 40, perception: 5, baseAttackBonus: 0, defense: 12},
            equipment: {

                'head': {description: 'empty'},
                'torso': {description: 'empty'},
				'legs': {description: 'empty'}
            },
            ai: animalai.ai,
            abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: false, suffocateCounter: 0, fearless: false, mindless: false, bloodless: false},
            hostileList: {species: ['human'], family: [], entity: [], group: []},
            defaultWeapon: {name: 'teeths', description: 'a teeths', natural: true, sort: 'melee', damage: '1d6-1', critical: [20], dmgType: 'bite', criticalMultiplier: 2, criticalHit: ['poisoned']}
        },

        'lion': {
            display: 'c',
            fgColor: 'yellow',
            bgColor: 'transparent',
            lookDescription: 'a lion',
            type: {messageDisplay: 'lion', type: 'monster', family: 'animal', species: 'lion', group: 'cats', name: 'a lion'},
            favouredStat: 'strength',
            HD: '5d8+10',
            xp: 800,
            size: 'large',
            favouredWeaponType: null,
            stats: {strength: 21, dexterity: 17, constitution: 15, intelligence: 2, wisdom: 12, charisma: 6, speed: 40, perception: 9, baseAttackBonus: 3, defense: 13},
            equipment: {

                'head': {description: 'empty'},
                'torso': {description: 'empty'},
                'legs': {description: 'empty'},
                'arms': {description: 'empty'}
            },
            ai: animalai.ai,
            abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: false, suffocateCounter: 0, fearless: false, mindless: false, bloodless: false},
            hostileList: {species: ['human'], family: [], entity: [], group: ['canine']},
            defaultWeapon: {name: 'teeths', description: 'a teeths', natural: true, sort: 'melee', damage: '1d8+5', critical: [20], dmgType: 'bite', criticalMultiplier: 2, criticalHit: [null]}
        },

        'cave bear': {
            display: 'B',
            fgColor: 'brown',
            bgColor: 'transparent',
            lookDescription: 'a cave bear',
            type: {messageDisplay: 'cave bear', type: 'monster', family: 'animal', species: 'cave bear', group: 'bears', name: 'a cave bear'},
            favouredStat: 'strength',
            HD: '5d8+20',
            xp: 1200,
            size: 'large',
            favouredWeaponType: null,
            stats: {strength: 21, dexterity: 13, constitution: 19, intelligence: 2, wisdom: 12, charisma: 6, speed: 40, perception: 6, baseAttackBonus: 3, defense: 16},
            equipment: {

                'head': {description: 'empty'},
                'torso': {description: 'empty'},
                'legs': {description: 'empty'},
                'arms': {description: 'empty'}
            },
            ai: animalai.ai,
            abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: false, suffocateCounter: 0, fearless: false, mindless: false, bloodless: false},
            hostileList: {species: ['human'], family: [], entity: [], group: []},
            defaultWeapon: {name: 'claws', description: 'a claws', natural: true, sort: 'melee', damage: '1d6+5', critical: [20], dmgType: 'claws', criticalMultiplier: 2, criticalHit: ['bleeding']}
        },

		'wolf': {
			display: 'w',
			fgColor: 'silver',
			bgColor: 'transparent',
			lookDescription: 'a wolf',
			type: {messageDisplay: 'wolf', type: 'monster', family: 'animal', species: 'wolf', group: 'canine', name: 'a wolf'},
            favouredStat: 'constitution',
			HD: '2d8+4',
			xp: 400,
			size: 'medium',
            favouredWeaponType: null,
			stats: {strength: 13, dexterity: 15, constitution: 15, intelligence: 2, wisdom: 12, charisma: 6, speed: 50, perception: 5, baseAttackBonus: 1, defense: 12},
			equipment: {

				'head': {description: 'empty'},
				'torso': {description: 'empty'},
				'arms': {description: 'empty'},
				'legs': {description: 'empty'}
			},
			ai: animalai.ai,
			abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: false, suffocateCounter: 0, fearless: false, mindless: false, bloodless: false},
			hostileList: {species: ['human', 'snake'], family: [], entity: [], group: ['cats']},
			defaultWeapon: {name: 'teeths', description: 'a teeths', natural: true, sort: 'melee', damage: '1d6+1', critical: [20], dmgType: 'bite', criticalMultiplier: 2, criticalHit: ['bleeding']}
		},

        'horse': {
            display: 'h',
            fgColor: 'darkgoldenrod',
            bgColor: 'transparent',
            lookDescription: 'a horse',
            type: {messageDisplay: 'horse', type: 'monster', family: 'animal', species: 'horse', group: 'horses', name: 'a horse'},
            favouredStat: 'constitution',
            HD: '2d8+6',
            xp: 400,
            size: 'large',
            favouredWeaponType: null,
            stats: {strength: 16, dexterity: 14, constitution: 17, intelligence: 2, wisdom: 13, charisma: 7, speed: 50, perception: 6, baseAttackBonus: 1, defense: 10},
            equipment: {

                'head': {description: 'empty'},
                'torso': {description: 'empty'},
                'arms': {description: 'empty'},
                'legs': {description: 'empty'}
            },
            ai: animalai.ai,
            abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: false, suffocateCounter: 0, fearless: false, mindless: false, bloodless: false},
            hostileList: {species: ['human', 'snake'], family: [], entity: [], group: []},
            defaultWeapon: {name: 'hooves', description: 'a hooves', natural: true, sort: 'melee', damage: '1d9+1', critical: [20], dmgType: 'hooves', criticalMultiplier: 2, criticalHit: ['stunned', 'prone']}
        },

        'hyena': {
            display: 'h',
            fgColor: 'yellow',
            bgColor: 'transparent',
            lookDescription: 'a hyena',
            type: {messageDisplay: 'hyena', type: 'monster', family: 'animal', species: 'hyena', group: 'canine', name: 'a hyena'},
            favouredStat: 'dexterity',
            HD: '2d8+4',
            xp: 400,
            size: 'medium',
            favouredWeaponType: null,
            stats: {strength: 14, dexterity: 15, constitution: 15, intelligence: 2, wisdom: 13, charisma: 6, speed: 50, perception: 8, baseAttackBonus: 1, defense: 12},
            equipment: {

                'head': {description: 'empty'},
                'torso': {description: 'empty'},
                'arms': {description: 'empty'},
                'legs': {description: 'empty'}
            },
            ai: animalai.ai,
            abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: false, suffocateCounter: 0, fearless: false, mindless: false, bloodless: false},
            hostileList: {species: ['human', 'snake'], family: [], entity: [], group: []},
            defaultWeapon: {name: 'teeths', description: 'a teeths', natural: true, sort: 'melee', damage: '1d6+3', critical: [20], dmgType: 'bite', criticalMultiplier: 2, criticalHit: ['prone']}
        },

		'raven': {
			display: 'r',
			fgColor: 'rgb(51,51,51)',
			bgColor: 'transparent',
			lookDescription: 'a raven',
			type: {messageDisplay: 'raven', type: 'monster', family: 'animal', species: 'raven', group: 'birds', name: 'a raven'},
            favouredStat: 'dexterity',
			HD: '0.25d8',
			xp: 65,
			size: 'tiny',
            favouredWeaponType: null,
			stats: {strength: 1, dexterity: 15, constitution: 10, intelligence: 2, wisdom: 14, charisma: 6, speed: 40, perception: 7, baseAttackBonus: 0, defense: 10},
			equipment: {

				'head': {description: 'empty'},
				'torso': {description: 'empty'},
				'wings': {description: 'empty'},
				'legs': {description: 'empty'}
			},
			ai: animalai.ai,
			abilities: {breatheUnderWater: false, canFly: true, isSuffocating: false, canOpenDoors: false, suffocateCounter: 0, fearless: false, mindless: false, bloodless: false},
			hostileList: {species: ['human'], family: [], entity: [], group: []},
			defaultWeapon: {name: 'claws', description: 'a claws', natural: true, sort: 'melee', damage: '1d2-5', critical: [20], dmgType: 'claws', criticalMultiplier: 2, criticalHit: ['bleeding']}
		},

		'kobold': {
            display: 'k',
            fgColor: 'green',
            bgColor: 'transparent',
            lookDescription: 'a kobold',
            type: {messageDisplay: 'kobold', type: 'monster', family: 'creature', group: 'kobolds', species: 'kobold', name: 'a kobold'},
            favouredStat: 'dexterity',
            HD: '1d8',
            xp: 100,
            size: 'small',
            favouredWeaponType: 'ranged',
            stats: {strength: 9, dexterity: 13, constitution: 10, intelligence: 10, wisdom: 9, charisma: 8, speed: 30, perception: 8, baseAttackBonus: 1, defense: 11},
            equipment: {

                'head': {description: 'empty'},
                'torso': {description: 'empty'},
                'right hand': {description: 'empty'},
                'left hand': {description: 'empty'},
                'legs': {description: 'empty'},
                'feet': {description: 'empty'}
            },
            ai: creatai.ai,
            abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: true, suffocateCounter: 0, fearless: false, cantDrinkPotions: false, illiterate: false, mindless: false, bloodless: false},
            hostileList: {species: ['human', 'snake'], family: [], entity: [], group: ['undead']},
            defaultWeapon: {name: 'fist', description: 'a fist', natural: true, sort: 'melee', damage: '1d2', critical: [20], dmgType: 'unarmed', criticalMultiplier: 2, criticalHit: [null]}
        },

        'ogre': {
            display: 'O',
            fgColor: 'lightgreen',
            bgColor: 'transparent',
            lookDescription: 'an ogre',
            type: {messageDisplay: 'ogre', type: 'monster', family: 'creature', group: 'ogres', species: 'ogre', name: 'an ogre'},
            favouredStat: 'strength',
            HD: '4d8+12',
            xp: 800,
            size: 'large',
            favouredWeaponType: 'melee',
            stats: {strength: 21, dexterity: 8, constitution: 15, intelligence: 6, wisdom: 10, charisma: 7, speed: 25, perception: 7, baseAttackBonus: 3, defense: 15},
            equipment: {

                'head': {description: 'empty'},
                'torso': {description: 'empty'},
                'right hand': {description: 'empty'},
                'left hand': {description: 'empty'},
                'legs': {description: 'empty'},
                'feet': {description: 'empty'}
            },
            ai: creatai.ai,
            abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: true, suffocateCounter: 0, fearless: false, cantDrinkPotions: false, illiterate: false, mindless: false, bloodless: false},
            hostileList: {species: ['human'], family: [], entity: [], group: []},
            defaultWeapon: {name: 'fist', description: 'a fist', natural: true, sort: 'melee', damage: '1d3+3', critical: [20], dmgType: 'unarmed', criticalMultiplier: 2, criticalHit: [null]}
        },

        'minotaur': {
            display: 'M',
            fgColor: '#af111c',
            bgColor: 'transparent',
            lookDescription: 'a minotaur',
            type: {messageDisplay: 'minotaur', type: 'monster', family: 'creature', group: 'giants', species: 'minotaur', name: 'a minotaur'},
            favouredStat: 'strength',
            HD: '6d10+12',
            xp: 1200,
            size: 'large',
            favouredWeaponType: 'melee',
            stats: {strength: 19, dexterity: 10, constitution: 15, intelligence: 7, wisdom: 10, charisma: 8, speed: 30, perception: 5, baseAttackBonus: 6, defense: 15},
            equipment: {

                'head': {description: 'empty'},
                'torso': {description: 'empty'},
                'right hand': {description: 'empty'},
                'left hand': {description: 'empty'},
                'legs': {description: 'empty'},
                'feet': {description: 'empty'}
            },
            ai: creatai.ai,
            abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: true, suffocateCounter: 0, fearless: false, cantDrinkPotions: false, illiterate: false, mindless: false, bloodless: false},
            hostileList: {species: ['human', 'cyclops'], family: [], entity: [], group: []},
            defaultWeapon: {name: 'horns', description: 'a horns', natural: true, sort: 'melee', damage: '1d6+2', critical: [20], dmgType: 'horns', criticalMultiplier: 2, criticalHit: [null]}
        },

        'cyclops': {
            display: 'H',
            fgColor: '#af111c',
            bgColor: 'transparent',
            lookDescription: 'a cyclops',
            type: {messageDisplay: 'cyclops', type: 'monster', family: 'creature', group: 'giants', species: 'cyclops', name: 'a cyclops'},
            favouredStat: 'strength',
            HD: '10d8+20',
            xp: 1600,
            size: 'large',
            favouredWeaponType: 'ranged',
            stats: {strength: 21, dexterity: 8, constitution: 15, intelligence: 10, wisdom: 13, charisma: 8, speed: 27, perception: 4, baseAttackBonus: 7, defense: 17},
            equipment: {

                'head': {description: 'empty'},
                'torso': {description: 'empty'},
                'right hand': {description: 'empty'},
                'left hand': {description: 'empty'},
                'legs': {description: 'empty'},
                'feet': {description: 'empty'}
            },
            ai: creatai.ai,
            abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: true, suffocateCounter: 0, fearless: false, cantDrinkPotions: false, illiterate: false, mindless: false, bloodless: false},
            hostileList: {species: ['human', 'minotaur'], family: [], entity: [], group: []},
            defaultWeapon: {name: 'fist', description: 'a fist', natural: true, sort: 'melee', damage: '1d8+5', critical: [20], dmgType: 'unarmed', criticalMultiplier: 2, criticalHit: ['stunned']}
        },

        'centaur': {
            display: 'C',
            fgColor: 'darkgoldenrod',
            bgColor: 'transparent',
            lookDescription: 'a centaur',
            type: {messageDisplay: 'centaur', type: 'monster', family: 'creature', group: 'horses', species: 'centaur', name: 'a centaur'},
            favouredStat: 'strength',
            HD: '4d10+5',
            xp: 800,
            size: 'large',
            favouredWeaponType: 'ranged',
            stats: {strength: 15, dexterity: 14, constitution: 15, intelligence: 11, wisdom: 14, charisma: 12, speed: 50, perception: 7, baseAttackBonus: 4, defense: 11},
            equipment: {

                'head': {description: 'empty'},
                'torso': {description: 'empty'},
                'right hand': {description: 'empty'},
                'left hand': {description: 'empty'},
                'barding': {description: 'empty'}
            },
            ai: creatai.ai,
            abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: true, suffocateCounter: 0, fearless: false, cantDrinkPotions: false, illiterate: false, mindless: false, bloodless: false},
            hostileList: {species: ['human'], family: [], entity: [], group: ['reptile']},
            defaultWeapon: {name: 'hooves', description: 'a hooves', natural: true, sort: 'melee', damage: '1d6+1', critical: [20], dmgType: 'hooves', criticalMultiplier: 2, criticalHit: ['stunned', 'prone']}
        },

        'goblin': {
            display: 'g',
            fgColor: 'blue',
            bgColor: 'transparent',
            lookDescription: 'a goblin',
            type: {messageDisplay: 'goblin', type: 'monster', family: 'creature', group: 'goblinoids', species: 'goblin', name: 'a goblin'},
            favouredStat: 'dexterity',
            HD: '1d10+1',
            xp: 135,
            size: 'small',
            favouredWeaponType: 'ranged',
            stats: {strength: 11, dexterity: 15, constitution: 12, intelligence: 10, wisdom: 9, charisma: 6, speed: 30, perception: 6, baseAttackBonus: 1, defense: 10},
            equipment: {

                'head': {description: 'empty'},
                'torso': {description: 'empty'},
                'right hand': {description: 'empty'},
                'left hand': {description: 'empty'},
                'legs': {description: 'empty'},
                'feet': {description: 'empty'}
            },
            ai: creatai.ai,
            abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: true, suffocateCounter: 0, fearless: false, cantDrinkPotions: false, illiterate: false, mindless: false, bloodless: false},
            hostileList: {species: ['human'], family: [], entity: [], group: ['elfs']},
            defaultWeapon: {name: 'fist', description: 'a fist', natural: true, sort: 'melee', damage: '1d2', critical: [20], dmgType: 'unarmed', criticalMultiplier: 2, criticalHit: [null]}
        },

        'hobgoblin': {
            display: 'g',
            fgColor: 'lightgreen',
            bgColor: 'transparent',
            lookDescription: 'a hobgoblin',
            type: {messageDisplay: 'hobgoblin', type: 'monster', family: 'creature', group: 'goblinoids', species: 'hobgoblin', name: 'a hobgoblin'},
            favouredStat: 'constitution',
            HD: '1d10+7',
            xp: 200,
            size: 'medium',
            favouredWeaponType: 'melee',
            stats: {strength: 15, dexterity: 15, constitution: 16, intelligence: 10, wisdom: 12, charisma: 8, speed: 30, perception: 6, baseAttackBonus: 1, defense: 10},
            equipment: {

                'head': {description: 'empty'},
                'torso': {description: 'empty'},
                'right hand': {description: 'empty'},
                'left hand': {description: 'empty'},
                'legs': {description: 'empty'},
                'feet': {description: 'empty'}
            },
            ai: creatai.ai,
            abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: true, suffocateCounter: 0, fearless: false, cantDrinkPotions: false, illiterate: false, mindless: false, bloodless: false},
            hostileList: {species: ['human'], family: [], entity: [], group: ['elfs']},
            defaultWeapon: {name: 'fist', description: 'a fist', natural: true, sort: 'melee', damage: '1d2', critical: [20], dmgType: 'unarmed', criticalMultiplier: 2, criticalHit: [null]}
        },

        'gnoll': {
            display: 'g',
            fgColor: 'brown',
            bgColor: 'transparent',
            lookDescription: 'a gnoll',
            type: {messageDisplay: 'gnoll', type: 'monster', family: 'creature', group: 'gnolls', species: 'gnoll', name: 'a gnoll'},
            favouredStat: 'strength',
            HD: '2d8+2',
            xp: 400,
            size: 'medium',
            favouredWeaponType: 'melee',
            stats: {strength: 15, dexterity: 10, constitution: 13, intelligence: 8, wisdom: 9, charisma: 11, speed: 30, perception: 7, baseAttackBonus: 1, defense: 11},
            equipment: {

                'head': {description: 'empty'},
                'torso': {description: 'empty'},
                'right hand': {description: 'empty'},
                'left hand': {description: 'empty'},
                'legs': {description: 'empty'},
                'feet': {description: 'empty'}
            },
            ai: creatai.ai,
            abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: true, suffocateCounter: 0, fearless: false, cantDrinkPotions: false, illiterate: false, mindless: false, bloodless: false},
            hostileList: {species: ['human'], family: [], entity: [], group: []},
            defaultWeapon: {name: 'fist', description: 'a fist', natural: true, sort: 'melee', damage: '1d2', critical: [20], dmgType: 'unarmed', criticalMultiplier: 2, criticalHit: [null]}
        },

        'skeleton': {
            display: 'z',
            fgColor: 'white',
            bgColor: 'transparent',
            lookDescription: 'a skeleton',
            type: {messageDisplay: 'skeleton', type: 'monster', family: 'creature', group: 'undead', species: 'skeleton', name: 'a skeleton'},
            favouredStat: 'strength',
            HD: '1d12',
            xp: 135,
            size: 'medium',
            favouredWeaponType: 'melee',
            stats: {strength: 15, dexterity: 14, constitution: 1, intelligence: 1, wisdom: 10, charisma: 10, speed: 30, perception: 7, baseAttackBonus: 1, defense: 12},
            equipment: {

                'head': {description: 'empty'},
                'torso': {description: 'empty'},
                'right hand': {description: 'empty'},
                'left hand': {description: 'empty'},
                'legs': {description: 'empty'},
                'feet': {description: 'empty'}
            },
            ai: creatai.ai,
            abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: true, suffocateCounter: 0, fearless: true, cantDrinkPotions: true, illiterate: true, mindless: true, bloodless: true},
            hostileList: {species: ['human'], family: [], entity: [], group: ['kobolds', 'elfs']},
            defaultWeapon: {name: 'claws', description: 'a claws', natural: true, sort: 'melee', damage: '1d4+2', critical: [20], dmgType: 'claws', criticalMultiplier: 2, criticalHit: ['bleeding']}
        },

        'ghoul': {
            display: 'z',
            fgColor: 'silver',
            bgColor: 'transparent',
            lookDescription: 'a ghoul',
            type: {messageDisplay: 'ghoul', type: 'monster', family: 'creature', group: 'undead', species: 'ghoul', name: 'a ghoul'},
            favouredStat: 'strength',
            HD: '2d8+3',
            xp: 400,
            size: 'medium',
            favouredWeaponType: 'melee',
            stats: {strength: 13, dexterity: 15, constitution: 1, intelligence: 13, wisdom: 14, charisma: 14, speed: 30, perception: 5, baseAttackBonus: 1, defense: 12},
            equipment: {

                'head': {description: 'empty'},
                'torso': {description: 'empty'},
                'right hand': {description: 'empty'},
                'left hand': {description: 'empty'},
                'legs': {description: 'empty'},
                'feet': {description: 'empty'}
            },
            ai: creatai.ai,
            abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: true, suffocateCounter: 0, fearless: true, cantDrinkPotions: true, illiterate: true, mindless: true, bloodless: true},
            hostileList: {species: ['human'], family: [], entity: [], group: ['kobolds', 'elfs']},
            defaultWeapon: {name: 'claws', description: 'a claws', natural: true, sort: 'melee', damage: '1d6+1', critical: [20], dmgType: 'claws', criticalMultiplier: 2, criticalHit: ['bleeding', 'paralyzed']}
        },

        'drow': {
            display: 'e',
            fgColor: 'silver',
            bgColor: 'transparent',
            lookDescription: 'a drow',
            type: {messageDisplay: 'drow', type: 'monster', family: 'creature', group: 'elfs', species: 'drow', name: 'a drow'},
            favouredStat: 'dexterity',
            HD: '1d10',
            xp: 135,
            size: 'medium',
            favouredWeaponType: 'ranged',
            stats: {strength: 11, dexterity: 15, constitution: 10, intelligence: 10, wisdom: 9, charisma: 10, speed: 30, perception: 4, baseAttackBonus: 1, defense: 10},
            equipment: {

                'head': {description: 'empty'},
                'torso': {description: 'empty'},
                'right hand': {description: 'empty'},
                'left hand': {description: 'empty'},
                'legs': {description: 'empty'},
                'feet': {description: 'empty'}
            },
            ai: creatai.ai,
            abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: true, suffocateCounter: 0, fearless: false, cantDrinkPotions: false, illiterate: false, mindless: false, bloodless: false},
            hostileList: {species: ['human'], family: [], entity: [], group: ['undead', 'orcs', 'goblinoids']},
            defaultWeapon: {name: 'fist', description: 'a fist', natural: true, sort: 'melee', damage: '1d2', critical: [20], dmgType: 'unarmed', criticalMultiplier: 2, criticalHit: [null]}
        },

        'bugbear': {
            display: 'g',
            fgColor: 'darkgoldenrod',
            bgColor: 'transparent',
            lookDescription: 'a bugbear',
            type: {messageDisplay: 'bugbear', type: 'monster', family: 'creature', group: 'goblinoids', species: 'bugbear', name: 'a bugbear'},
            favouredStat: 'strength',
            HD: '3d8+3',
            xp: 600,
            size: 'medium',
            favouredWeaponType: 'melee',
            stats: {strength: 16, dexterity: 13, constitution: 13, intelligence: 10, wisdom: 9, charisma: 8, speed: 30, perception: 5, baseAttackBonus: 2, defense: 13},
            equipment: {

                'head': {description: 'empty'},
                'torso': {description: 'empty'},
                'right hand': {description: 'empty'},
                'left hand': {description: 'empty'},
                'legs': {description: 'empty'},
                'feet': {description: 'empty'}
            },
            ai: creatai.ai,
            abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: true, suffocateCounter: 0, fearless: false, cantDrinkPotions: false, illiterate: false, mindless: false, bloodless: false},
            hostileList: {species: ['human'], family: [], entity: [], group: []},
            defaultWeapon: {name: 'fist', description: 'a fist', natural: true, sort: 'melee', damage: '1d2', critical: [20], dmgType: 'unarmed', criticalMultiplier: 2, criticalHit: [null]}
        },

        'giant beetle': {
            display: 'b',
            fgColor: 'darkgoldenrod',
            bgColor: 'transparent',
            lookDescription: 'a giant beetle',
            type: {messageDisplay: 'giant beetle', type: 'monster', family: 'animal', species: 'giant beetle', group: 'vermin', name: 'a giant beetle'},
            favouredStat: 'dexterity',
            HD: '1d8',
            xp: 135,
            size: 'small',
            favouredWeaponType: null,
            stats: {strength: 10, dexterity: 11, constitution: 11, intelligence: 1, wisdom: 10, charisma: 7, speed: 30, perception: 7, baseAttackBonus: 1, defense: 11},
            equipment: {

                'head': {description: 'empty'},
                'torso': {description: 'empty'},
                'arms': {description: 'empty'},
                'legs': {description: 'empty'}

            },
            ai: animalai.ai,
            abilities: {breatheUnderWater: false, canFly: false, isSuffocating: false, canOpenDoors: false, suffocateCounter: 0, fearless: false, mindless: false, bloodless: false},
            hostileList: {species: ['human'], family: [], entity: [], group: []},
            defaultWeapon: {name: 'teeths', description: 'a teeths', natural: true, sort: 'melee', damage: '1d4', critical: [20], dmgType: 'bite', criticalMultiplier: 2, criticalHit: [null]}
        }
	};
	
	return{
		
		monsterType: monsterType,
		monsterList: monsterList
	}
});
