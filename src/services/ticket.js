const Ticket = require('../models/ticket')

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

module.exports = getTickets