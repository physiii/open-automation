import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Redirect, Route, withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Button, TextField, List, ListItem, ListItemText, ListItemSecondaryAction, Container, Typography } from '@mui/material';
import { doServiceAction, fetchDeviceLog } from '../../state/ducks/services-list/operations.js';
import { getDeviceLog, getServiceById } from '../../state/ducks/services-list/selectors.js';
import ServiceSettingsScreen from './ServiceSettingsScreen.js';
import { v4 as uuidv4 } from 'uuid';

const darkThemeStyles = {
  container: {
    backgroundColor: '#555555',
    color: '#CCCCCC',
  },
  textField: {
    color: '#CCCCCC',
    borderColor: '#555555',
  },
  buttonPrimary: {
    backgroundColor: '#3A3A3A',
    color: '#FFFFFF',
  },
  buttonSecondary: {
    backgroundColor: '#252525',
    color: '#FF5555',
  },
  listItem: {
    borderBottom: '1px solid #333333',
  },
};

class AccessControlServiceDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      logsReady: false,
      newName: '',
      newPin: '',
      editIndex: null,
      editName: '',
      editPin: '',
      users: []  // Initialize local state for users
    };
  }

  componentDidMount() {
    const initialUsers = this.props.service.state.get('users') || [];
    this.setState({ users: initialUsers });
  }

  componentDidUpdate(prevProps) {
	const prevUsers = prevProps.service.state.get('users') || [];
	const currentUsers = this.props.service.state.get('users') || [];
  
	if (JSON.stringify(prevUsers) === JSON.stringify(currentUsers)) return;
  
	const newUsers = currentUsers.filter(
	  currentUser => !prevUsers.some(prevUser => prevUser.name === currentUser.name)
	);

	const uniqueNewUsers = newUsers.filter(
	  newUser => !this.state.users.some(existingUser => existingUser.name === newUser.name)
	);
  
	if (uniqueNewUsers.length === 0) return;
  
	this.setState(prevState => ({
	  users: [...prevState.users, ...uniqueNewUsers]
	}));
  }
  
  addUser = () => {
    const { newName, newPin } = this.state;
    if (newName && newPin.length === 6) {
      // Generate a new UUID
      const newUuid = uuidv4();
  
      this.setState({ newName: '', newPin: '' });
      this.props.doAction(this.props.service.id, {
        property: 'addUser',
        value: {uuid: newUuid, name: newName, pin: newPin}
      });
    }
  }  

  removeUser = (index) => {
	const { users } = this.state;
  
	if (users && index >= 0 && index < users.length) {
	  const userNameToRemove = users[index].name;
  
	  // Remove user from Redux store
	  this.props.doAction(this.props.service.id, {
		property: 'removeUser',
		value: { name: userNameToRemove }
	  });
  
	  // Remove user from local state
	  const updatedUsers = users.filter((user, i) => i !== index);
	  this.setState({ users: updatedUsers });
  
	} else {
	  console.error(`Invalid index ${index} for users array.`);
	}
  }  

  startModifyUser = (index, name, pin) => {
    this.setState({
      editIndex: index,
      editName: name,
      editPin: pin
    });
  }

  saveModifyUser = () => {
	const { editIndex, editName, editPin, users } = this.state;
  
	if (users && editIndex >= 0 && editIndex < users.length) {
	  // First, update the local state
	  const updatedUsers = [...users];
	  updatedUsers[editIndex] = { name: editName, pin: editPin };
	  this.setState({
		users: updatedUsers,
		editIndex: null,
		editName: '',
		editPin: ''
	  });
  
	  // Then, update in Redux store
	  this.props.doAction(this.props.service.id, {
		property: 'modifyUser',
		value: {
		  name: users[editIndex].name,
		  newName: editName,
		  newPin: editPin
		}
	  });
	} else {
	  console.error(`Invalid index ${editIndex} for users array.`);
	}
  }

  render() {
	const { newName, newPin, editIndex, editName, editPin, users } = this.state;
	const alphaNumericSort = (a, b) => {
	  return a.name.localeCompare(b.name, undefined, { numeric: true });
	};
	const sortedUsers = [...users].sort(alphaNumericSort);
  
    return (
		<Switch>
		  <Route exact path={this.props.match.url} render={() => (
			<Container style={darkThemeStyles.container}>
			  <Typography variant="h6" style={{ color: darkThemeStyles.textField.color }}>Add New User</Typography>
            <div style={{ display: 'flex', marginBottom: '20px' }}>
              <TextField
                label="Name"
                variant="outlined"
                value={newName}
                onChange={e => this.setState({ newName: e.target.value })}
                style={{ ...darkThemeStyles.textField, marginRight: '10px' }}
              />
              <TextField
                label="6 Digit Pin"
                variant="outlined"
                value={newPin}
                onChange={e => this.setState({ newPin: e.target.value })}
                inputProps={{ maxLength: 6 }}
                style={{ ...darkThemeStyles.textField, marginRight: '10px' }}
              />
              <Button variant="contained" style={darkThemeStyles.buttonPrimary} onClick={this.addUser}>
                Add User
              </Button>
            </div>
            <Typography variant="h6" style={{ color: darkThemeStyles.textField.color }}>Current Users</Typography>
            <List>
              {sortedUsers.map((user, index) => (
                <ListItem key={index} style={darkThemeStyles.listItem}>
                  {editIndex === index ? (
                    <>
                      <TextField
                        label="Name"
                        variant="outlined"
                        value={editName}
                        onChange={e => this.setState({ editName: e.target.value })}
                        style={{ ...darkThemeStyles.textField, marginRight: '10px' }}
                      />
                      <TextField
                        label="6 Digit Pin"
                        variant="outlined"
                        value={editPin}
                        onChange={e => this.setState({ editPin: e.target.value })}
                        inputProps={{ maxLength: 6 }}
                        style={{ ...darkThemeStyles.textField, marginRight: '10px' }}
                      />
                      <Button variant="contained" style={darkThemeStyles.buttonPrimary} onClick={this.saveModifyUser}>
                        Save
                      </Button>
                    </>
                  ) : (
                    <>
                      <ListItemText primary={`${user.name} - ${user.pin}`} />
                      <ListItemSecondaryAction>
                        <Button style={darkThemeStyles.buttonSecondary} onClick={() => this.removeUser(index)}>
                          Remove
                        </Button>
                        <Button style={darkThemeStyles.buttonPrimary} onClick={() => this.startModifyUser(index, user.name, user.pin)}>
                          Modify
                        </Button>
                      </ListItemSecondaryAction>
                    </>
                  )}
                </ListItem>
              ))}
            </List>
          </Container>
        )} />
        <ServiceSettingsScreen service={this.props.service} path={this.props.match.path + AccessControlServiceDetails.settingsPath} />
        <Route render={() => <Redirect to={this.props.match.url} />} />
      </Switch>
    );
  }
}

