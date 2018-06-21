const mongoose = require('mongoose');
const { ServerError } = require('./models');

function checkObjectId(...ids) {
    try {
        ids.forEach(id => new mongoose.Types.ObjectId(id.toString()));
    } catch (error) {
        throw new ServerError('INVALID_ID', 400);
    }
}

function exist(value, message, status) {
    if (!value) throw new ServerError(message, status);
}

module.exports = { checkObjectId, exist };
