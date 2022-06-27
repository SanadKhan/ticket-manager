const express = require('express')
const hbs = require('hbs')
const path = require('path')
const userRouter = require('./routers/user')
const ticketRouter = require('./routers/ticket')
const bodyparser = require('body-parser')
const flash =  require('express-flash')
const session = require('express-session')
const MongoStore = require('connect-mongo');
require('../app/helper')
require('./db/mongoose')

const app = express() 
app.use(bodyparser.urlencoded({ extended: true }));
const port = process.env.PORT

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
	proxy: true,
	name: 'TicketManagerCookies',
	cookie: {
		httpOnly: true,
		secure: true, 
		sameSite: 'none', 
		maxAge: 24 * 60 * 60 * 1000 // One day	
	},
	store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL})
}))
app.use(flash())
app.use(userRouter)
app.use(ticketRouter)

app.get('*', (req, res) => {
	res.render('404', {
		title:'Ticket Manager',
	})
})

app.listen(port ,() => {
	console.log('Server is up to port ' +port)
})
