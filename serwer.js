const fs = require('fs');
const http = require('http');
const Map = require("./public/js/map");
const map = new Map();
const os = require("os");
const stringify = require("json-stringify-pretty-compact");
const WebSocketServer = require("websocket").server;
const Creature = require("./js/server_components");
const monstersList = require("./js/monstersList");
const dbConnect = require("./js/dbconnect");
const dbc = new dbConnect();
const inGameMonsters = require("./json/inGameMonsters.js").data;
const game = require("./public/js/gameDetails");
const public = require("./js/public");
const cm = { // creatures managment
  allMonsters: [],
  monstersInArea: [],
  loadMonsters(){
    for(const m of inGameMonsters){
      const monster = new Creature(m.name,this.allMonsters.length);
      for(const k of Object.keys(m)){
        monster[k] = m[k];
      }
      monster.startPosition = m.position;
      monster.type = "monster";
      for(const sm of monstersList){ // single monster
        if(sm.name == m.name){
          for(const md of Object.keys(sm)){ // monster details
            monster[md] = sm[md];
          }
        }
      }
      monster.maxHealth = monster.health;
      this.allMonsters.push(monster);
    }
  },
  monstersUpdate(player){
     //  update only monsters in area
    this.monstersInArea = [];
    for(const c of this.allMonsters){
      if(Math.abs( c.position[0] - player.position[0] ) < 7
      && Math.abs( c.position[1] - player.position[1] ) < 7){
        this.monstersInArea.push(c);
      }
    }
    for(const c of this.monstersInArea){
      c.update(param,game,this.monstersInArea.concat(this.players.list));
    }
  },
  init(){
    this.loadMonsters();
  },
  update(param,callback){
    this.players.update(param,(player)=>{
      this.monstersUpdate(player);
      game.player = player.id;
      if(typeof player.text == "undefined"){delete player.text;}
      const newData = {
        game: game,
        creatures: this.players.list.concat(this.monstersInArea)
      }
      callback(newData);
      // retrive died player
      if(typeof game.dead != "undefined"){
        delete game.dead;
        player.position = player.startPosition;
        player.health = player.maxHealth;
        player.cyle = 0;
        player.direction = 1;
        this.players.kick(player);   
      }
      player.text = "";
    })
  },
  players: {
    list:[],
    inArea:[],
    inLoading:[],
    update(param,callback){
      // TO DO MAKE inArea PLAYERS LIST!
      // check if player is on the list.
      let isPlayer = false;
      // for(const c of this.list){
      //   if(Math.abs( c.position[0] - player.position[0] ) < 7
      //   && Math.abs( c.position[1] - player.position[1] ) < 7){
      //     this.inArea.push(c);
      //   }
      // }
      for(const p of this.list){
        // update player is exists
        if(p.name == param.name){
          isPlayer = p;
          isPlayer.lastFrame = game.time.getTime();
          isPlayer.update(param,game,cm.monstersInArea.concat(this.list));
          callback(isPlayer);
          break;
        }
      }

      // push player to list
      if(isPlayer == false && !this.inLoading.includes(param.name)){
        this.inLoading.push(param.name);
        //  make new unique id
        const ids = [];for(const creat of this.list.concat(cm.allMonsters)){ids.push(creat.id);}
        let newID = 1; while(ids.includes(newID)){newID++;}
        // get info from srv;
        const newPlayer = new Creature(param.name,newID-1);
        dbc[game.db].load(newPlayer,(res)=>{
          if(res){
            // merge it with newPlayer
            const defaultPosition = newPlayer.position;
            for(const k of Object.keys(res)){
              newPlayer[k] = res[k];
            }
            if(newPlayer.lastFrame < game.lastUpdate){
              newPlayer.position = defaultPosition;
            }

          }else{
            // create record
            // dbc[game.db].update(newPlayer);
          }
          newPlayer.type = "player";
          newPlayer.lastFrame = game.time.getTime();
          this.inLoading.splice(this.inLoading.indexOf(param.name),1);     
          this.list.push(newPlayer);
          callback(newPlayer);
        }); 
      }
      
      // kick off offline.
      setTimeout(() => {
        if(typeof isPlayer == "object" 
          && new Date().getTime() - isPlayer.lastFrame > 1000
          && this.list.includes(isPlayer)){
            cm.players.kick(isPlayer)
        }
      }, 1000);
    },
    kick(player){
      this.list.splice(this.list.indexOf(player),1);
      dbc[game.db].update(player);
    }
  }
}
let param;cm.init();
dbc.init(()=>{
  console.log("Database set: "+game.db);
  const server = http.createServer(public).listen(process.env.PORT || 80);
  console.log("serwer is running on: http://webions");
  // WEBSOCKET
  new WebSocketServer({httpServer : server})
  .on('request', (req)=>{
    const connection = req.accept('echo-protocol', req.origin);
    connection.on('message', (data) => {
      param = JSON.parse(data.utf8Data);
      // In game actions
      if(Object.keys(param).includes("name")){
        game.time = new Date();
        game.cpu = Math.round((100*(os.totalmem() - os.freemem()))/os.totalmem)+"%";
        cm.update(param,(newData)=>{
          connection.sendUTF(stringify(newData,null,2));
        })
      }
      // Getting data
      if(Object.keys(param).includes("get")){
        const mapPatch = map.path;
        // Get playersList
        if(param.get == "playersList"){
          dbc[game.db].loadAll((result)=>{
            connection.sendUTF(stringify(result,null,2));
          })
        }
        // Get gameMap
        if(param.get == "map"){
          const mapRead = fs.readFileSync(mapPatch,{encoding:'utf8'});
          const mapArr = JSON.parse(mapRead);
          // result = map;
          connection.sendUTF(stringify(mapArr,null,2));
        }
        // Get onlinelist
        if(param.get == "onlineList"){
          const onlineList = [];
          for(const p of cm.players.list){
            onlineList.push({"name":p.name,"skills":{"level":p.skills.level}});
          }
          connection.sendUTF(stringify(onlineList,null,2));
        }
        // PUSH MAP
        if(param.get == "pushmap"){
          connection.sendUTF(map.saveToFileMap(mapPatch,param));
        }
      }       
    })
  })
})
