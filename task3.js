const crypto = require('crypto');
const readline = require('readline');
const Table = require('cli-table3');

class moveChecker {
  constructor(moves) {
    this.moves = moves ;
    this.isValid = this.validate();
  }

  validate() {
    if (!this.isValidNumberOfMoves()) {
      console.error('Moves must be an odd number of options and >= 3');
      return false ;
    }
    
    if (this.hasRepeatedElements()) {
      console.error('Moves must be non-repeating');
      return false ;
    }
    return true 
  }

  isValidNumberOfMoves() {
    const numMoves = this.moves.length;
    return numMoves >= 3 && numMoves % 2 === 1;
  }

  hasRepeatedElements() {
    const seen = new Set();
    for (const move of this.moves) {
      if (seen.has(move)) {
        return true;
      }
      seen.add(move);
    }
    return false;
  }
}


class GameComputer {
  constructor(moves) {
    this.moves = moves;
    this.key = this.generateKey();
    this.computerMove = this.chooseMove();
    this.hmac = this.generateHmac();
  }

  // Method to choose a random move for the computer
  chooseMove() {
    const randomIndex = crypto.randomInt(0, this.moves.length);
    return this.moves[randomIndex];
  }

  generateKey() {
    return crypto.randomBytes(32);
  }

  generateHmac() {
    const hmac = crypto.createHmac('sha3-256', this.key);
    hmac.update(this.computerMove);
    return hmac.digest('hex');
  }

  displayHmac() {
    console.log(`The HMAC for the computer's move is: ${this.hmac}`);
  }
  displayKey(){
    console.log(`key = ${this.key.toString('hex')}`)
  }
}


class HelpDisplayer {
  constructor(moves) {
    this.moves = moves;
  }

  displayHelp() {
    const table = new Table({
      head: ['< PC\\User >', ...this.moves], 
    });

    this.moves.forEach((move, i) => {
      const row = this.moves.map((userMove, j) => {
        if (i === j) return 'Draw';
        const halfMoves = Math.floor(this.moves.length / 2);
        return (j - i + this.moves.length) % this.moves.length <= halfMoves ? 'Win' : 'Lose';
      });
      table.push({ [move]: row });
    });

    console.log(table.toString());
  }
}


class GameMenu {
  constructor(moves) {
    this.moves = moves;
    this.helpDisplayer = new HelpDisplayer(moves)
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  
  displayMenu() {
    console.log('Available moves:');
    this.moves.forEach((move, index) => {
      console.log(`${index + 1} - ${move}`);
    });
    console.log('0 - Exit');
    console.log('? - Help');
  }


  handleInput() {
    this.rl.question('Please select an option: ', (input) => {
      if (input === '0') {
        console.log('Closing the program...');
        this.rl.close();
      } else if (input === '?') {
        this.helpDisplayer.displayHelp();
        this.handleInput(); 
      } else {
        const choice = parseInt(input, 10) - 1;
        if (choice >= 0 && choice < this.moves.length) {
          console.log(`Your play: ${moves[choice]}`);//display choice
          this.playRound(choice);
        } else {
          console.log('Invalid option. Please try again.');
          this.handleInput(); // Show the menu again after invalid input
        }
      }
    });
  }

  
  playRound(userChoice) {
    const computerChoice = Math.floor(Math.random() * this.moves.length);
    console.log(`Computer played: ${this.moves[computerChoice]}`);

    if (userChoice === computerChoice) {
      console.log('It\'s a draw!');
    } else {
      const totalMoves = this.moves.length;
      const halfMoves = Math.floor(totalMoves / 2);
      
      if ((userChoice - computerChoice + totalMoves) % totalMoves < halfMoves) {
        console.log('You win!');
      } else {
        console.log('You lose!');
      }
    }
    gameComputer.displayKey();
    this.rl.close();
  }

  start() {
    this.displayMenu();
    this.handleInput();
  }
}


const moves = process.argv.slice(2);
const moveCheckerInstance = new moveChecker(moves);

if (!moveCheckerInstance.isValid) {
  console.error('Please input correct movements.');
  process.exit(1); 
}
const gameComputer = new GameComputer(moves);
gameComputer.displayHmac();
const gameMenu = new GameMenu(moves);
gameMenu.start();





