const { equal } = require('assert');
const { TransactionService } = require('../src/transaction.service');
const { Transaction, Account } = require('../src/models');

describe('Test simple transfer function', async () => {
    let idAccount1, idAccount2;

    beforeEach('Create accounts', async () => {
        const account1 = new Account({ name: 'teo', email: 'teo@gmail.com', balance: 200 });
        const account2 = new Account({ name: 'ti', email: 'ti@gmail.com', balance: 500 });
        await account1.save();
        await account2.save();
        idAccount1 = account1._id;
        idAccount2 = account2._id;
    });

    it('Can transfer money', async () => {
        await TransactionService.transfer(idAccount1, idAccount2, 100);
        const account1 = await Account.findById(idAccount1);
        const account2 = await Account.findById(idAccount2);
        equal(account1.balance, 100);
        equal(account2.balance, 600);
    });

    it('Cannot transfer 300$', async () => {
        const errorMessage = await TransactionService.transfer(idAccount1, idAccount2, 300).catch(error => error.message);
        equal(errorMessage, 'DO_NOT_ENOUGH_MONEY');
        const account1 = await Account.findById(idAccount1);
        const account2 = await Account.findById(idAccount2);
        equal(account1.balance, 200);
        equal(account2.balance, 500);
    });

    it('Cannot transfer negative amount', async () => {
        const errorMessage = await TransactionService.transfer(idAccount1, idAccount2, -300).catch(error => error.message);
        equal(errorMessage, 'INVALID_AMOUNT');
        const account1 = await Account.findById(idAccount1);
        const account2 = await Account.findById(idAccount2);
        equal(account1.balance, 200);
        equal(account2.balance, 500);
    });
});
