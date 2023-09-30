import type * as Party from "partykit/server";
import { onConnect } from "y-partykit";

export default {
  async onConnect(conn, room, context) {
    // A websocket just connected!
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${room.id}
  url: ${new URL(context.request.url).pathname}`
    );
    return onConnect(conn, room, { persist: true });
  },
} satisfies Party.PartyKitServer;

// export default class Server implements Party.Server {
//   constructor(readonly party: Party.Party) {}

//   onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
//     // A websocket just connected!
//     console.log(
//       `Connected:
//   id: ${conn.id}
//   room: ${this.party.id}
//   url: ${new URL(ctx.request.url).pathname}`
//     );

//     // let's send a message to the connection
//     conn.send("hello from server");
//   }

//   onMessage(message: string, sender: Party.Connection) {
//     // let's log the message
//     console.log(`connection ${sender.id} sent message: ${message}`);
//     // as well as broadcast it to all the other connections in the room...
//     this.party.broadcast(
//       `${sender.id}: ${message}`,
//       // ...except for the connection it came from
//       [sender.id]
//     );
//   }
// }

// Server satisfies Party.Worker;
