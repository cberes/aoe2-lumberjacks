(function (d) {
  var NUM_DOORS = 3;

  function randomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  function randomDoor() {
    return randomInt(NUM_DOORS);
  }

  function randomElement(arr) {
    return arr.length > 0 && arr[randomInt(arr.length)];
  }

  function Simulation(strategy, n) {
    var winCount = 0;

    this.getGameCount = function () {
      return n;
    };

    this.getWinCount = function () {
      return winCount;
    };

    this.getLossCount = function () {
      return n - winCount;
    };

    this.toString = function () {
      var winPercent = this.getWinCount() / this.getGameCount();
      return this.getGameCount() + ' trials: won ' + this.getWinCount() + ', lost ' + this.getLossCount() + ' (' + winPercent + ')';
    };

    this.run = function () {
      var i, game, player;

      for (i = 0; i < n; i++) {
        player = new Player(strategy);
        game = new Game(player);
        game.play();
        if (game.isPlayerWon()) {
          ++winCount
        }
      }
    };
  }

  function Game(player) {
    var initialChoice, finalChoice, goat, doors;

    function pickGoat(winner, initialChoice) {
      var i, possibleGoats = [];
      for (i = 0; i < NUM_DOORS; ++i) {
        if (i !== winner && i !== initialChoice) {
          possibleGoats.push(i);
        }
      }
      return randomElement(possibleGoats);
    }

    this.play = function () {
      doors = new Doors(randomDoor());
      initialChoice = player.chooseInitialDoor();
      goat = pickGoat(doors.getWinner(), initialChoice);
      player.setGoat(goat);
      finalChoice = player.chooseFinalDoor();
    };

    this.isPlayerWon = function () {
      return doors.isWinner(finalChoice);
    }
  }

  function RetainDoorStrategy() {
    this.chooseInitialDoor = function() {
      return randomDoor();
    }

    this.chooseFinalDoor = function (initialDoor, goatDoor) {
      return initialDoor;
    }
  }

  function ChangeDoorStrategy() {
    this.chooseInitialDoor = function() {
      return randomDoor();
    }

    this.chooseFinalDoor = function (initialDoor, goatDoor) {
      var i;
      for (i = 0; i < NUM_DOORS; ++i) {
        if (i !== initialDoor && i !== goatDoor) {
          return i;
        }
      }
    }
  }

  function RandomDoorStrategy() {
    this.chooseInitialDoor = function() {
      return randomDoor();
    }

    this.chooseFinalDoor = function (initialDoor, goatDoor) {
      var i, possibleDoors = [];
      for (i = 0; i < NUM_DOORS; ++i) {
        if (i !== goatDoor) {
          possibleDoors.push(i);
        }
      }
      return randomElement(possibleDoors);
    }
  }

  function Player(strategy) {
    var initialDoor, goatDoor;

    this.setGoat = function(door) {
      goatDoor = door;
    };

    this.chooseInitialDoor = function () {
      initialDoor = strategy.chooseInitialDoor();
      return initialDoor;
    };

    this.chooseFinalDoor = function () {
      return strategy.chooseFinalDoor(initialDoor, goatDoor);
    };
  }

  function Doors (winner) {
    var doors = [false, false, false];
    doors[winner] = true;

    this.getWinner = function () {
      return winner;
    };

    this.isWinner = function (door) {
      return doors[door];
    };
  }

  function runSimulation () {
    var n = 10000;
    var sim = new Simulation(new RetainDoorStrategy(), n);
    sim.run();
    d.getElementById('keep-door-result').innerHTML = sim.toString();

    sim = new Simulation(new ChangeDoorStrategy(), n);
    sim.run();
    d.getElementById('change-door-result').innerHTML = sim.toString();

    sim = new Simulation(new RandomDoorStrategy(), n);
    sim.run();
    d.getElementById('random-door-result').innerHTML = sim.toString();
  }

  d.onreadystatechange = function () {
    if (d.readyState === 'interactive') {
      d.getElementById('rerun').onclick = runSimulation;
      runSimulation();
    }
  };
}(document));
