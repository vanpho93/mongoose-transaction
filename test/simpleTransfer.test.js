const { equal } = require('assert');
const { TransactionService } = require('../src/transaction.service');
const { Transaction, Account } = require('../src/models');

describe('Test simple transfer function', async () => {
    let idAccount1, idAccount2;

    beforeEach('Create accounts', async () => {
        const account1 = new Account({ name: 'teo', email: 'teo@gmail.com', balance: 1000 });
        const account2 = new Account({ name: 'ti', email: 'ti@gmail.com', balance: 2000 });
        await account1.save();
        await account2.save();
        idAccount1 = account1._id;
        idAccount2 = account2._id;
    });

    it('Can transfer money', async () => {

    });
});
