import React from 'react';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import CustomerDelete from './CustomerDelete';

class Customer extends React.Component {
    render() {
        return (
            <TableRow>
                <TableCell>{this.props.order}</TableCell>
                <TableCell>{this.props.name}</TableCell>
                <TableCell>{this.props.id}</TableCell>
                <TableCell>{this.props.gender}</TableCell>
                <TableCell>{this.props.address}</TableCell>
                <TableCell><CustomerDelete stateRefresh={this.props.stateRefresh} order={this.props.order}/></TableCell>
            </TableRow>
        )
    }
}

export default Customer;