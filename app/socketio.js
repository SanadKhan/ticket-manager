const socketio = require('socket.io');

let io;

// const sio  = {
//     init: function(server) {
//         io = socketio(server);
//         return io;
//     },
//     getIO: function() {
//         if (!io) {
//            throw new Error("Can't get io instance before calling .init()");
//         }
//         return io;
//     }
// }


module.exports = {
   init: function(server) {
       io = socketio(server);
       return io;
   },
   getIO: function() {
       if (!io) {
          throw new Error("Can't get io instance before calling .init()");
       }
       return io;
   }
}

// https://stackoverflow.com/questions/70724492/implement-socket-io-in-node-js-application-controller
// https://stackoverflow.com/questions/47837685/use-socket-io-in-expressjs-routes-instead-of-in-main-server-js-file
// https://stackoverflow.com/questions/32134623/socket-io-determine-if-a-user-is-online-or-offline