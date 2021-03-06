const fs = require('fs');
const game = require('../../public/js/gameDetails');
const stringify = require("json-stringify-pretty-compact");
const redis = require('redis');
class dbConnect{
  init(callback){
    // Redis connection
    if(typeof process.env.REDIS_URL == "string" || typeof process.env.REDIS_TLS_URL == "string"){
      this.redis.client = redis.createClient(process.env.REDIS_TLS_URL ? process.env.REDIS_TLS_URL : process.env.REDIS_URL, {tls: {rejectUnauthorized: false,}});
    }else{
      this.redis.client = redis.createClient();
    }
    this.redis.client.on('error',(err)=>{
      this.redis.client.quit();
      delete this.redis.client;
      game.db = 'json';
    })
    this.redis.client.keys('*',(error)=>{
      if(error  == null){
        game.db = 'redis';
      }else{
        game.db = 'json';
      }
      callback();
    })
  }
  constructor(){
    this.src = "./json/playersList.json";
    this.dataToSave = [
      "name",
      "health",
      "maxHealth",
      "lastFrame",
      "skills",
      "speed",
      "sprite",
      "position",
      "password",
      "email",
      "sex",
      "colors",
      "eq",
      "lastDeaths",
      "quests",
      "mana",
      "maxMana",
      "token",
      "redTarget",
      "autoShot",
      "autoMWDrop",
      "lastMWall"
    ];
    this.json.dataToSave = this.dataToSave;
    this.redis.dataToSave = this.dataToSave;
  }
  // db types 
  redis = {
    loadAll(callback){
      this.client.keys("*",(e,keys)=>{
        if(typeof keys == "undefined" || keys.length == 0){callback(0) || e != null}
        const json = [];
        for(const [i,k] of keys.entries()){
          this.client.get(k,(e,v)=>{
            if(typeof v != "undefined"){
              json.push(JSON.parse(v));
            }
            if(i == keys.length-1){
              callback(json);
            }
          })
        }
      });
      // callback("all");
    },
    load(player,callback){
      this.client.get(player.name, (e,c)=>{
        callback(JSON.parse(c));
      })    
    },
    update(player,callback = ()=>{}){
      if(typeof this.client != "undefined"){
        this.client.get(player.name, (e,c)=>{
          // filter vals
          const valToStore = {};
          for(const key of Object.keys(player)){
            if(this.dataToSave.includes(key)){
              valToStore[key] = player[key];
            }
          }
          // save filtered vals
          const stringyfy = JSON.stringify(valToStore);
          this.client.set(player.name,stringyfy,()=>{callback()});
        })  
      }else{
        console.error("Player "+player.name+" not updated.");
        callback();
      }
    },
    del(playerName){
      this.client.del(playerName);
    }
  }
  json = {
    src: "./src/lists/playersList.json",
    loadAll(callback){
      fs.readFile(this.src,"utf8",(e,content) => {
        if(e == null){
          callback(JSON.parse(content));
        }else{
          callback();
        }
      })
    },
    load(player,callback){
      this.playerIsSet(player.name,(p)=>{
        callback(p[0]);
      })
    },
    playerIsSet(name,callback){
      const r = JSON.parse(fs.readFileSync(this.src,{encoding:"utf8"}));
      // this.loadAll((r)=>{
        // find player by name
        let isPlayer = false;
        for(let p of r){
          if(p.name == name){
            isPlayer = p;
            break;
          }
        }
        callback([isPlayer,r]);
      // })
    },
    update(player,callback = ()=>{}){
      this.playerIsSet(player.name,(p)=>{
        if(typeof p[0] == "object"){
          // update record
          for(let [i,px] of p[1].entries()){
            if(px.name == player.name){
              for(const k of Object.keys(player)){
                if(this.dataToSave.includes(k)){
                  p[1][i][k] = player[k];
                }
              }
              break;
            }
          }
        }else{
          // create new record
          const nPlayer = {};
          for(const k of Object.keys(player)){
            if(this.dataToSave.includes(k)){
              nPlayer[k] = player[k];
            }
          }
          p[1].push(nPlayer);
        }
        this.save(p[1]);
        callback();
      })
    },
    save(newContent){
      fs.writeFileSync(this.src, stringify(newContent));  
    },
    del(playerName){
      const allPlayers = JSON.parse(fs.readFileSync(this.src,{encoding:"utf8"}));
      for(const [i,player] of allPlayers.entries()){
        if(player.name == playerName){
          allPlayers.splice(i,1);
        }
      }
      this.save(allPlayers);
    }
  }
}
module.exports = dbConnect;