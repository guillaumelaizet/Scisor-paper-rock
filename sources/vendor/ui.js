window.addEventListener('DOMContentLoaded', function(){
  var socket = io.connect(window.location.hostname);

  var users = [];
  var userInfo = {
    pseudo : '',
    avatar : ''
  }
  var submitted;
  var compte;
  var tour = 1;
  var tourMax = 10;
  var scoreJoueur = 0;
  var scoreAdversaire = 0;
  var timestamp1;
  var timestamp2;

  socket.on('users',function(player){
    users.push(player);
  });

  // function init(){
  $('input[type=submit]').on('click', function(e){
    e.preventDefault();
    // console.log(socket.io);
    var occuped = false;
    var pseudo = $('input[type=text]').val();
    var erreur = '<p>Vous devez rentrer votre pseudo pour continuer !</p>';
    // console.log(users);
    users.forEach(function(username){
      if(username == pseudo){
        occuped = true;
      }
    });
    if(pseudo == ''){
      if($('input[type=text]').next().html() ==  undefined){
        $('input[type=text]').after(erreur);
      }
    } else if(occuped){
      if($('input[type=text]').next().html() == undefined){
        $('input[type=text]').after('<p>Ce pseudo est deja utilisé, choisi en un autre..</p>');
      }
    } else {
      userInfo.pseudo = pseudo;
      socket.emit('pseudo', pseudo);
      $('input[type=text]').next().remove();
      $('form').after('<h2>Choisissez votre avatar,' + ' ' + pseudo + ' !</h2>');
      $('#avatar').css('display', 'inline');
      $('input[type=submit]').attr('disabled', 'disabled');
      $('input[type=text]').attr('disabled', 'disabled');

    }
  });
  // }
  // init();

  $('#avatar img').on('click', function(){
    $(this).addClass('checked').removeClass('notChecked');
    $('#avatar img').not($(this)).addClass('notChecked').removeClass('checked');
    $('#avatar').css('padding-bottom', '100px');
    var idAvatar = $(this).attr('id');
    var arenes = $('#arene img');
    var messageAvatar = 'Veuillez choisir votre arêne !';
    var messagePresent = $('#avatar').next()[0].innerHTML;
    if(messagePresent !== messageAvatar){
      $('#avatar').after('<h3>' + messageAvatar + '</h3>');
    }
    $('#arene').css('display', 'inline-block');
    var avatar = $(this).attr('alt');
    userInfo.avatar = avatar;
    socket.emit('avatarChecked', avatar)
    socket.on('updateRoom', function(rooms){
      console.log(rooms);
      for(var i in rooms){
        if(rooms[i].info.length > 1){
          var img = $('.imgArene img[alt="'+ rooms[i].name +'"]');
          img[0].style.filter = 'grayscale(100%)';
          img.addClass('full');
        }
      }
    });
  });


  $('#arene img').on('click', function(e){
    if($(this).hasClass('full')){
      setTimeout(function(){
        $('#info').show();
        $('#info').html('<p>Room pleine, chosir une autre</p>');
      },0);
      setTimeout(function(){
        $('#info').hide();
      },2000);
    } else {
      var arene = $(this).attr('alt');
      socket.emit('room',arene, userInfo);
    }
  });

  socket.on('logged', function(rooms){
    rooms.forEach(function(room){
      console.log(room.users);
      $('h2').html('Bienvenue dans l\'' + room.name);
      // $('h2').css('margin-bottom' , '50px');
      $('h3').html('Manche : ' + tour);
      // $('h3').css({'margin-bottom' , '80px'})
      // console.log(room.name);
      $('#formulaireConnection').hide();
      $('#avatar').hide();
      $('#arene').hide();
      // $('h3').hide();
      $('#imgArene').html('<img src="./sources/images/image' + room.name.replace(' ','') + '.jpg" alt="' + room + '">');
      $('#imgArene').show();
      for(var i in room.users){
        console.log(room.users[i].id);
        console.log(room.users[i]);
        if(room.users[i].id == socket.id){
          $('#joueur').html('<p>' + room.users[i].pseudo + '</p><img src="./sources/images/' + room.users[i].avatar +'.jpg" alt="' + room.users[i].avatar + '"><p>Score : ' + room.users[i].score + '</p>');
        }
      }
      $('#joueur').show();
      $('#choixJoueur').show();
      if(room.info.length <= 1){
        $('#info').show();
      }
      if(room.info.length>1){
        for(var i in room.users){
          console.log(room.roomInfo);
          if(room.users[i].id !== socket.id){
            $('#adversaire').html('<p>' + room.users[i].pseudo + '</p><img src="./sources/images/' + room.users[i].avatar +'.jpg" alt="' + room.users[i].avatar + '"><p>Score : ' + room.users[i].score + '</p>');
            $('#adversaire').show();
            $('#choixAdversaire').show();
          }
        }
      }
    });
    socket.emit('roomReady', rooms);
  });

  socket.on('tableau', function(data){
    console.log(JSON.stringify(data));
    data = data;
    var i = 1;
    $('#lienScore').show();
    $('#tableauScore').html('<table class="table table-striped"><thead><tr><th>#</th><th>Pseudo</th><th>Meilleur Score</th><th>Score cumulé</th><th>Temps</th></tr></thead><tbody></tbody><table>');
    var html = $("#tableauScore .table>tbody").html();
    data.forEach(function(users){
      console.log(users.pseudo);
      console.log(html);
      if(users.temps){
        html += '<tr><th>'+ i +'</th><th>'+ users.pseudo +'</th><th>'+ users.scoreMeilleurePartie +'</th><th>'+ users.scoreCumule +'</th><th>'+ users.temps +'</th></tr>';
      } else {
        html += '<tr><th>'+ i +'</th><th>'+ users.pseudo +'</th><th>'+ users.scoreMeilleurePartie +'</th><th>'+ users.scoreCumule +'</th><th></th></tr>';
      }
      i++;
    });
    console.log(html);
    $('#tableauScore .table>tbody').html(html);
    console.log($('#tableauScore').html());
  });

  $('#lienScore').hover(function (){
    $('#tableauScore').show();
    console.log('mouseEnter');
  }, function(){
    $('#tableauScore').hide();
    console.log('mouseLeave');
  });

  socket.on('loggedNewUser', function(rooms){
    rooms.forEach(function(room){
      for(var i in room.users){
        console.log(room.users[i]);
        if(room.users[i].id !== socket.id){
          $('#adversaire').html('<p>' + room.users[i].pseudo + '</p><img src="./sources/images/' + room.users[i].avatar +'.jpg" alt="' + room.users[i].avatar + '"><p>Score : ' + room.users[i].score + '</p>');
          $('#adversaire').show();
          $('#choixAdversaire').show();
          $('#info').hide();
        }
      }

    });
  });

  socket.on('letsGo', function (rooms){
    timestamp1 = new Date().getTime();
    $('#info').show();
    function info(){
      setTimeout(function(){
        $('#info').html('Très bien tout le monde est la, nous allons pouvoir commencer');
      },0);
      setTimeout(function(){
        $('#info').html('Le jeu est très simple, c\'est le fameux Pierre Feuille Ciseaux Lezard Spoke ! Tout le monde connait ! ')
      },2000);
      setTimeout(function(){
        $('#info').html('Non tu connais pas ? pas de panique, tu peux regarder en survolant le <strong>"?"</strong>' );
      },4000)
      setTimeout(function(){
        $('#info').hide();
      },5000);
    }
    $('#hint').show();
    info();
    clear(info);
    submitted = false;
    $('#choixJoueur img').hover(function(){
      $(this).css({'width' : '120px', 'height' : '120px'});
      console.log($(this).width);
    },function(){
      $(this).css({'width' : '100px', 'height' : '100px'});
      console.log($(this).width);
    })
    $('#choixJoueur img').on('click', function(){
      if(!submitted){
        var choixJoueur = {};
        var choix = $(this).attr('class');
        rooms.forEach(function(room){
          for(var i in room.users){
            if(room.users[i].id == socket.id){
              room.users[i].choix = choix;
              room.users[i].score = scoreJoueur;
            }
          }
        })
        socket.emit('choix', rooms);
        submitted = true;
      } else {
        setTimeout(function(){
          $('#info').show();
          $('#info').html('Vous avez deja joué votre coup');
        },0);
        setTimeout(function(){
          $('#info').hide();
        },1000);

      }

    });
  });

  socket.on('tie', function(choice, rooms){
    rooms.forEach(function(room){
      setTimeout(function(){
        $('#info').show();
        $('#info').html('Match nul ! quelle déception....');
      },0);
      setTimeout(function(){
        $('#info').html('Allez on remet ça');
      },3000);
      setTimeout(function(){
        $('#info').hide();
      },6000)
      submitted = false;
      choice[1].score += 3;
      choice[0].score +=3;
      for(var i in room.users){
        if(room.users[i].pseudo == choice[1].pseudo && room.users[i].id == socket.id){
          scoreJoueur = choice[1].score;
        }
        if(room.users[i].pseudo == choice[1].pseudo && !(room.users[i].id == socket.id)){
          scoreAdversaire = choice[1].score;
        }
        if(room.users[i].pseudo == choice[0].pseudo && room.users[i].id == socket.id){
          scoreJoueur = choice[0].score;
        }
        if(room.users[i].pseudo == choice[0].pseudo && !(room.users[i].id == socket.id)){
            scoreAdversaire = choice[0].score;
        }
        $('#joueur p:last-child').html('<p>' + scoreJoueur + ' points</p>');
        $('#adversaire p:last-child').html('<p>' + scoreAdversaire + ' points</p>');
      }
    });
    tour++;
    $('h3').html('Manche : ' + tour);
    console.log(tour);
    if(tour >= tourMax){
      var temps = endGame(choice);
      console.log(Object.keys(choice));
      socket.emit('scoreFinal', choice, temps);
    }
  });

  socket.on('winjoueur1', function(choice, rooms){
    rooms.forEach(function(room){
      setTimeout(function(){
        $('#info').show();
        $('#info').html(choice[0].pseudo + ' a joué ' + choice[0].choix);
      },0);
      setTimeout(function(){
        $('#info').html(choice[1].pseudo + ' a joué ' + choice[1].choix);
      },2000);
      setTimeout(function(){
        $('#info').html('Bravo ' + choice[0].pseudo + ' a gagné cette manche');
      },4000);
      setTimeout(function(){
        $('#info').hide();
      },5000);
      submitted = false;
      choice[1].score += 2;
      choice[0].score +=5;
      for(var i in room.users){
        if(room.users[i].pseudo == choice[1].pseudo && room.users[i].id == socket.id){
          scoreJoueur = choice[1].score;
        } else if(room.users[i].pseudo == choice[1].pseudo && !(room.users[i].id == socket.id)){
          scoreAdversaire = choice[1].score;
        }
        if(room.users[i].pseudo == choice[0].pseudo && room.users[i].id == socket.id){
          scoreJoueur = choice[0].score;
        } else if(room.users[i].pseudo == choice[0].pseudo && !(room.users[i].id == socket.id)){
            scoreAdversaire = choice[0].score;
        }
        $('#joueur p:last-child').html('<p>' + scoreJoueur + ' points</p>');
        $('#adversaire p:last-child').html('<p>' + scoreAdversaire + ' points</p>');
      }
    })
    tour++;
    $('h3').html('Manche : ' + tour);
    console.log(tour);
    if(tour >=tourMax){
      // console.log(timestamp1);
      var temps = endGame(choice,timestamp1);
      console.log(Object.keys(choice));
      console.log(choice,timestamp1);
      socket.emit('scoreFinal', choice,temps);
    }
  });

  socket.on('winjoueur2', function(choice, rooms){
    console.log(JSON.stringify(choice));
    rooms.forEach(function(room){
      setTimeout(function(){
        $('#info').show();
        $('#info').html(choice[1].pseudo + ' a joué ' + choice[1].choix);
      },0);
      setTimeout(function(){
        $('#info').html(choice[0].pseudo + ' a joué ' + choice[0].choix);
      },2000);
      setTimeout(function(){
        $('#info').html('Bravo ' + choice[0].pseudo + ' a gagné cette manche');
      },4000);
      setTimeout(function(){
        $('#info').hide();
      },4000);
      submitted = false;
      choice[1].score += 5;
      choice[0].score +=2;
      for(var i in room.users){
        if(room.users[i].pseudo == choice[1].pseudo && room.users[i].id == socket.id){
          scoreJoueur = choice[1].score;
        } else if(room.users[i].pseudo == choice[1].pseudo && !(room.users[i].id == socket.id)){
          scoreAdversaire = choice[1].score;
        }
        if(room.users[i].pseudo == choice[0].pseudo && room.users[i].id == socket.id){
          scoreJoueur = choice[0].score;
        } else if(room.users[i].pseudo == choice[0].pseudo && !(room.users[i].id == socket.id)){
            scoreAdversaire = choice[0].score;
        }
      }
      $('#joueur p:last-child').html('<p>' + scoreJoueur + ' points</p>');
      $('#adversaire p:last-child').html('<p>' + scoreAdversaire + ' points</p>');
    })
    tour++;
    $('h3').html('Manche : ' + tour);
    console.log(tour);
    if(tour >=tourMax){
      console.log(timestamp1);
      var temps = endGame(choice,timestamp1);
      console.log(Object.keys(choice))
      console.log(choice);
      socket.emit('scoreFinal', choice, temps);
    }
  });

  socket.on('userLeaveRoom',function(data){
    console.log('user Leave');
    console.log(data.users);
    for(var i in data.users){
      if(data.users[i].id !== socket.id) {
        $('#info').show();
        setTimeout(function(){
          $('#info').html( data.users[i].pseudo + ' a déserté le combat ! ');
        },0);
        setTimeout(function(){
          $('#info').html('clique <a href="">ici</a> pour revenir a l\'acceuil et défier d\'autres joueurs');
        },2000);
      }
    }
    $('#info>a').on('click', function(){
      window.location.reload();
    });
  });


  socket.on('userLeaveAll', function(players){
    users = players;
  });
});



