const { Transaction, Account, ServerError } = require('./models');
const { exist, checkObjectId } = require('./helpers');

class TransactionService {
    static async transfer(source, destination, amount) {
        if (typeof amount !== 'number' || amount <= 1) {
            throw new ServerError('INVALID_AMOUNT', 400);
        }
        checkObjectId(source, destination);
        const s = await Account.findById(source);
        exist(s, 'CANNOT_FIND_SOURCE_ACCOUNT', 404);
        const d = await Account.findById(destination);
        exist(d, 'CANNOT_FIND_DESTINATION_ACCOUNT', 404);
        const queryObject = { _id: source, balance: { $gt: amount } };
        const updateObject = { $inc: { balance: -amount } };
        const sourceAccount = await Account.findOneAndUpdate(queryObject, updateObject);
        exist(sourceAccount, 'DO_NOT_ENOUGH_MONEY', 429);
        const desinationAccount = await Account.findByIdAndUpdate(destination, { $inc: { balance: amount } });
        const transaction = new Transaction({ source, destination, status: 'done', lastModified: new Date() });
        await transaction.save();
        return transaction;
    }
}

module.exports = { TransactionService };
