import React, { Component } from "react";
import PaySafeContract from "./contracts/PaySafe.json";
import getWeb3 from "./utils/getWeb3";
import NavBar from './components/NavBar'
import NewPayment from './components/NewPayment'
import AccountInfo from './components/AccountInfo'
import Payments from './components/Payments'
import {
  Flex,
  Box,
} from 'rimble-ui'
import "./App.css";
import { async } from "q";

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = PaySafeContract.networks[networkId];
      const instance = new web3.eth.Contract(
        PaySafeContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      let balance = await web3.eth.getBalance(accounts[0])
      balance = web3.utils.fromWei(balance, 'ether')

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, networkId, balance, contract: instance, deployedNetwork, });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  updateBalance = async () => {
    const web3 = this.state.web3
    const account = this.state.accounts[0]
    let balance = await web3.eth.getBalance(account)
    balance = web3.utils.fromWei(balance, 'ether')
    this.setState({ balance })
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    } else {
      const { accounts, balance, networkId } = this.state
      return (
        <div className="App">
          <NavBar networkId={networkId} />
          <Flex style={{ paddingTop: '50px' }} flexWrap='wrap'>
            <Box width={[1, 1, 0.5]} >
              <NewPayment
                account={accounts[0]}
                web3={this.state.web3}
                contract={this.state.contract}
                balance={balance}
                updateBalance={this.updateBalance}
              />
            </Box>
            <Box width={[1, 1, 0.5]} >
              <AccountInfo account={accounts[0]} balance={balance} />
            </Box>
          </Flex>
          <Flex pt={4}>
            <Payments
              account={accounts[0]}
              web3={this.state.web3}
              contract={this.state.contract}
              updateBalance={this.updateBalance}
            />
          </Flex>

        </div>
      )
    }


  }
}

export default App;
