const crypto = require('crypto');

class Game {
  constructor(inputStrings) {
    if (!this.validateInputStrings(inputStrings)) {
      console.error('Please enter unique moves :)');
      process.exit(1);
    }

    this.inputStrings = inputStrings;
    this.n = inputStrings.length;
    this.validMoves = [...inputStrings, '0', '?'];
    this.hmacKey = this.generateHmacKey();
    this.M = this.generateTable();
    this.computerMoveIndex = 0;

    this.printMoves();
    this.startGame();
  }

  validateInputStrings(inputStrings) {
    const uniqueStrings = new Set(inputStrings);
    return uniqueStrings.size === inputStrings.length;
  }

  generateHmacKey() {
    return crypto.randomBytes(32);
  }

  generateHmacDigest(key, strings) {
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(strings.join(''));
    return hmac.digest('hex');
  }

  cyclic_index(k, n) {
    const a = Math.floor(k / n);
    const i = k - a * n;
    return i;
  }

  generateTable() {
    const M = [];
    for (let i = 0; i < this.n; i++) {
      M.push(Array.from({ length: this.n }, () => 'D'));

      const numL = Math.floor(this.n / 2);
      const numV = this.n - numL - 1;

      for (let j = 0; j < numL; j++) {
        M[i][this.cyclic_index(i + j + 1, this.n)] = 'L';
      }

      for (let j = 0; j < numV; j++) {
        M[i][this.cyclic_index(i - j - 1, this.n)] = 'V';
      }
    }
    return M;
  }

  printMoves() {
    console.log('HMAC:', this.generateHmacDigest(this.hmacKey, this.inputStrings));
    console.log('Available moves:');
    this.validMoves.forEach((str) => {
      let moveNumber;
      if (str === '?') {
        moveNumber = '? - help';
      } else if (str === '0') {
        moveNumber = '0 - exit';
      } else {
        moveNumber = `${this.validMoves.indexOf(str) + 1} - ${str}`;
      }
      console.log(moveNumber);
    });
  }

  startGame() {
    console.log('Enter your move:');
    process.stdin.on('data', (input) => {
      const move = input.toString().trim();

      if (move === '0') {
        console.log('Thanks for playing!');
        process.exit(0);
      } else if (move === '?') {
        console.log('Table of wins, loses, and draws:');
        this.M.forEach((row) => console.log(row.join(' ')));
        console.log('Enter your move:');
      } else if (isNaN(move) || move < 1 || move > this.n) {
        console.log(`Please enter a valid move between 1 and ${this.n} (or 'help' for the table, 'exit' to quit):`);
      } else {
        const moveIndex = parseInt(move) - 1;
        const computerMove = this.inputStrings[this.computerMoveIndex];
        const result = this.M[moveIndex][this.computerMoveIndex];

        console.log(`Your Move: ${this.inputStrings[moveIndex]}`);
        console.log(`Computer Move: ${computerMove}`);
        console.log(`Result: ${result === 'V' ? 'Victory!!!' : result === 'L' ? 'Lose...' : 'Draw :)'}`);

        console.log('HMAC key:', this.hmacKey.toString('hex'));

        this.computerMoveIndex = this.cyclic_index(this.computerMoveIndex + 1, this.n);

        console.log('Enter your move:');
      }
    });
  }
}

const inputStrings = process.argv.slice(2);

if (inputStrings.length % 2 === 0) {
  console.error('Please enter an odd number of strings.');
  process.exit(1);
}

const game = new Game(inputStrings);
