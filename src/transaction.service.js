const { Transaction, Account, ServerError } = require('./models');
const { exist, checkObjectId } = require('./helpers');

class TransactionService {
    static async validateTransferInput(source, destination, amount) {
        if (typeof amount !== 'number' || amount <= 1) {
            throw new ServerError('INVALID_AMOUNT', 400);
        }
        checkObjectId(source, destination);
        const s = await Account.findById(source);
        exist(s, 'CANNOT_FIND_SOURCE_ACCOUNT', 404);
        if (s.pendingTransactions.length > 0) {
            throw new ServerError('BUSY_ACCOUNT', 429);
        }
        const d = await Account.findById(destination);
        exist(d, 'CANNOT_FIND_DESTINATION_ACCOUNT', 404);
        if (d.pendingTransactions.length > 0) {
            throw new ServerError('BUSY_ACCOUNT', 429);
        }
    }

    static async transfer(source, destination, amount) {
        await TransactionService.validateTransferInput(source, destination, amount);
        const queryObject = { _id: source, balance: { $gt: amount } };
        const updateObject = { $inc: { balance: -amount } };
        const sourceAccount = await Account.findOneAndUpdate(queryObject, updateObject);
        exist(sourceAccount, 'DO_NOT_ENOUGH_MONEY', 429);
        await Account.findByIdAndUpdate(destination, { $inc: { balance: amount } });
        const transaction = new Transaction({ source, destination, status: 'done', lastModified: new Date() });
        await transaction.save();
        return transaction;
    }

    static async safeTransfer(source, destination, amount) {
        await TransactionService.validateTransferInput(source, destination, amount);
        const transaction = await Transaction({ source, destination, lastModified: new Date(), state: 'pending', amount });
        const sourceAccount1 = await Account.findOneAndUpdate(
            {
                _id: source,
                pendingTransactions: { $size: 0 },
                balance: { $gt: amount }
            },
            {
                $inc: { balance: -amount },
                $push: { pendingTransactions: transaction._id }
            }
        );
        exist(sourceAccount1, 'DO_NOT_ENOUGH_MONEY', 429);
        const destinationAccount1 = await Account.findOneAndUpdate(
            {
                _id: destination,
                pendingTransactions: { $size: 0 }
            },
            {
                $inc: { balance: amount },
                $push: { pendingTransactions: transaction._id }
            }
        );
        await Transaction.findByIdAndUpdate(transaction._id, { state: 'applied', lastModified: new Date() });
        await Account.findOneAndUpdate(
            { _id: source, pendingTransactions: transaction._id },
            { $pull: { pendingTransactions: transaction._id } }
        );
        await Account.findOneAndUpdate(
            { _id: destination, pendingTransactions: transaction._id },
            { $pull: { pendingTransactions: transaction._id } }
        );
        const transactionAtTheEnd = await Transaction.findByIdAndUpdate(transaction._id, { state: 'done', lastModified: new Date() }, { new: true });
        return transactionAtTheEnd;
    }
}

module.exports = { TransactionService };
