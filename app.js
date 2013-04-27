GameBoard = new Meteor.Collection("game_board");
Players = new Meteor.Collection("players");
Games = new Meteor.Collection("games");
if (Meteor.isClient) {
  Template.game_board.board = function () {
    var board = [];
    for (i = 0; i < 10; i++) {
      board[i] = {line: []};
      for (j = 0; j < 10; j++) {
        conditions = {x: i, y: j};
        if (game = Session.get("game")) {
          if (cell = GameBoard.findOne(_.extend(conditions, {game: game}))) {
            board[i].line[j] = cell;
          } else {
            board[i].line[j] = conditions;
          }
        }
      }
    }
    console.log(board);
    return board;
  };

  Template.game_board.my_symbol = function() {
    game = Games.findOne(Session.get("game"));
    if (game.from == this.player) {
      return "x";
    } else if (game.to == this.player) {
      return "o";
    }
  }

  Template.game_board.events({
    'click .cell' : function () {
      GameBoard.insert(_.extend(this, {player: Session.get("player")}));
    }
  });

  Template.players.players = function() {
    return Players.find();
  }

  Template.players.its_me = function() {
    return this.name == Session.get("username");
  }

  Template.players.not_in_a_game = function() {
    return Games.findOne({$or: [{to: this._id}, {from: this._id}]}) == null;
  }

  Template.players.events({
    'click .play' : function () {
      Session.set("game", Games.insert({from: Session.get("player"), to: this._id}));
    }
  });

  Template.games.games = function() {
    return Games.find({accepted_at: {$not: null}});
  }
  Template.games.from_name = function() {
    return Players.findOne(this.from).name;
  }
  Template.games.to_name = function() {
    return Players.findOne(this.to).name;
  }

  Meteor.startup(function() {
    if (! Session.get("username")) {
      Session.set("username", prompt("Qual o seu nome"));
      Session.set("player", Players.insert({name: Session.get("username")}));
    }
  });
  Meteor.autorun(function() {
    if (invite = Games.findOne({$and: [{to: Session.get("player")}, {accepted_at: null}, {refused_at: null}]})) {
      from = Players.findOne(invite.from);
      if (confirm(from.name + " quer jogar.")) {
        Games.update(invite._id, {$set: {accepted_at: new Date()}})
        Session.set("game", invite._id);
      } else {
        Games.update(invite._id, {$set: {refused_at: new Date()}});
      }
    }

    if (invite = Games.findOne({$and: [{from: Session.get("player")}, {refused_at: {$not: null}}]})) {
      to = Players.findOne(invite.to);
      alert(to.name + " recusou o seu convite!");
      Session.set("game", null);
      Games.remove(invite._id);
    }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
