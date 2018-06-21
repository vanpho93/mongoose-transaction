const { equal } = require('assert');
const { TransactionService } = require('../src/transaction.service');
const { Transaction, Account } = require('../src/models');

describe('Test simple transfer function', async () => {
    let idAccount1, idAccount2, idAccount3;

    beforeEach('Create accounts', async () => {
        const account1 = new Account({ name: 'teo', email: 'teo@gmail.com', balance: 200 });
        const account2 = new Account({ name: 'ti', email: 'ti@gmail.com', balance: 500 });
        const account3 = new Account({ name: 'ti', email: 'ti@gmail.com', balance: 500 }); //do not save this account
        await account1.save();
        await account2.save();
        idAccount1 = account1._id;
        idAccount2 = account2._id;
        idAccount3 = account3._id;
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

    it('Cannot transfer from unsaved account', async () => {
        const errorMessage = await TransactionService.transfer(idAccount3, idAccount2, 300).catch(error => error.message);
        equal(errorMessage, 'CANNOT_FIND_SOURCE_ACCOUNT');
        const account1 = await Account.findById(idAccount1);
        const account2 = await Account.findById(idAccount2);
        equal(account1.balance, 200);
        equal(account2.balance, 500);
    });

    it('Cannot transfer from unsaved account', async () => {
        const errorMessage = await TransactionService.transfer(idAccount3, idAccount2, 300).catch(error => error.message);
        equal(errorMessage, 'CANNOT_FIND_SOURCE_ACCOUNT');
        const account1 = await Account.findById(idAccount1);
        const account2 = await Account.findById(idAccount2);
        equal(account1.balance, 200);
        equal(account2.balance, 500);
    });

    it('Cannot transfer to unsaved account', async () => {
        const errorMessage = await TransactionService.transfer(idAccount1, idAccount3, 300).catch(error => error.message);
        equal(errorMessage, 'CANNOT_FIND_DESTINATION_ACCOUNT');
        const account1 = await Account.findById(idAccount1);
        const account2 = await Account.findById(idAccount2);
        equal(account1.balance, 200);
        equal(account2.balance, 500);
    });

    it.only('Strest test, 100 transfers at one time', (done) => {
        function create100Transfers() {
            const output = [];
            for(let i = 0; i < 3000; i++) {
                const transfer = TransactionService.transfer(idAccount1, idAccount2, 3).catch(error => null);
                output.push(transfer);
            }
            return output;
        }
        create100Transfers();
        setTimeout(async () => {
            const account1 = await Account.findById(idAccount1);
            const account2 = await Account.findById(idAccount2);
            console.log(account1.balance);
            console.log(account2.balance);
            done();
        }, 1000);
    });
});
