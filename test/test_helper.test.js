require('../src/connectDatabase');
const { Transaction, Account } = require('../src/models');

beforeEach('Remove all data for test', async () => {
    await Transaction.remove({});
    await Account.remove({});
});
