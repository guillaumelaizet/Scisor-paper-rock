
const express = require('express');
const pug =require ('pug');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const db = require('./db.js');
const URL = 'mongodb://heroku_r7m5vfjc:audde2i6k119m0j97qtt4etaen@ds259175.mlab.com:59175/heroku_r7m5vfjc';


const server = app.listen(process.env.PORT || 3000, function() {
   console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
 });

app.set('view engine', 'pug');
app.set('views', 'sources/views');

app.use(session({
  secret:'123456789SECRET',
  saveUninitialized : false,
  resave: false
}));

app.use('/sources', express.static(__dirname + '/sources'));
app.use(bodyParser.urlencoded({
  extended : false
}));


app.get('/', function (req, res, next) {
  res.render('index');
});


db.connect(URL, function(err, db) {
  if (err) {
    return;
  }
});

const io = require('socket.io')(server);

var players = [];
var sockets = {};
var roomName = '';
var rooms = [];
var roomUser = {};
roomUser.users = [];
var choice = [];



io.on('connection', function(socket){
  for(var i in players){
    socket.emit('users', players[i]);
  }

  socket.on('pseudo', function(pseudo){
    var collection = db.get().collection('users');
    collection.find({pseudo : pseudo}).toArray(function(err, data){
      if(JSON.stringify(data) == '[]'){
        collection.insert({pseudo : pseudo, nbrPartie : 0, scoreMeilleurePartie : 0, scoreCumule : 0});
      }
    });
    players.push(pseudo);
    players = players.filter(function(ele,index,self){
      return index == self.indexOf(ele);
    });
  });

  socket.on('avatarChecked', function(avatar){
    socket.emit('updateRoom', rooms);
  });

  socket.on('room', function(room, userInfo){
      socket.join(room);
      var user = {};
      user.pseudo = userInfo.pseudo;
      user.avatar = userInfo.avatar;
      user.id = socket.id;
      user.score = 0;

      roomUser.name = room;
      roomUser.info = io.sockets.adapter.rooms[room];

      replaceInArray(rooms,roomUser)
      roomUser.users.push(user);
      rooms.forEach(function(room){
      //   console.log(room.users);
      // console.log(room.info);
      })
      socket.emit('logged',rooms);

      if(roomUser.info.length >1)
      socket.broadcast.to(room).emit('loggedNewUser', rooms);
      db.get().collection('users').find().sort({scoreMeilleurePartie : -1}).toArray(function (err, data){
        socket.emit('tableau', data);
      });
  });


  socket.on('roomReady', function(rooms){
    rooms.forEach(function(room){
      if(room.info.length == 2){
      socket.emit('letsGo', rooms);
      socket.broadcast.emit('letsGo', rooms);
      }
    });

  });

  socket.on('choix', function(rooms){
    rooms.forEach(function(room){
      for(var i in room.users){
        if(room.users[i].id == socket.id){
          choice.push({choix : room.users[i].choix, id : room.users[i].id, pseudo : room.users[i].pseudo, score : room.users[i].score})
        }
      }

      if(choice.length > 1){
        if(choice[0].choix === 'scisor'){
          if(choice[1].choix === 'scisor'){
            socket.emit('tie', choice, rooms);
            socket.broadcast.to(room.name).emit('tie', choice, rooms);
          }
          if(choice[1].choix === 'lezard'){
            socket.emit('winjoueur1', choice, rooms);
            socket.broadcast.to(room.name).emit('winjoueur1', choice, rooms);
          }
          if(choice[1].choix === 'paper'){
            socket.emit('winjoueur1', choice, rooms);
            socket.broadcast.to(room.name).emit('winjoueur1', choice, rooms);
          }
          if(choice[1].choix === 'spoke'){
            socket.emit('winjoueur2', choice, rooms);
            socket.broadcast.to(room.name).emit('winjoueur2', choice, rooms);
          }
          if(choice[1].choix === 'rock'){
            socket.emit('winjoueur2', choice, rooms);
            socket.broadcast.to(room.name).emit('winjoueur2', choice, rooms);
          }
          choice = [];
          return;
        }
        if(choice[0].choix === 'lezard'){
          if(choice[1].choix === 'scisor'){
            socket.emit('winjoueur2', choice, rooms);
            socket.broadcast.to(room.name).emit('winjoueur2', choice, rooms);
          }
          if(choice[1].choix === 'lezard'){
            socket.emit('tie', choice, rooms);
            socket.broadcast.to(room.name).emit('tie', choice, rooms);
          }
          if(choice[1].choix === 'paper'){
            socket.emit('winjoueur1', choice, rooms);
            socket.broadcast.to(room.name).emit('winjoueur1', choice, rooms);
          }
          if(choice[1].choix === 'spoke'){
            socket.emit('winjoueur1', choice, rooms);
            socket.broadcast.to(room.name).emit('winjoueur1', choice, rooms);
          }
          if(choice[1].choix === 'rock'){
            socket.emit('winjoueur2', choice, rooms);
            socket.broadcast.to(room.name).emit('winjoueur2', choice, rooms);
          }
          choice = [];
          return;
        }
        if(choice[0].choix === 'paper'){
          if(choice[1].choix === 'scisor'){
            socket.emit('winjoueur2', choice, rooms);
            socket.broadcast.to(room.name).emit('winjoueur2', choice, rooms);
          }
          if(choice[1].choix === 'lezard'){
            socket.emit('winjoueur2', choice, rooms);
            socket.broadcast.to(room.name).emit('winjoueur2', choice, rooms);
          }
          if(choice[1].choix === 'paper'){
            socket.emit('tie', choice,rooms);
            socket.broadcast.to(room.name).emit('tie', choice,rooms);
          }
          if(choice[1].choix === 'spoke'){
            socket.emit('winjoueur1', choice,rooms);
            socket.broadcast.to(room.name).emit('winjoueur1', choice,rooms);
          }
          if(choice[1].choix === 'rock'){
            socket.emit('winjoueur1', choice,rooms);
            socket.broadcast.to(room.name).emit('winjoueur1', choice,rooms);
          }
          choice = [];
          return;
        }
        if(choice[0].choix === 'spoke'){
          if(choice[1].choix === 'scisor'){
            socket.emit('winjoueur1', choice,rooms);
            socket.broadcast.to(room.name).emit('winjoueur1', choice,rooms);
          }
          if(choice[1].choix === 'lezard'){
            socket.emit('winjoueur2', choice,rooms);
            socket.broadcast.to(room.name).emit('winjoueur2', choice,rooms);
          }
          if(choice[1].choix === 'paper'){
            socket.emit('winjoueur1', choice,rooms);
            socket.broadcast.to(room.name).emit('winjoueur1', choice,rooms);
          }
          if(choice[1].choix === 'spoke'){
            socket.emit('tie', choice,rooms);
            socket.broadcast.to(room.name).emit('tie', choice,rooms);
          }
          if(choice[1].choix === 'rock'){
            socket.emit('winjoueur2', choice,rooms);
            socket.broadcast.to(room.name).emit('winjoueur2', choice, rooms);
          }
          choice = [];
          return;
        }
        if(choice[0].choix === 'rock'){
          if(choice[1].choix === 'scisor'){
            socket.emit('winjoueur1', choice, rooms);
            socket.broadcast.to(room.name).emit('winjoueur1', choice, rooms);
          }
          if(choice[1].choix === 'lezard'){
            socket.emit('winjoueur1', choice, rooms);
            socket.broadcast.to(room.name).emit('winjoueur1', choice, rooms);
          }
          if(choice[1].choix === 'paper'){
            socket.emit('winjoueur2', choice, rooms);
            socket.broadcast.to(room.name).emit('winjoueur2', choice, rooms);
          }
          if(choice[1].choix === 'spoke'){
            socket.emit('winjoueur2', choice, rooms);
            socket.broadcast.to(room.name).emit('winjoueur2', choice, rooms);
          }
          if(choice[1].choix === 'rock'){
            socket.emit('tie', choice, rooms);
            socket.broadcast.to(room.name).emit('tie', choice, rooms);
          }
          choice = [];
          return;
        }
      }
    });
  });

  socket.on('scoreFinal', function(choice, temps){
    console.log(temps);
    for (var i in choice){
      if(choice[i].id == socket.id){
        var score;
        var scoreTotal;
        // console.log(choice[i]);
          var collection = db.get().collection('users');
          collection.find({pseudo : choice[i].pseudo}).toArray(function (err,data){
            console.log(data);
              score = data[0].scoreMeilleurePartie;
              scoreTotal = data[0].scoreCumule;
              // console.log(score);
              // console.log(scoreTotal);

          console.log(scoreTotal);

          if (choice[i].score > score){
            collection.updateOne({pseudo : choice[i].pseudo}, {$set : {scoreMeilleurePartie  : choice[i].score, scoreCumule : scoreTotal + choice[i].score, temps : temps}, $inc : {nbrPartie : 1}}  , function(err,data){
              if(err) throw err;
          });
          }else {
            collection.updateOne({pseudo : choice[i].pseudo}, {$set : {scoreCumule : scoreTotal + choice[i].score, temps : temps}, $inc : {nbrPartie : 1}}, function (err, data){
              if(err) throw err;
            });
          }
        });
          return;
      }
    }
  });


  socket.on('disconnect',function(){
    for(var i in roomUser.users){
      if(roomUser.users[i].id == socket.id){
        var nomJoueur = roomUser.users[i].pseudo;
      }
    }
    for(var i in players){
      console.log(players[i]);
      if(players[i] == nomJoueur){
        delete players[i];
      }
    }
    console.log(players);
    socket.broadcast.emit('userLeaveAll', players );
    rooms.forEach(function(room){
      console.log(room);
      socket.broadcast.to(room.name).emit('userLeaveRoom', roomUser);
    });

  })
});


function replaceInArray(array,item){
  var isExist = false;
  for( var i in array){
    // console.log(array[i].name);
    // console.log(item.name);
    if (array[i].name == item.name){
      isExist = true;
      return;
    }
    if(isExist){
      previousItem = array[i];
    }
  }
  if(!isExist){
    array.push(item);
  }
}
