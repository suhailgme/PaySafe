const PaySafe = artifacts.require("./PaySafe.sol");
const catchRevert = require('./exceptions').catchRevert
const BN = web3.utils.BN

contract("PaySafe", accounts => {
    const deployer = accounts[0]
    const firstAccount = accounts[1]
    const secondAccount = accounts[2]
    const thirdAccount = accounts[3]
    const fourthAccount = accounts[4]
    const zeroAddress = '0x0000000000000000000000000000000000000000'
    const oneEth = 1000000000000000000
    let instance

    beforeEach(async () => {
        instance = await PaySafe.new()
    })

    // Test the ownable.sol library for appropriate functionality
    describe("Contract Ownership", async () => {
        // Check that the deployed contract (PaySafe.sol) is owned by the correct, deploying address
        it("Contract owner should be set to deploying address", async () => {
            let owner = await instance.owner()
            assert.equal(deployer, owner, "Deploying address should be owner")
        })
        // Check that only the owner is able to transfer ownership. All other addresses
        // that attempt to transfer ownership should have the transaction reverted
        it("Only the Contract owner should be able to transfer ownership", async () => {
            await catchRevert(instance.transferOwnership(firstAccount, { from: secondAccount }))
        })
        // Check that the contract owner can successfully transfer the contract ownership to another address
        it("The Contract owner should be able to transfer ownership", async () => {
            await instance.transferOwnership(secondAccount)
            let newOwner = await instance.owner()
            assert.equal(secondAccount, newOwner, `${secondAccount} should be owner`)
        })
        // Check that the contract ownership can be renounced (sent to 0x0)
        it("The Contract owner should be able renounce ownership", async () => {
            await instance.renounceOwnership()
            let newOwner = await instance.owner()
            assert.equal(zeroAddress, newOwner, `${zeroAddress} should be owner`)
        })
    })

    // Tests for the circuitBreaker function of PaySafe.sol    
    describe("Circuit Breaker", async () => {
        it("Circuit breaker is only accessible by the contract owner", async () => {
            let owner = await instance.owner()
            let attacker = secondAccount
            assert.notEqual(attacker, owner, "Attacker should not be the owner")
            await catchRevert(instance.circuitBreaker({ from: attacker }))
        })
        it("Circuit breaker can be successfully enabled by the contract owner", async () => {
            let owner = await instance.owner()
            await instance.circuitBreaker({ from: owner })
            const paused = await instance.contractPaused()
            assert.equal(paused, true, "contractPaused should be true")
        })
        it("Circuit breaker does not allow new transactions to be created", async () => {
            let owner = await instance.owner()
            let sender = secondAccount
            let recipient = thirdAccount
            await instance.circuitBreaker({ from: owner })
            await catchRevert(instance.newTransaction(recipient, "0x0", { from: sender, value: oneEth }))
        })
    })

    // Tests for the newTransaction function of PaySafe.sol
    describe("New Transaction", async () => {
        // Check that a new transaction is successfully created and that the transaction Ids have been incremented
        // This ensures that transactions are not being overwritten
        it("Creates a new transaction", async () => {
            let firstTransactionId = await instance.newTransaction(secondAccount, "0x0", { from: firstAccount, value: oneEth })
            firstTransactionId = firstTransactionId.logs[0].args.transactionId.toString()
            let secondTransactionId = await instance.newTransaction(thirdAccount, "0x0", { from: firstAccount, value: oneEth })
            secondTransactionId = secondTransactionId.logs[0].args.transactionId.toString()
            assert.equal(firstTransactionId, 0, `transaction ID should be 0`)
            assert.equal(secondTransactionId, 1, `transaction ID should be 1`)

        })
        // Check that a transaction object contains the correct details as requested by the sender
        // This is test of the data integrity of the Transaction object
        it("Has the correct transaction details", async () => {
            let transactionId = await instance.newTransaction(secondAccount, "0x0", { from: firstAccount, value: oneEth })
            transactionId = transactionId.logs[0].args.transactionId.toString()
            let currentTransaction = await instance.getTransaction(transactionId)
            assert.equal(currentTransaction.source, firstAccount, `source should be${firstAccount}`)
            assert.equal(currentTransaction.destination, secondAccount, `destination should be ${secondAccount}`)
            assert.equal(currentTransaction.value.toString(), oneEth, `value should be ${oneEth}`)
        })
        // Checks that a transaction sent back to the same address does not send.
        // This is to ensure that the user does not mistakenly send needless transactions
        it("Does not allow a transaction to be sent to the sender", async () => {
            let sender = firstAccount
            await catchRevert(instance.newTransaction(sender, "0x0", { from: sender }))
        })
        // Checks to ensure that some value is being sent in each transaction.
        // This is to ensure that a user does not spend gas on a needless transaction
        it("Does not allow a transaction to be sent without some value", async () => {
            let sender = firstAccount
            let recipient = secondAccount
            await catchRevert(instance.newTransaction(recipient, "0x0", { from: sender, value:0 }))
        })
    })
    // Tests for the withdrawal function of PaySafe.sol
    describe("Withdraw", async () => {
        // Check that the intended recipient can withdraw funds as requested
        it("Allows the recipient to withdraw funds", async () => {
            let beforeBalance = await web3.eth.getBalance(thirdAccount)
            let transactionId = await instance.newTransaction(thirdAccount, "0x0", { from: firstAccount, value: oneEth })
            transactionId = transactionId.logs[0].args.transactionId.toString()
            await instance.withdraw(transactionId, { from: thirdAccount })
            let afterBalance = await web3.eth.getBalance(thirdAccount)
            assert.isAbove(parseInt(afterBalance), parseInt(beforeBalance), `Balance should be greater than 100ETH`)
        })
        // Checks that withdrawals are restricted to only the intended recipient
        // If an address attempts to withdraw the funds but is not the intended recipient, 
        // the transaction should fail
        it("Only the intended recipient can withdraw funds", async () => {
            let sender = firstAccount
            let recipient = secondAccount
            let attacker = thirdAccount
            let transactionId = await instance.newTransaction(recipient, "0x0", { from: sender, value: oneEth })
            transactionId = transactionId.logs[0].args.transactionId.toString()
            await catchRevert(instance.withdraw(transactionId, { from: attacker }))
        })
        // Checks that a recipient cannot withdraw from a transaction that has been cancelled
        // by the sender. In this case we expect to see a revert
        it("A recipient cannot withdraw from a cancelled transaction", async () => {
            let sender = firstAccount
            let recipient = secondAccount
            let transactionId = await instance.newTransaction(recipient, "0x0", { from: sender, value: oneEth })
            transactionId = transactionId.logs[0].args.transactionId.toString()
            await instance.cancelTransaction(transactionId, { from: sender })
            await catchRevert(instance.withdraw(transactionId, { from: recipient }))
        })
    })
    // Tests for the cancelTransaction function of PaySafe.sol
    describe("Cancel Transaction", async () => {
        // Check that the sender can successfully cancel a transaction that they have previously sent
        it("Allows the sender to cancel a transaction", async () => {
            let sender = firstAccount
            let recipient = secondAccount
            let transactionId = await instance.newTransaction(recipient, "0x0", { from: sender, value: oneEth })
            transactionId = transactionId.logs[0].args.transactionId.toString()
            let transaction = await instance.getTransaction(transactionId);
            let beforeTxStatus = transaction.cancelled
            await instance.cancelTransaction(transactionId, { from: sender })
            transaction = await instance.getTransaction(transactionId);
            let afterTxStatus = transaction.cancelled
            assert.equal(beforeTxStatus, false, "Transactions should not be cancelled by default")
            assert.equal(afterTxStatus, true, "Transactions should be cancellable by sender")
        })
        // Checks to ensure that an address not designated in the transaction object 
        // as "sender" is not able to cancel a transaction.
        it("A non-sender address cannot cancel a transaction", async () => {
            let sender = firstAccount
            let recipient = secondAccount
            let attacker = thirdAccount
            let transactionId = await instance.newTransaction(recipient, "0x0", { from: sender, value: oneEth })
            transactionId = transactionId.logs[0].args.transactionId.toString()
            await catchRevert(instance.cancelTransaction(transactionId, { from: attacker }))
        })
        // Checks that a transaction that has been cancelled and refunded to the sender cannot
        // be accepted by the recipient
        it("An accepted payment cannot be cancelled by the sender", async () => {
            let sender = firstAccount
            let recipient = secondAccount
            let transactionId = await instance.newTransaction(recipient, "0x0", { from: sender, value: oneEth })
            transactionId = transactionId.logs[0].args.transactionId.toString()
            await instance.withdraw(transactionId, { from: recipient })
            await catchRevert(instance.cancelTransaction(transactionId, { from: sender }))
        })
    })
})
