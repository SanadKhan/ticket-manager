const express = require('express')
const router = new express.Router()
const auth  = require('../middleware/auth')
const Ticket = require('../models/ticket')
const User = require('../models/user')
const joi = require('joi')
const getTickets = require('../services/ticket')


const ticketValidation = joi.object({
    title: joi.string().min(5).max(30).required().trim(),
    description: joi.string().required().trim()
})

router.get('/list',  auth, async (req, res) => {

    try {
        const page = parseInt(req.query.p) || 1
        var populateQuery = [{path:'owner', select:'name'}, {path:'assignedto', select:'name'}]
        const { ticket, pagination } = await getTickets({populateQuery, page})
        res.render('ticket/list', { ticket , page_title: 'All Tickets', pagination, 
                                    active_list:true , userName: req.session.userName})
    } catch (error) {
        console.log('From Ticket List ' + error)
        req.flash('error', 'Something Went Wrong');
        return res.redirect('/list')
    }
})

router.get('/myassignedtickets', auth, async (req, res) => {

    try {
        const assignedto = req.session.userId
        const page = parseInt(req.query.p) || 1
        var populateQuery = { path: 'owner', select: 'name'}
        const { ticket, pagination } = await getTickets({populateQuery, page, whereClause: {assignedto} })
        res.render('ticket/myassignedtickets', { ticket , page_title: 'Tickets Assigned To Me', pagination, 
                        active_myassignedtickets:true , userName: req.session.userName})
    } catch (error) {
        console.log('From Ticket List ' + error)
        req.flash('error', 'Something Went Wrong');
        return res.redirect('/list')
    }
})

router.get('/mycreatedtickets', auth, async (req, res) => {

    try {
        const owner = req.session.userId
        const page = parseInt(req.query.p) || 1
        var populateQuery = { path: 'assignedto', select: 'name'}
        const { ticket, pagination } = await getTickets({populateQuery, page, whereClause: {owner} })
        res.render('ticket/mycreatedtickets', { ticket , page_title: 'My Created Tickets', pagination, 
                                            active_mycreatedtickets: true })
    } catch (error) {
        console.log('From My Created Ticket  ' + error)
        req.flash('error', 'Something Went Wrong');
        return res.redirect('/mycreatedtickets')
    }
})

router.get('/ticket/add', auth, async (req, res) => {
    const listUsers = await User.find({})
    res.render('ticket/add', {page_title: 'Add Ticket', listUsers})
})



router.post('/ticket/create',  auth, async(req, res) => {
   
    try {
    const {error, ticketValue} = ticketValidation.validate({ title: req.body.title, description: req.body.description}) 
        if(!error) {
            const owner = req.session.userId
            const ticket = new Ticket({ ...req.body, owner })
            await ticket.save()
            req.flash('success', 'Ticket Added Successfully')
            return res.redirect('/mycreatedtickets')
        } else {
            Object.keys(error.details).forEach((key) => {
                req.flash('error', error.details[key].message)
                return res.redirect('/ticket/add')
            })
        }  
    
    } catch (error) {
        console.log('From Add Ticket ' + error)
        req.flash('error', 'Something Went Wrong');
        return res.redirect('/ticket/add')
    }
})

router.get('/ticket/edit/:id', auth, async (req, res) => {
    const ticket = await Ticket.findOne({_id:req.params.id})
    const user = await User.find({ })
    res.render('ticket/edit', {page_title: 'Edit Ticket', ticket, user})
})

router.post('/ticket/update/:id', auth, async (req, res) => {
    const {error, ticketValue} = ticketValidation.validate({ title: req.body.title, description: req.body.description})

    try {
        if(!error) {
            const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body)
            if(!ticket) {
                req.flash('success', 'Updated Successfully!')
                return res.redirect('/mycreatedtickets')
            } else {
                req.flash('erorr', 'Failed to Update!')
                return res.redirect('/mycreatedtickets')
            }
        } else {
            Object.keys(error.details).forEach((key) => {
                req.flash('error', error.details[key].message)
                return res.redirect('/ticket/edit/'+req.params.id)
            })
        }  
         
    } catch (error) {
        console.log('From Update Ticket ' + error)
        req.flash('error', 'Something Went Wrong');
        return res.redirect('/mycreatedtickets')
    }
})   

router.post('/ticket/updatestatus/:id', auth, async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body)
        if(!ticket) {
            req.flash('success', 'Updated Successfully!')
            return res.redirect('/myassignedtickets')
        } else {
            req.flash('erorr', 'Failed to Update!')
            return res.redirect('/myassignedtickets')
        }  
    } catch (error) {
        console.log('From Update Status Ticket ' + error)
        req.flash('error', 'Something Went Wrong');
        return res.redirect('/myassignedtickets')
    }
})   

router.get('/ticket/delete/:id', auth, async (req, res) => {

    try {
        const ticket = await Ticket.findOneAndDelete({ _id: req.params.id })
        if(!ticket) {
            req.flash('error', "Failed to Delete!")
            return res.redirect('/mycreatedtickets')
        }
        req.flash('success', "Deleted Successfully!")
        return res.redirect('/mycreatedtickets')
    } catch (e) {
        console.log('From Delete Ticket ' + error)
        req.flash('error', 'Something Went Wrong');
        return res.redirect('/mycreatedtickets')
    }
})

module.exports = router