//брокер rabbitmq
const amqp = require("amqplib");

var channelConsumer, channelProducer, connection;

connectQueue(); // call connectQueue function

async function connectQueue() {
    try {
        //connect to 'test-queue', create one if does not exist already
        connection = await amqp.connect("amqp://user1:password1@rabbitmq:5672");
        channelConsumer = await connection.createConfirmChannel();
        channelProducer = await connection.createConfirmChannel();

        await channelConsumer.assertQueue("engine-to-estimation", { durable: true });
        await channelProducer.assertQueue("estimation-to-back", { durable: true });

        console.log('"engine-to-estimation" and "estimation-to-back" are created');

        channelConsumer.consume("engine-to-estimation", async (data) => {
            try {
                let dataJson = JSON.parse(data.content.toString());
                console.log("Received message: " + data.content.toString());

                let est = dataJson;

                // Create the response object with the request ID for correlation
                const response = {
                    answer: est,
                    requestId: dataJson.requestId
                };

                // Publish the response to the exchange with the routing key of the request ID
                await channelConsumer.sendToQueue("estimation-to-back", Buffer.from(JSON.stringify(est)));

                // Print information about the sent response
                console.log("Response sent: " + JSON.stringify(response));

                // Подтверждение обработки сообщения
                await channelConsumer.ack(data);
            } catch (error) {
                console.log("Error occurred: " + error.message);
                // Reject the message and return it to the queue to be reprocessed
                channelConsumer.nack(data);
            }

        }, { noAck: false });
        
    } catch (error) {
        console.log(error)
    }
}

class BoardInGame {
    constructor (fen) {
        this.fen = fen;
        const parts = fen.split(' ');
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

//const Board = new BoardInGame('r1bq1b1r/p4kpp/2n5/4p2n/8/8/PPPP1PPP/RNB1K2R w KQ - 0 11');
//Board.MaterialEstimate();

//fen: 'r1bqkb1r/ppp2ppp/2n2n2/3pp1N1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 0 5'