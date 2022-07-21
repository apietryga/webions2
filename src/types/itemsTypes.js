this.types = [
  { name: "Rod",
    sprite: "items",
    spriteNr: 1,
    fist:15,
    dist:20,
    manaRegen:2,
    handle: ["lh","rh"],
    pickable:true
  },
  { name: "Wand of Destiny",
    sprite: "items",
    fist:100,
    dist:100,
    spriteNr: 10,
    manaRegen:100,
    handle: ["lh","rh"],
    pickable:true,
  },
  { name: "Simple Shield",
    sprite: "items",
    spriteNr: 11,
    handle: ["lh","rh"],
    pickable:true,
    def:20
  },
  { name: "Blessed Shield",
    sprite: "items",
    spriteNr: 12,
    handle: ["lh","rh"],
    pickable:true,
    def:100
  },
  { name: "Simple Helmet",
    sprite: "items",
    spriteNr: 2,
    handle: ["hd"],
    pickable:true,
    health: 180
  },
  { name: "Simple Armor",
    sprite: "items",
    spriteNr: 3,
    handle: ["ch"],
    pickable:true,
    def:20
  },
  { name: "Simple Legs",
    sprite: "items",
    spriteNr: 4,
    handle: ["lg"],
    pickable:true,
    manaRegen:10,
  },
  { name: "Simple Boots",
    sprite: "items",
    spriteNr: 5,
    handle: ["ft"],
    pickable:true,
    speed:1
  },
  { name: "The Crown",
    sprite: "items",
    spriteNr: 6,
    handle: ["hd"],
    pickable:true,
    health:1000
  },
  { name: "King Armor",
    sprite: "items",
    spriteNr: 7,
    handle: ["ch"],
    pickable:true,
    def:100
  },
  { name: "King Legs",
    sprite: "items",
    spriteNr: 8,
    handle: ["lg"],
    pickable:true,
    def:50,
  },
  { name: "King Boots",
    sprite: "items",
    spriteNr: 9,
    handle: ["ft"],
    pickable:true,
    speed:4
  },
  { name: "Magic Hat",
    sprite: "items",
    spriteNr: 13,
    handle: ["hd"],
    pickable:true,
    mana:400,
    manaRegen:50
  },
  { name: "Magic Armor",
    sprite: "items",
    spriteNr: 14,
    handle: ["ch"],
    pickable:true,
    def: 50,
    mana:200,
    manaRegen:25
  },
  { name: "Ladder",
    sprite: "action_items",
    spriteNr: 4,
    handle: ["lh","rh","bp"],
    pickable:true,
    desc: "You can use it to move between floors."
  },
  { name: "Coins",
    sprite: "coins",
    spriteNr: 1,
    handle: ["lh","rh"],
    pickable:true,
    amount:10
  },
  { name: "Backpack",
    sprite: "items",
    spriteNr : 0,
    cap:8,
    handle:['bp'],
    pickable:true
  },
  { name: "Random Item",
    sprite: "items",
    spriteNr: 15,
    handle: ["lh","rh","bp","nc","hd","ch","lg","ft"],
    pickable:true,
    randStats: [
      {speed: '0 - 3'},
      {mana: '0 - 100'},
      {manaRegen: '0 - 50'},
      {health: '0 - 200'},
      {def: '0 - 100'},
    ]
  },
  { name: "staticBox",
    sprite: "action_items",
    spriteNr : 3,
    walkThrow : false,
    walkOn : (creature,item,items) => {
      if(typeof item.level != "undefined" && item.level > creature.skills.level && creature.name != "GM"){
        creature.text = "You need "+item.level+" level to open this box";
      }else if(typeof creature.eq !=  "undefined"&& creature.type == "player" && !creature.quests.includes(item.name)){
        item.makeNew({name:item.inItem},items,creature);
      }
    },
    pickable:false
  },
  { name: "Table",
    sprite: "action_items",
    spriteNr : 5,
    walkThrow : false,
    pickable: false,
    handle: ["lh","rh"],
  },
  { name: "Locker",
    sprite: "action_items",
    spriteNr : 7,
    walkThrow : false,
    pickable:false,
    walkOn : (creature,item) => {
      creature.lockerOpened = item.position;
    }
  }
];