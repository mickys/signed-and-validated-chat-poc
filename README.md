#Proof of concept

Chat server with Ethereum Wallet Based Message signing and validation.

Uses Socket.IO and depends on MetaMask

## Steps:

- clone repository
- `npm install`
- `node server.js`
- access [http://localhost:3000](http://localhost:3000)

To Build bundle.js out of client.js
- `npm run-script build`

## Use Cases:
Useful when you want to create a central registry of "allowed speakers" that everyone loads and validates against.

This can be useful for decentralized chat services where anyone can write, but the client will get to see only validated messages.

There is indeed the issue of DDOSing your clients, but that's something that they need to tell the server to do as a request.

For example, the client can request the server to filter messages from invalid senders, one by one, or do the validation too.


