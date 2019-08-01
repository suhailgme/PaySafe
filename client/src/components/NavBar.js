import React, { Component } from 'react'
import {
    Flex,
    Box,
    Heading,
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
                    <NetworkIndicator currentNetwork={this.props.networkId}
                        requiredNetwork={4} >{{
                            onNetworkMessage: "Connected to correct network",
                            onWrongNetworkMessage: "Wrong network, please switch to Rinkeby"
                        }}</NetworkIndicator>


                </Box>
            </Flex>

        )
    }
}