(() => {
  document.addEventListener('DOMContentLoaded', () => {
    let socket = io(); // websocket to server
    let grid = document.querySelector('.grid');
    let gameOverView = document.querySelector('.game-over-view');

    // game states
    let gameInPlay = false;
    let snakeBody = [[3, 3], [3, 4]];
    let foodPos = null;
    let score = 0;

    let _stringToNums = posString => {
      return posString.split(',').map(x => parseInt(x));
    };

    let _numsToString = pos => {
      return `${pos[0]},${pos[1]}`;
    };

    let _mouseenterHandler = event => {
      event.currentTarget.querySelector('.button').style.display = 'flex';
    };

    let _mouseleaveHandler = event => {
      event.currentTarget.querySelector('.button').style.display = 'none';
    };

    let _clickHandler = event => {
      _placeFood(event);
    };

    let _addEventListeners = element => {
      element.addEventListener('mouseenter', _mouseenterHandler);
      element.addEventListener('mouseleave', _mouseleaveHandler);
      element.addEventListener('click', _clickHandler);
    };

    let _removeEventListeners = element => {
      element.removeEventListener('mouseenter', _mouseenterHandler);
      element.removeEventListener('mouseleave', _mouseleaveHandler);
      element.removeEventListener('click', _clickHandler);
    };

    let _placeFood = event => {
      if (!foodPos) {
        let cell = event.currentTarget;
        _removeEventListeners(cell);
        cell.querySelector('.button').style.display = 'flex';
        foodPos = _stringToNums(cell.dataset.cellPos);
        socket.emit('foodPlaced', foodPos);
        console.log('food placed at', foodPos);
      }
    };

    // remove food when food is eaten (state.foodPos = null)
    let _removeFood = () => {
      let cell = grid.querySelector(
        `div[data-cell-pos=${'"' + _numsToString(foodPos) + '"'}]`
      );

      _addEventListeners(cell);
      cell.querySelector('.button').style.display = 'none';
      foodPos = null;
      console.log('food removed');
    };

    let _assignCellColor = (cell, i, j) => {
      if ((i + j) % 2 == 0) {
        cell.style.backgroundColor = '#B7D65C';
      } else {
        cell.style.backgroundColor = '#AFCF55';
      }
    };

    let _createBoard = () => {
      for (i of Array(8).keys()) {
        for (j of Array(8).keys()) {
          let cell = document.createElement('div');
          let button = document.createElement('button');

          button.setAttribute('class', 'button');
          button.setAttribute('data-button-pos', `${i},${j}`);
          cell.setAttribute('class', 'cell');
          cell.setAttribute('data-cell-pos', `${i},${j}`);
          _assignCellColor(cell, i, j);
          _addEventListeners(cell);

          cell.appendChild(button);
          grid.appendChild(cell);
        }
      }
    };

    let _renderSnake = () => {
      if (snakeBody) {
        for (let pos of snakeBody) {
          let cell = grid.querySelector(
            `div[data-cell-pos=${'"' + _numsToString(pos) + '"'}]`
          );
          _removeEventListeners(cell);

          // erase food, if mouse ever hovered on a cell before snake passed through
          cell.querySelector('.button').style.display = 'none';
          cell.style.backgroundColor = '#FCBE2C';
        }
      }
    };

    let _eraseSnake = () => {
      for (let pos of snakeBody) {
        let cell = grid.querySelector(
          `div[data-cell-pos=${'"' + _numsToString(pos) + '"'}]`
        );

        _assignCellColor(cell, pos[0], pos[1]);
        _addEventListeners(cell);
      }
    };

    let _updateScore = () => {
      document.querySelector('.score').innerHTML = score;
    };

    let _renderGameOver = () => {
    	gameOverView.style.display = 'flex';
    }

    _createBoard();

    socket.on('connect', () => {
      console.log('connected to server');
      // take care of markup
    });

    socket.on('gameUpdate', state => {
      console.log('gameUpdate state', state);

      if (!state.gameInPlay) {
      	_renderGameOver();
        socket.disconnect();
      }

      _eraseSnake();
      gameInPlay = state.gameInPlay;
      snakeBody = state.snakeBody;
      score = state.score;
      _updateScore();
      _renderSnake();

      if (!state.foodPos && foodPos) {
        _removeFood();
      }
    });
  });
})();
