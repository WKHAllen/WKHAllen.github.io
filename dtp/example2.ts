import { Client } from "dtp.js";

// A message to send to the server
const message = "Hello, server!";

// Create a client that sends a message to the server
// and prints all incoming messages to stdout
const client = new Client<string, number>();
client.on("recv", (data) => {
  console.log(`Received message from server: ${data}`);
});
client.on("disconnected", () => {
  console.error("Unexpectedly disconnected from server");
});

// Connect to the server
await client.connect("127.0.0.1", 29275);
// Send the message to the server
await client.send(message);
