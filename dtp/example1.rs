use rustdtp::{Server, ServerEvent, EventStreamExt};

#[tokio::main]
async fn main() {
  // Create a server that receives strings
  // and returns the length of each string
  let (mut server, mut server_event)
    = Server::&#60;usize, String&#62;::start(("0.0.0.0", 0)).await.unwrap();
  
  // Iterate over events
  while let Some(event) = server_event.next().await {
    match event {
      ServerEvent::Connect { client_id } => {
        println!("Client with ID {} connected", client_id);
      },
      ServerEvent::Disconnect { client_id } => {
        println!("Client with ID {} disconnected", client_id);
      },
      ServerEvent::Receive { client_id, data } => {
        // Send back the length of the string
        server.send(client_id, data.len()).await.unwrap();
      },
      ServerEvent::Stop => {
        // No more events will be sent, and the loop will end
        println!("Server closed");
      },
    }
  }
}
