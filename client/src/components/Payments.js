import React, { Component } from 'react'
import {
  Card,
  Text,
  Table,
  EthAddress,
  Pill,
  Button,
} from 'rimble-ui'
import { async } from 'q';

export default class Payments extends Component {
  state = { ...this.props }

  componentDidMount = async () => {
    if (this.props.web3)
      this.getEvents()
  }
  // Retrieve all new transaction events associated with either the source or destination
  // Store them in a state var (transactions) for easy parsing later
  getEvents = async () => {
    let transactions = []
    const account = this.state.account
    const contract = this.state.contract
    const web3 = this.state.web3

    contract.events.allEvents({
      fromBlock: 0
    }, async (error, event) => {
      const currentTransaction = event.returnValues
      const eventName = event.event
      if ((account === currentTransaction.source ||
        account === currentTransaction.destination) &&
        eventName === 'LogNewTransaction'
      ) {
        const transactionId = currentTransaction.transactionId
        const tx = await contract.methods.getTransaction(transactionId).call()
        transactions.push({
          paymentId: transactionId,
          to: tx.destination,
          from: tx.source,
          value: web3.utils.fromWei(tx.value),
          complete: tx.complete,
          cancelled: tx.cancelled
        })

      }
      this.setState({ transactions })
    })
  }

  handleActionButton = async (e) => {
    const transactionId = parseInt(e.target.value)
    const transactions = this.state.transactions
    const account = this.state.account
    const contract = this.state.contract
    const transaction = transactions.find(transaction => {
      return transaction.paymentId === transactionId.toString()
    })
    const amount = transaction.value
    if (transaction.to === account) {
      window.toastProvider.addMessage("Payment pending", { variant: 'default', colorTheme: 'light', secondaryMessage: "Confirm in MetaMask" })
      await contract.methods.withdraw(transactionId)
        .send({ from: account })
        .on("transactionHash", hash => {
          window.toastProvider.addMessage(`Processing ${amount} ETH Payment`, { variant: 'processing', colorTheme: 'light', })
        })
        .on("confirmation", confirmation => {
          if (confirmation === 0)
            window.toastProvider.addMessage(`Successfully received ${amount} ETH!`, { variant: 'success', colorTheme: 'light', })
        })
        .on("error", error => {
          window.toastProvider.addMessage(`Error claiming payment!`, { variant: 'failure', colorTheme: 'light', })
        });
    }
    if (transaction.from === account) {
      window.toastProvider.addMessage("Cancellation pending", { variant: 'default', colorTheme: 'light', secondaryMessage: "Confirm in MetaMask" })
      await contract.methods.cancelTransaction(transactionId)
        .send({ from: account })
        .on("transactionHash", hash => {
          window.toastProvider.addMessage(`Cancelling ${amount} ETH Payment`, { variant: 'processing', colorTheme: 'light', })
        })
        .on("confirmation", confirmation => {
          if (confirmation === 0)
            window.toastProvider.addMessage(`Successfully cancelled payment for ${amount} ETH`, { variant: 'success', colorTheme: 'light', })
        })
        .on("error", error => {
          // Errored out
          window.toastProvider.addMessage(`Error cancelling payment!`, { variant: 'failure', colorTheme: 'light', })
        });
    }
    this.state.updateBalance()
    await this.getEvents();
  }

  render() {
    const transactions = this.state.transactions
    return (
      <Card width={'1065px'} mx={'auto'}>
        <Text
          caps
          fontSize={1}
          fontWeight={4}
          mb={3}
          display={"flex"}
          alignItems={"center"}
          style={{ background: '#3259D6', color: '#FFF', height: '50px', textAlign: 'center', paddingLeft: '20px' }}
        >
          Payments
        </Text>
        <Table >
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>To</th>
              <th>From</th>
              <th>Type</th>
              <th>Value</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          {/* If transactions associated with the current account are present,
            * render them in the table */}
          {transactions ? transactions.map((transaction, index) => (
            <tbody key={index}>
              <tr>
                <td >{transaction.paymentId}</td>
                <td><a target='_blank' href={`https://rinkeby.etherscan.io/address//${transaction.to}`}><EthAddress address={transaction.to} truncate={true} /></a></td>
                <td><a target='_blank' href={`https://rinkeby.etherscan.io/address//${transaction.from}`}><EthAddress address={transaction.from} truncate={true} /></a></td>
                <td><Text fontWeight={0} color={this.state.account === transaction.to ? 'green' : 'red'}>{this.state.account === transaction.to ? 'Incoming' : 'Outgoing'}</Text></td>
                <td>{transaction.value} ETH</td>
                <td><Pill color={transaction.cancelled ? 'red' : transaction.complete ? 'green' : 'primary'}>{transaction.cancelled ? 'Cancelled' : transaction.complete ? 'Complete' : 'Pending'}</Pill></td>
                <td>{transaction.complete ? <Button disabled value={transaction.paymentId} onClick={this.handleActionButton} size={'small'} variant={this.state.account === transaction.to ? "success" : "danger"}>{this.state.account === transaction.to ? 'Claim' : 'Cancel'}</Button> : <Button value={transaction.paymentId} onClick={this.handleActionButton} size={'small'} variant={this.state.account === transaction.to ? "success" : "danger"}>{this.state.account === transaction.to ? 'Claim' : 'Cancel'}</Button>}</td>
              </tr>
            </tbody>
          )) : null}
          {/* {this.renderTableBody()} */}
        </Table>
      </Card>
    )

  }

}