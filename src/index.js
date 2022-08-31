const express = require('express')
const hbs = require('hbs')
const path = require('path')
const bodyparser = require('body-parser')
const flash =  require('express-flash')
const session = require('express-session')
const MongoStore = require('connect-mongo');
require('../app/helper');
require('./db/mongoose');

const port = process.env.PORT || 3000;
const app = express();
const server = app.listen(port ,() => {
	console.log('Server is up to port ' +port)
});

const sio = require('../app/socketio');
sio.init(server);
// use dependent routes for io
const userRouter = require('./routers/user');
const ticketRouter = require('./routers/ticket');
app.use(bodyparser.urlencoded({ extended: true }));

//Define path for views
const publicDirectoryPath = path.join(__dirname,'../public')
const viewsPath = path.join(__dirname,'../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials') 

//Setup static directory to serve
app.use(express.static(publicDirectoryPath))
app.use(bodyparser.json());
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

app.use(session({ 
	secret: process.env.SESSION_KEY,
	resave: false,
	saveUninitialized: true,
	proxy: process.env.PROXY_STATUS === 'dev' ? false : true, 
	name: process.env.SESSION_NAME,
	cookie: {
		secure: process.env.SESSION_SECURE === 'dev' ? false : true,  
		maxAge: 24 * 60 * 60 * 1000 // One day	
	},
	store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL})
}))

// // Socket
// let count = 0;
// io.on('connection', (socket) => {
// 	console.log("New Web Socket Connected!");
// 	// socket.emit('countUpdated!');
// 	socket.emit('message', 'Welcome!');
// 	socket.on('sendTicketMessage', () => {
// 		// count++;
// 		io.emit('message', "New Ticket Assigned");
// 	})
// 	// socket.on('sendTicketMessage', (ticketAssigned,callback) => {
// 	// 	socket.emit('message', 'New ticket is assigned to you!');
// 	// 	callback();
// 	// })
// });

app.use(flash());
app.use(userRouter);
app.use(ticketRouter);

app.get('*', (req, res) => {
	res.render('404', {
		title:'Ticket Manager',
	});
});