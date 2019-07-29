import React, { Component } from 'react'
import {
  Flex,
  Box,
  Blockie,
  Card,
  Icon,
  Text,
  PublicAddress,
  QR
} from 'rimble-ui'

export default class AccountInfo extends Component {
  render() {
    const {account, balance} = this.props
    return (
      <Card width={'500px'} height={'465px'} mx={'auto'}>
        <Flex bg='blue'>
          <Box pt={5} pl={4} width={1 / 2}>
            <Text p={0} fontWeight={4} fontSize={2} color='white'>Account Blockie</Text>
          </Box>
          <Box p={4} width={1 / 2}>
            <Blockie opts={{ size: 30, seed: account }} />
          </Box>
        </Flex>
        <Flex>
          <Box width={2 / 3} pt={4}>
            <PublicAddress address={account} label={'Your public address'}/>
          </Box>
          <Box width={1 / 3}>
            <QR style={{ width: '75%', height: '80%', paddingTop:'20px'}} value={account} />
          </Box>
        </Flex>
        <hr />
        <Text pt={1} fontWeight={3} fontSize={1} pb={1}>Balance:</Text>
        <Text>{balance} ETH</Text>
        <hr />
      </Card>
    )

  }

}