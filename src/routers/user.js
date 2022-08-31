const express = require('express')
const User = require('../models/user')
const joi = require('joi')
const bcrypt = require('bcryptjs')
const auth = require('../middleware/auth')
const router = new express.Router()
const io = require('../../app/socketio').getIO();
const { addUser, removeUser, getAllUsers } = require('../../utils/socketUsers');

const userRegisterValidation = joi.object({
        name: joi.string().min(3).max(30).required().trim(),
        email: joi.string().email({ minDomainSegments:2, tlds: {allow: ['com','in']}}).required().trim(),
        password: joi.string().min(6).max(16).required().trim()
})

const userLoginValidation = joi.object({
    email: joi.string().required(),
    password: joi.string().min(6).max(16).required()
})


router.get('',(req, res) => {

    // console.log("Socket Users ", getAllUsers() );
    res.render('index', {
        title: 'Ticket Manager'
    })
})

router.post('/user/login', async (req,res) => {

    try {
        const email = req.body.email
        const password =  req.body.password
        const {error, userLoginValue} = userLoginValidation.validate({ email, password})
        if(!error ) {
            const newUser = await User.findOne({ email })
            if(!newUser) {
                req.flash('error', 'Unable to Login!');
                return res.redirect('/')
            }
            const isMatch = await bcrypt.compare(password, newUser.password)
            if(!isMatch) {
                req.flash('error', 'Unable to Login!');
                return res.redirect('/')
            }

            if(req.session) {
                console.log('Session Connected');
                io.on('connection', (socket) => {
                    // console.log("Logged In ", socket.id);
                    const { error, user } = addUser({ id: socket.id, username: newUser.email});
                    // if(!error) {
                    //     console.log("From socket ", user);
                    // }
                    // socket.emit('join', {userEmail: user.email}); 
                });
                console.log(req.session);
                req.session.userId = newUser._id
                req.session.userName = newUser.name
                return res.redirect('/list')
            } else {
                console.log('Session Failed')
                req.flash('error', 'Session Failed!');
                return res.redirect('/')
            }
        } else {
            Object.keys(error.details).forEach((key) => {
                req.flash('error', error.details[key].message)
                return res.redirect('/')
            })
        } 
    } catch (error) {
        console.log('From Login ' ,error)
        req.flash('error', 'Something Went Wrong');
        return res.redirect('/')
    }
    
})

router.get('/register',(req, res) => {
    res.render('user/add', {
        title: 'Ticket Manager'
    })
})

router.post('/user/create', async (req, res) => {

    try {
    const {error, userRegisterValue} = userRegisterValidation.validate({ name: req.body.name, email: req.body.email,
        password: req.body.password })
        if(!error ) {
            const user =  new User(req.body)
            const emailExists = await User.findOne({email: req.body.email})
            if(!emailExists) {
                const newUser = await user.save()
                if(newUser) {
                    if(req.session) {
                        console.log('Session Connected')
                        req.session.userId = newUser._id
                        req.session.userName = newUser.name
                        return res.redirect('/list')
                    } else {
                        console.log('Session Failed')
                        req.flash('error', 'Session Failed To Load!');
                        return res.redirect('/register')
                    }
                } else {
                    req.flash('erorr', 'Failed To Create User')
                    return res.redirect('/register')
                }
            } else {
                req.flash('error','Email is already taken')
                return res.redirect('/register')
            }
        } else {
            Object.keys(error.details).forEach((key) => {
                req.flash('error', error.details[key].message)
                return res.redirect('/register')
            })
        }  
    } catch (error) {
        console.log('From Register' + error)
        req.flash('error', 'Something Went Wrong');
        return res.redirect('/register') 
    }
      
})

router.get('/logout', auth, async(req, res) => {
    try {
        const loggedUser = await User.findOne({_id: req.session.userId});
        removeUser(loggedUser.email);
        req.session.destroy();
        return res.redirect('/');
    } catch (error) {
        console.log('From Logout ' + error);
        req.flash('error', 'Something Went Wrong');
        return res.redirect('/list'); 
    }
});

module.exports = router