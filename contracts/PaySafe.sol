pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

///@title PaySafe
///@author suhailgme
///@notice this contract implements reversable transactions

contract PaySafe is Ownable {
    event LogNewTransaction(address indexed source, address indexed destination, uint value, uint transactionId);
    event LogWithdrawal(address indexed destination, uint value, uint transactionId);
    event LogCancelTransaction(address indexed source, address indexed destination, uint value, uint transactionId);
    mapping (uint => Transaction) public transactions;
    uint transactionId;
    bool public contractPaused = false;

    struct Transaction {
     address payable source;
     address payable destination;
     uint value;
     bytes data;
     bool complete;
     bool cancelled;
    }
    // @dev Fallback function allows to deposit ether.
    function() external payable { revert("Use newTransaction() to create payments");}
    
    /*
     * Admin functions
     */
    /// @dev If the contract is paused, stop the modified function
    modifier checkIfPaused() {
        require(contractPaused == false, "Contract has been paused");
        _;
    }
     /// @dev Allows administrator to pause certain functions
    function circuitBreaker() public onlyOwner {
        if (contractPaused == false) { contractPaused = true; }
        else { contractPaused = false; }
    }
    
    /*
    * Transaction state modifier
    */
    
    modifier notComplete(uint _transactionId){require(transactions[_transactionId].complete == false, "Transaction is already complete");_;}

    /*
     * Public functions
     */
    /// @dev Allows a user to submit a new transaction.
    /// @param _destination Transaction target address.
    /// @param _data Transaction data payload.
    /// @return Returns the transaction ID
    function newTransaction(
        address payable _destination,
        bytes memory _data
    )
        public
        payable
        checkIfPaused
        returns (uint _transactionId)
    {
        require(msg.value > 0, "Insufficient funds sent");
        require(_destination != msg.sender, "Cannot send to self");
        transactions[transactionId] = Transaction({
            source: msg.sender,
            destination: _destination,
            value: msg.value,
            data: _data,
            complete: false,
            cancelled: false
        });
        _transactionId = transactionId;
        transactionId +=1;
        emit LogNewTransaction(msg.sender, _destination, msg.value, _transactionId);
    }
    ///@dev this function gets the specified transaction object
    ///@notice THis function will retrieve the transaction with the id `_transactionId`
    ///@param _transactionId the ID of the transaction to retrieve
    ///@return Returns the source address
    ///@return Returns the destination address
    ///@return Returns the value sent
    ///@return Returns the data payload
    ///@return Returns true for a complete transaction, otherwise false
    function getTransaction(uint _transactionId) public view
    returns
    (
        address source,
        address destination,
        uint value,
        bytes memory data,
        bool complete,
        bool cancelled
    )
    {
        require(_transactionId < transactionId, "Invalid transaction ID");
        Transaction memory currentTransaction = transactions[_transactionId];
        return
        (
            currentTransaction.source,
            currentTransaction.destination,
            currentTransaction.value,
            currentTransaction.data,
            currentTransaction.complete,
            currentTransaction.cancelled
        );
    }
    ///@dev Allows withdrawl of funds by the destination (recipient) address only
    ///@notice Withdraw the funds sent to the destination address from transaction `_transactionId`
    ///@param _transactionId of the transaction to withdraw funds from
    function withdraw(uint _transactionId) public checkIfPaused notComplete(_transactionId){
        require(msg.sender == transactions[_transactionId].destination, "You are not the intended recipient");
        Transaction storage currentTransaction = transactions[_transactionId];
        currentTransaction.complete = true;
        currentTransaction.cancelled = false;
        currentTransaction.destination.transfer(currentTransaction.value);
        emit LogWithdrawal(currentTransaction.destination, currentTransaction.value, _transactionId);

    }
    ///@dev Allows the source (sender) to cancel a transaction if it has not yet ben accepted by the destination
    ///@dev if the circuit breaker has been tripped, only cancelTransaction will remain functional
    ///@notice Cancel a pending transaction with the ID `_transactionId` if you are the sender
    ///@param _transactionId of the transaction to be cancelled
    function cancelTransaction(uint _transactionId) public notComplete(_transactionId){
        require(msg.sender == transactions[_transactionId].source, "You are not the source");
        Transaction storage currentTransaction = transactions[_transactionId];
        currentTransaction.complete = true;
        currentTransaction.cancelled = true;
        currentTransaction.source.transfer(currentTransaction.value);
        emit LogCancelTransaction(currentTransaction.source, currentTransaction.destination, currentTransaction.value, _transactionId);
    }
}