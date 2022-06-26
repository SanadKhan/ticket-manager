const auth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        req.flash('error','Authorization Failed! Please Login')
            return res.redirect('/')
    }
}

module.exports = auth