const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser: true
})
// console.log(mongoose.STATES[mongoose.connection.readyState]);
// console.log(process.env.MONGODB_URL)





