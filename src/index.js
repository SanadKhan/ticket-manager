const express= require('express')
const hbs = require('hbs')
const path = require('path')
const userRouter = require('./routers/user')
const ticketRouter = require('./routers/ticket')
require('./db/mongoose')
const bodyparser = require('body-parser')
const flash =  require('express-flash')
const session = require('express-session')
const hbsHelpers = require('../app/helper');

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
	secret: '123456cat',
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: false, 
		maxAge: 259199772 	
	}
}))
// app.use((req, res, next) => {
//     // app.locals.username = req.session.username || ""
//     app.locals.userid = req.session.userId || ""
//     next()
// })
app.use(flash())



app.use(userRouter)
app.use(ticketRouter)



app.listen(port ,() => {
	console.log('Server is up to port ' +port)
})