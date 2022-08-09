const express = require('express')
const router = new express.Router()
const auth  = require('../middleware/auth')
const fileUpload =  require('../middleware/fileUpload')
const Ticket = require('../models/ticket')
const User = require('../models/user')
const joi = require('joi')
const getTickets = require('../services/ticket')
const ImageKit = require('imagekit')

const ticketValidation = joi.object({
    title: joi.string().min(5).max(30).required().trim(),
    description: joi.string().required().trim()
})

const imageKit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
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
const multer = require('multer')

const uploads = multer({
    limits: {
        fileSize: 1 * 1024 * 1024
    }
}).array('ticket_image',2   )
router.post('/ticket/create',  auth, (req, res) => {
    uploads(req, res, async(err) => {
        if(err instanceof multer.MulterError) {
            if(err.message == 'Unexpected field'){
                req.flash('error', `Maximum 2 file uploads`) // Multer error while uploading
                return res.redirect('/ticket/add')
            }
            req.flash('error', `Multer Err ${err.message}`) // Multer error while uploading
            return res.redirect('/ticket/add')
           
        } else if (err) {
            req.flash('error', `Unknown Error ${err.message}`) // Unknown  error while uploading
            return res.redirect('/ticket/add')
        } else {
            try {
                const {error, ticketValue} = ticketValidation.validate({ title: req.body.title, description: req.body.description})  
                if(!error) {
                    // const btnUpload = document.getElementById('btnUpload')
                    // btnUpload.disabled = true 
                    
                    let contents = await Promise.all(req.files.map((file) => {
                        return imageKit.upload({
                            file: file.buffer,
                            fileName: file.originalname
                        })
                    }))
                    let fileIds = [], urls = [], modifiedUrls = [] 
                    for(const content of contents) {
                        console.log(content.fileId)
                        let { url , fileId } = content
                        const modifiedUrl = imageKit.url({
                            src: url,
                            transformation: [
                                {
                                    height: "600",
                                    width: "600"
                                }
                            ]
                        })
                        fileIds.push(fileId)
                        urls.push(url)
                        modifiedUrls.push(modifiedUrl)
                    }
                    const owner = req.session.userId
                    req.body.fileId = fileIds
                    req.body.urls = urls
                    req.body.modifiedUrls = modifiedUrls
                    console.log(req.body)
                    // const ticket = new Ticket({ ...req.body, owner })
                    // await ticket.save()
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
        }
    })
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

router.get('/ticket/view/:id', auth, async (req, res) => {
    var populateQuery = [{path:'owner', select:'name'}, {path:'assignedto', select:'name'}]
    const ticket = await Ticket.findOne({_id:req.params.id})
                                .populate(populateQuery)
                                console.log(ticket)
    res.render('ticket/view', {page_title: 'Ticket Details', ticket})
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