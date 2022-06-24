const auth = (req, res, next) => {
   
    console.log('from session ' + req.session.userId)
    if (req.session.userId) {
        next();
    } else {
        req.flash('error','Authorization Failed! Please Login')
            return res.redirect('/')
    }
}

module.exports = auth