import React, { Component } from 'react'
import {
  Card,
  Text,
  Table,
  EthAddress,
  Pill
} from 'rimble-ui'

export default class Payments extends Component {
  state = {}
  render() {
    return (
      <Card width={'1000px'} mx={'auto'}>
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
            <th>Payment ID</th>
            <th>Time</th>
            <th>To</th>
            <th>From</th>
            <th>Type</th>
            <th>Value</th>
            <th>Status</th>
          </thead>
          <tbody>
            <tr>
              <td>0</td>
              <td>2 Minutes ago</td>
              <td><EthAddress address='0xAfc02C3b30fB4758006a18dBc51Bbfd32260C73F' truncate={true}/></td>
              <td><EthAddress address='0x187768e6a5b90eE0EEfd5e4Cd0Ed8d4C1523682f' truncate={true}/></td>
              <td>Outgoing</td>
              <td>1 ETH</td>
              <td><Pill color="primary">Pending</Pill></td>
            </tr>
          </tbody>
        </Table>
      </Card>
    )

  }

}