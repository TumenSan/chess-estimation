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