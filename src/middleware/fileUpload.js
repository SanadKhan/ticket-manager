const multer = require('multer')

module.exports = (req, res, next) => {
    let fileUpload = multer({
        limits: {
            fileSize: 1 * 1024 * 1024
        }
    }).array('ticket_image',3)

    return fileUpload(req, res, err => {
        if(err instanceof multer.MulterError) {
            req.flash('error', err.message) // Multer error while uploading
            return res.redirect('/ticket/add')
        } else if (err) {
            req.flash('error', 'Unknown Error' +err.message) // Unknown  error while uploading
            return res.redirect('/ticket/add')
        } 
        next();
    });
}