function endGame(choice,timestamp1){
  timestamp2 = new Date().getTime();
  var gagnant;
  var scoreGagnant;
  var scorePerdant;
  if(choice[0].score > choice[1].score){
    gagnant = choice[0].pseudo;
    scoreGagnant = choice[0].score;
    scorePerdant = choice[1].score;
  } else if(choice[0].score < choice[1].score){
    gagnant = choice[1].pseudo;
    scoreGagnant = choice[1].score;
    scorePerdant = choice[0].score;
  }
  var temps = timestamp2 - timestamp1;

  var cent = Math.floor(temps / 10) % 100;
  var sec = Math.floor(temps /1000) % 60;
  var min = Math.floor(temps /60000) %60;

  var tempsManuscrit = min + 'min(s) ' + sec + 'sec(s) et ' + cent + 'centièmes';
  var tempsDigit = min +':' + sec + ':' + cent;
  setTimeout(function(){
    $('#info').show();
    $('#info').html('Toute les manches ont été jouées ! ');
  },0);
  setTimeout(function(){
    $('#info').html(' Voyons voir qui a gagné :  ');
  },1000);
  setTimeout(function(){
    $('#info').html('c\'est ' + gagnant + ' qui a gagné sur le score de : ' + scoreGagnant + ' à ' + scorePerdant);
  },2000);
  setTimeout(function(){
    $('#info').html('La partie a duré' + tempsManuscrit);
  },3000);
  setTimeout(function(){
    $('#info').hide();
  }, 6000);
  return tempsDigit;
};



function clear(nameFunction){
  clearTimeout(nameFunction);
};

$('#hint').hover(function(){
  $('#imgHint').show();
}, function(){
  $('#imgHint').hide();
  }
);
