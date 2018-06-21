const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String },
    balance: { type: Number },
    pendingTransactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }]
});

const transactionSchema = new mongoose.Schema({
    source: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    status: { type: String }, // initial | pending | applied | done | cancelling | cancelled
    lastModified: { type: Date }
});

const Account = mongoose.model('Account', accountSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

class ServerError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

module.exports = { Account, Transaction, ServerError };
