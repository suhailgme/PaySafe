import React, { Component } from 'react'
import {
    Flex,
    Box,
    Card,
    Button,
    Icon,
    Heading,
    Text,
    Field,
    Input,
    Form,
} from 'rimble-ui'
export default class NewPayment extends Component {
    state = { ...this.props, amountValid: false, addressValid: false, comments: "0x0" }

    componentDidMount = async() => {
        // console.log(this.state)
    }

    handleSubmit = async (e) => {
        e.preventDefault()
        const account = this.state.account
        const amount = this.state.amount
        const address = this.state.address
        const balance = this.state.balance
        const web3 = this.state.web3
        const contract = this.state.contract
        const comments = this.state.comments
        // console.log(amount, address, balance, this.state)
        if (amount && address){
            this.setState({ amountValid: true, addressValid: true })
            const tx = await contract.methods.newTransaction(address, comments).send({ from: account, value: web3.utils.toWei(amount.toString(), 'ether')});
            await this.state.updateBalance()
            // console.log(tx)
        }
    }

    handleAmountValidation = (e) => {
        const balance = parseFloat(this.state.balance)
        const amount = parseFloat(e.target.value)
        // console.log(amount, balance)
        if (amount <= balance) {
            this.setState({ amount })
            e.target.parentNode.classList.add("was-validated")
        }else
            this.setState({ amount:null })

    }

    handleAddressValidation = (e) => {
        const address = e.target.value
        const web3 = this.state.web3
        // console.log(web3.utils.isAddress(address))
        if (web3.utils.isAddress(address)) {
            this.setState({ address })
            e.target.parentNode.classList.add("was-validated")
        } else
            this.setState({ address: null })
    }

    handleComments = (e) =>{
        const web3 = this.state.web3
        let comments = e.target.value
        if(comments){
           comments =  web3.utils.toHex(comments)
            this.setState({comments:comments})
        }
        else
            this.setState({comments:"0x0"})
    }

    render() {
        return (
            <Card width={'500px'} mx={'auto'}>
                <Text
                    caps
                    fontSize={1}
                    fontWeight={4}
                    mb={3}
                    display={"flex"}
                    alignItems={"center"}
                    style={{ background: '#3259D6', color: '#FFF', height: '50px', textAlign: 'center', paddingLeft: '20px' }}
                >
                    New ETH Payment
            </Text>
                <Form onSubmit={this.handleSubmit}>
                    <Form.Field label={"Amount* (ETH)"}>
                        <Form.Input
                            required
                            onChange={this.handleAmountValidation}
                            validated={this.state.amountValid}
                        />
                    </Form.Field>
                    <br />
                    <Form.Field label={"Address*"}>
                        <Form.Input
                            type={"text"}
                            required
                            onChange={this.handleAddressValidation}
                            validated={this.state.addressValid}

                        />
                    </Form.Field>
                    <Form.Field label={"Comments"}>
                        <Form.Input
                            type={"text"}
                            onChange={this.handleComments}
                        />
                    </Form.Field>
                    <Button icon="Send" variant="success" type="submit" width={1}>Send</Button>
                </Form>
            </Card>
        )

    }

}