AccessControlServiceDetails.settingsPath = '/service-settings';

AccessControlServiceDetails.propTypes = {
  service: PropTypes.object.isRequired,
  children: PropTypes.node,
  doAction: PropTypes.func,
  setHoldTemp: PropTypes.func,
  shouldShowSettingsButton: PropTypes.bool,
  shouldShowRoomField: PropTypes.bool,
  serviceType: PropTypes.string,
  match: PropTypes.object,
  logs: PropTypes.array.isRequired,
  fetchLog: PropTypes.func
};

AccessControlServiceDetails.defaultProps = {
	logs: [],
	fetchLog: () => { /* no-op */ }
};

const mapStateToProps = ({servicesList}, {match}) => {
		const service = getServiceById(servicesList, match.params.serviceId, false);

		return {
			service,
			logs: getDeviceLog(servicesList, service && service.id)
		};
	},
	mapDispatchToProps = (stateProps, {dispatch}, ownProps) => ({
		...ownProps,
		...stateProps,
		doAction: (serviceId, action) => dispatch(doServiceAction(serviceId, action)),
		fetchLog: (serviceId) => dispatch(fetchDeviceLog(serviceId))
	});

export default compose(
	withRouter,
	connect(mapStateToProps, null, mapDispatchToProps)
)(AccessControlServiceDetails);
  
