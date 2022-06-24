const express = require('express')
const User = require('../models/user')
const joi = require('joi')
const bcrypt = require('bcryptjs')
const auth = require('../middleware/auth')
const router = new express.Router()

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
            const user = await User.findOne({ email })
            if(!user) {
                req.flash('error', 'Unable to Login!');
                return res.redirect('/')
            }
            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch) {
                req.flash('error', 'Unable to Login!');
                return res.redirect('/')
            }
            userSession = req.session;
            if( userSession) {
                userSession.userId = user._id
                userSession.userName = user.name
            } else {
                userSession.userId = mongoose.Types.ObjectId('62b07919be9ffd50c52e4b6f')
                userSession.userName = 'Andrew'
            }
           
            return res.redirect('/list')
        } else {
            Object.keys(error.details).forEach((key) => {
                req.flash('error', error.details[key].message)
                return res.redirect('/')
            })
        } 
    } catch (error) {
        console.log('From Login ' + error)
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
                    userSession = req.session;
                    if( userSession) {
                        userSession.userId = newUser._id
                        userSession.userName = newUser.name
                    } else {
                        userSession.userId = mongoose.Types.ObjectId('62b07919be9ffd50c52e4b6f')
                        userSession.userName = 'Andrew'
                    }
                    return res.redirect('/list')
                } else {
                    req.flash('success', 'User created successfully!')
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
        req.flash('success', 'Successfully Logged Out!')
        req.session.destroy()
        return res.redirect('/')
    } catch (error) {
        console.log('From Logout ' + error)
        req.flash('error', 'Something Went Wrong');
        return res.redirect('/list') 
    }
})

// router.post('/user/logout-all', auth, async(req, res) => {
//     try {
//         req.user.tokens = []
//         await req.user.save()
//         res.send({ message: 'Logged Out All Sessions!'})
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })

// router.get('/users/profile', auth, async(req, res) => {
//     res.send(req.user)
// })



// router.patch('/user/update', auth, async (req, res) => {
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['name','email','password','age']
//     const isValidOperator = updates.every((update) => allowedUpdates.includes(update))

//     if(!isValidOperator) {
//         return res.status(404).send({ error : 'Invalid Updates'})
//     }
//     try {
//         updates.forEach((update) => req.user[update] = req.body[update])
//         await req.user.save()
//         res.send(req.user)
//     } catch (e) {
//         res.status(500).send(e)
//     }
    
// })

// router.delete('/user/delete', auth, async (req, res) => {

//     try {
//         await req.user.remove()
//         sendCancellationEmail(re.user.email, req.user.name)
//         res.send(req.user)
//     } catch (e) {
//         res.status(500).send(e)
//     }
// })

module.exports = router