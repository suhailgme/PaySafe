## Design Pattern Decisions

### Restricted Access
* Only the owner of the contract may transfer ownership
* Only the source and recipient of the transaction may cancel or claim the funds

### Circuit Breaker
* If a bug is discovered, a circuit breaker is used by the contract owner to prevent the creation of new transactions
* After a contract audit/confidence that the contract is reliable, ownership can be renounced (sent to 0x0) such that the circuit breaker is non-functional

### Events and Logs
* All changes to the contract state are logged via events
* Events include source/destination/value elements

### Withdrawal pattern / Pull Instead of Push Payments
* Contract accounting logic and transfer logic are separate
* Withdrawals must be initiated by the recipient of the funds. Funds are not pushed to the reciever's account
* Withdrawal pattern also applies to cancellation of transfer by sender (must be initiated)

### Faily early and fail loud
* Conditions are checked at the beginning of each public function and a revert is thrown if conditions are not met
* Contract methods will fail loudly (no silent errors) with verbose error messages provided to the dev/user
