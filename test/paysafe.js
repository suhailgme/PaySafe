const PaySafe = artifacts.require("./PaySafe.sol");
const catchRevert = require('./exceptions').catchRevert
const BN = web3.utils.BN

contract("PaySafe", accounts => {
    const deployer = accounts[0]
    const firstAccount = accounts[1]
    const secondAccount = accounts[2]
    const thirdAccount = accounts[3]
    const fourthAccount = accounts[4]
    const oneEth = 1000000000000000000
    let instance

    beforeEach(async () => {
        instance = await PaySafe.new()
    })
    console.log(`Deployer account: ${deployer}`)
    console.log(`firstAccount account: ${firstAccount}`)
    console.log(`secondAccount account: ${secondAccount}`)
    console.log(`thirdAccount account: ${thirdAccount}`)

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
            await instance.transferOwnership(firstAccount)
            let newOwner = await instance.owner()
            assert.equal(firstAccount, newOwner, `${firstAccount} should be owner`)
        })
    })

    // Tests for the new transaction function of PaySafe.sol
    describe("New Transaction", async () => {
        // Check that a 
        it("Creates a new transaction", async () => {
            let firstTransactionId = await instance.newTransaction(secondAccount, "0x0", { from: firstAccount, value: oneEth })
            firstTransactionId = firstTransactionId.logs[0].args.transactionId.toString()
            let secondTransactionId = await instance.newTransaction(thirdAccount, "0x0", { from: firstAccount, value: oneEth })
            secondTransactionId = secondTransactionId.logs[0].args.transactionId.toString()
            assert.equal(firstTransactionId, 0, `transaction ID should be 0`)
            assert.equal(secondTransactionId, 1, `transaction ID should be 1`)

        })
        it("Has the correct transaction details", async () => {
            let transactionId = await instance.newTransaction(secondAccount, "0x0", { from: firstAccount, value: oneEth })
            transactionId = transactionId.logs[0].args.transactionId.toString()
            let currentTransaction = await instance.getTransaction(transactionId)
            assert.equal(currentTransaction.source, firstAccount, `source should be${firstAccount}`)
            assert.equal(currentTransaction.destination, secondAccount, `destination should be ${secondAccount}`)
            assert.equal(currentTransaction.value.toString(), oneEth, `value should be ${oneEth}`)
        })
    })
    describe("Withdraw", async () => {
        it("Allows the recipient to withdraw funds", async () => {
            let beforeBalance = await web3.eth.getBalance(thirdAccount)
            let transactionId = await instance.newTransaction(thirdAccount, "0x0", { from: firstAccount, value: oneEth })
            transactionId = transactionId.logs[0].args.transactionId.toString()
            await instance.withdraw(transactionId, {from: thirdAccount})
            let afterBalance = await web3.eth.getBalance(thirdAccount)
            assert.isAbove(parseInt(afterBalance),parseInt(beforeBalance) , `Balance should be greater than 100ETH`)
        })
    })
})
