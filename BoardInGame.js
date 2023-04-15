class BoardInGame {
    constructor (fen) {
        this.fen = fen;
        const parts = this.fen.split(' ');
        const rows = parts[0].split('/');
        console.log(rows);

        this.board = {};
        rows.forEach((row, i) => {
            let col = 0;
            row.split('').forEach((char) => {
                let charParse = parseInt(char);
                if (!isNaN(charParse)) {
                    for (let j = 0; j < charParse; j++){
                        const pos = `${String.fromCharCode('a'.charCodeAt() + col)}${8-i}`;
                        this.board[pos] = null;
                        ++col;
                    }
                } else {
                    const pos = `${String.fromCharCode('a'.charCodeAt() + col)}${8-i}`;
                    this.board[pos] = char;
                    col++;
                }
            });
        });
        for (let i = 0; i < 8; i++){

        }
        //console.log(this.board);
    }

    MaterialEstimate(){
        let score = 0;
        const materialValues = {
            'P': 1,
            'N': 3,
            'B': 3,
            'R': 5,
            'Q': 9
        };

        for (let cell in this.board) {
            if (this.board[cell]){
                const piece = this.board[cell].charAt(0);
                if (piece in materialValues) {
                    score += materialValues[piece];
                } else if (piece.toUpperCase() in materialValues) {
                    score -= materialValues[piece.toUpperCase()];
                }
            }
        }

        console.log('Score:', score);
    }
}

module.exports = new BoardInGame();