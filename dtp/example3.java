package example;

import jdtp.Server;

class MyServer extends Server {
    @Override
    protected void receive(long clientID, Object data) {
        String message = (String) data;
        System.out.printf(
            "Received data from client #%d: %s\n",
            clientID,
            message
        );
    }

    @Override
    protected void connect(long clientID) {
        System.out.printf("Client #%d connected\n", clientID);
    }

    @Override
    protected void disconnect(long clientID) {
        System.out.printf("Client #%d disconnected\n", clientID);
    }
}
