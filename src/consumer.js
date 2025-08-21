require("dotenv").config();
const amqp = require("amqplib");
const NotesService = require("./NotesService");
const MailSender = require("./MailSender");
const Listener = require("./listener");

const init = async () => {
  const notesService = new NotesService();
  const mailSender = new MailSender();
  const listener = new Listener(notesService, mailSender);

  const connectionString = `amqps://${process.env.AMAZON_MQ_USERNAME}:${process.env.AMAZON_MQ_PASSWORD}@${process.env.RABBITMQ_SERVER}:${process.env.AMAZON_MQ_PORT}`;
  const connection = await amqp.connect(connectionString);
  
  const channel = await connection.createChannel();

  await channel.assertQueue("export:notes", {
    durable: true,
  });

  channel.consume("export:notes", listener.listen, { noAck: true });
};

init();
