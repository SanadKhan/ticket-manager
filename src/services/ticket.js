const Ticket = require('../models/ticket')
const ImageKit = require('imagekit')
const imageKit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
})

const getTickets = async ({populateQuery, page, whereClause={} }) => {
    try {
        const perPage = 10
        const ticket = await Ticket.find(whereClause)
            .populate(populateQuery)
            .sort({ _id: -1 }).skip(((perPage * page) - perPage))
            .limit(perPage)
        const ticketCount = await Ticket.find(whereClause).count()
        const pagination = { page, pageCount : Math.ceil(ticketCount/perPage)}
        return { ticket, pagination }
    } catch (error) {
        console.log('From Ticket Service ' + error)
        throw error
    }
}

const uploadFiles = async (allFile) => {
    try{
        let contents = await Promise.all(allFile.map((file) => {
            return imageKit.upload({
                file: file.buffer,
                fileName: file.originalname
            })
        }))
        let files = []
        for(const content of contents) {
            let { url , fileId } = content
            files.push({fileId, url})
        }
        return files
    } catch (error) {
        throw error
    }
        
}

const deleteFiles = async (files) => {
    try {
        return imageKit.bulkDeleteFiles(files)
    } catch (error) {
        throw error
    }
  
}


module.exports = { getTickets, uploadFiles, deleteFiles }


 // const modifiedUrl = imageKit.url({
//     src: url,
//     transformation: [
//         {
//             height: "600",
//             width: "600"
//         }
//     ]
// })