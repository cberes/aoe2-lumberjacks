(function (w, d, n) {
  function range(n) {
    return [...Array(n).keys()];
  }

  class Game {
    constructor(ui) {
      this._players = ['X', 'O'];
      this._ui = ui;
      this._currentTurn = 0;
      this._currentState = new State('-'.repeat(n * n));
      this._states = new StateSpace(this);
      this._done = false;
    }

    reset() {
      this._currentTurn = 0;
      this._currentState = new State('-'.repeat(n * n));
      this._done = false;
      this._ui.status = '';
    }

    get currentState() {
      return this._currentState;
    }

    player(turn) {
      return this._players[turn % 2];
    }

    bestNextState() {
      return this._states.best(this._currentState).next;
    }

    nextTurn() {
      if (this._done) {
        return;
      }

      this._currentState = new State(this._ui.board);

      if (this._currentState.isWin(this.player(this._currentTurn))) {
        this._ui.status = 'You won 😀';
        this._done = true;
        return;
      } else if (this._currentState.isDone) {
        this._ui.status = 'Draw 😐';
        this._done = true;
        return;
      }

      this._currentTurn += 1;
      this._currentState = this.bestNextState();
      this._ui.board = this._currentState.board;

      if (this._currentState.isWin(this.player(this._currentTurn))) {
        this._ui.status = 'You lose 🙁';
        this._done = true;
        return;
      } else if (this._currentState.isDone) {
        this._ui.status = 'Draw 😐';
        this._done = true;
        return;
      }

      this._currentTurn += 1;
    }
  }

  class StateSpace {
    constructor(game) {
      this.states = minimax({}, game.currentState, 0);

      function minimax(allStates, state, turn) {
        const nextPlayer = game.player(turn);
        const children = state.isDone ? [] : state.nextStates(nextPlayer);
        const score = state.score;
        if (score !== undefined) {
          allStates[state.board] = { score };
          return allStates;
        }

        const values = children.map(s => ({ next: s, score: findValue(s) }));
        const winNextTurn = values.find(child => child.next.isWin(nextPlayer));
        const next = turn % 2 === 1 && winNextTurn ? winNextTurn.next : values.reduce((acc, cur) => {
          if (turn % 2 === 0) {
            return acc.score <= cur.score ? acc : cur;
          } else {
            return acc.score >= cur.score ? acc : cur;
          }
        }, values[0]).next;
        const mean = values.reduce((acc, cur) => acc + cur.score, 0) / values.length;
        allStates[state.board] = { next, score: winNextTurn ? winNextTurn.score : mean };
        return allStates;

        function findValue(childState) {
          const knownValue = allStates[childState.board];
          if (knownValue !== undefined) {
            return knownValue.score;
          } else {
            return minimax(allStates, childState, turn + 1)[childState.board].score;
          }
        }
      }
    }

    best(state) {
      // accept either a String representation of the board or a State instance
      return this.states[state.board ? state.board : state];
    }
  }

  class State {
    constructor(board) {
      this._board = board;
    }

    get board() {
      return this._board;
    }

    nextStates(c) {
      const open = range(this.board.length).filter(i => this.board[i] === '-');
      const replace = index => this.board.substring(0, index) + c + this.board.substring(index + 1);
      return open.map(i => new State(replace(i)));
    }

    get isDone() {
      return this.board.indexOf('-') === -1;
    }

    isWin(c) {
      const winningIndices = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
      ];

      return winningIndices.find(x => x.every(i => this.board[i] === c));
    }

    get isTerminal() {
      return this.isWin('X') || this.isWin('O') || this.isDone;
    }

    get score() {
      if (this.isWin('X')) {
        return -1;
      } else if (this.isWin('O')) {
        return 1;
      } else if (this.isDone) {
        return 0;
      }
    }
  }

  class UI {
    constructor() {
      this.elements = d.getElementsByTagName('input');
    }

    set listener(_listener) {
      range(this.elements.length)
        .forEach(i => this.elements[i].addEventListener('change', _listener));
    }

    set reset(_listener) {
      d.getElementById('reset').addEventListener('click', _listener);
    }

    get board() {
      return range(this.elements.length).map(i => this.elements[i].value || '-').join('').toUpperCase();
    }

    set board(s) {
      range(s.length).forEach(i => {
        this.elements[i].value = s[i] !== '-' ? s[i] : '';
      });
    }

    set status(s) {
      d.getElementById('status').textContent = s;
    }
  }

  d.onreadystatechange = function () {
    if (d.readyState === 'interactive') {
      const ui = new UI();
      const game = new Game(ui);

      ui.listener = () => game.nextTurn();

      ui.reset = () => {
        game.reset();
        ui.board = game.currentState.board;
      };
    }
  };
}(window, document, 3));
