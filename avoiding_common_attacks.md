
## Avoiding Common Attacks

### Re-entrancy
* PaySafe uses the withdrawal pattern requiring recipients to initiate each withdrawal. 
* In addition, senders who wish to cancel transactions that have not yet been claimed must initiate the transaction
* All internal changes to state (i.e marking transactions as cancelled or complete) are done prior to any transfer() call

### Integer Overflow/Underflow
* PaySafe does not rely on any user input integer data. Only ether values sent from a wallet are used.
* `transactionId` is incremented by one for each new transaction, and it is infeasible that this value will ever approach the maximum value for a uint256.

### Denial of Service
* The withdrawal pattern (Pull instead of push) is used to prevent DoS attacks for users withdrawing or cancelling a transaction
* In addition, if a recipient address is a contract with a reverting payable fallback function, the transaction can be cancelled and the funds
refunded to the sender

### Denial of Service by Block Gas Limit (or startGas)
* No loops (or arrays) are used in PaySafe. Transactions are mapped via a uint `transactionId`

### Force Sending Ether
* A fallback function which explicitly reverts with a verbose error message is included to prevent Ether being inadvertently or purposely sent to any other function than a payable one. This is done for accounting purposes and to prevent the requirement for additional state and withdrawal functions for funds not associated with a `Transaction` object.
