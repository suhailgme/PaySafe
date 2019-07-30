import React, { Component } from 'react'
import {
    Flex,
    Box,
    Heading
} from 'rimble-ui'
import NetworkIndicator from '@rimble/network-indicator'

export default class NavBar extends Component {
    render() {
        return (
            <Flex p={3} className='navbar'>
                <Box p={2} width={1 / 2}>
                    <Heading color={'blue'}>PaySafe</Heading>
                </Box>
                <Box width={1 / 2}>
                    {this.props.networkId === 5777 ?
                        <NetworkIndicator currentNetwork={this.props.networkId} requiredNetwork={5777} /> :
                        <NetworkIndicator currentNetwork={this.props.networkId} requiredNetwork={4} />
                    }
                    {/* <Text fontSize={1} fontWeight={4}>Account: {this.state.accounts}</Text> */}
                </Box>
            </Flex>
        )
    }
}