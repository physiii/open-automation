import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Redirect, Route, withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';
import {
  Button, TextField, List, ListItem, Paper, Input,
  ListItemText, ListItemSecondaryAction, Container, Typography,
} from '@mui/material';
import { doServiceAction, fetchDeviceLog } from '../../state/ducks/services-list/operations.js';
import { getServiceById } from '../../state/ducks/services-list/selectors.js';
import ServiceSettingsScreen from './ServiceSettingsScreen.js';
import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';

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
      users: [],
      userCount: null,
      uploadedFile: null
    };
  }

  componentDidMount() {
    this.props.doAction(this.props.service.id, {
      property: 'getUserCount',
      value: true,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const userCount = this.props.service.state.get('user_count') || null;
    if (userCount !== null && userCount !== this.state.userCount) {
      console.log(`User count: ${userCount}`);
      this.setState({ userCount, nextUserIndexToFetch: 1 }, () => this.getUserByCount(1));
    }


    const currentUser = this.props.service.state.get('user') || null;
    if (currentUser && currentUser !== prevProps.service.state.get('user')) {
      this.handleNewUser(currentUser);
    }
  }

  updateUserNames = (users) => {
    const nameCount = {};
    return users.map(user => {
      const originalName = user.name;
      nameCount[originalName] = (nameCount[originalName] || 0) + 1;
      return {
        ...user,
        name: nameCount[originalName] > 1 ? `${originalName} (${nameCount[originalName]})` : originalName
      };
    });
  };

  handleNewUser = (currentUser) => {
  
    this.setState(prevState => {
      const userExists = prevState.users.some(user => user && user.uuid === currentUser.uuid);
  
      if (!userExists) {
        const nextIndex = prevState.nextUserIndexToFetch + 1;
        
        // Moved this outside of setState
        if (nextIndex <= prevState.userCount) {
          this.getUserByCount(nextIndex);
        }
  
        return {
          users: this.updateUserNames([...prevState.users, currentUser]),
          nextUserIndexToFetch: nextIndex
        };
      }
  
      return prevState;
    }, () => {
      this.sortUsers();
    });
  };

  getUserByCount = (count) => {
    this.props.doAction(this.props.service.id, {
      property: 'getUserByCount',
      value: count,
    });
  };
  
  addUser = () => {
    const { newName, newPin } = this.state;
    if (newName && newPin.length === 6) {
      // Generate a new UUID
      const newUuid = uuidv4();
  
      // First, update the local state
      const newUser = { uuid: newUuid, name: newName, pin: newPin };
      this.setState(prevState => ({
        newName: '',
        newPin: '',
        users: this.updateUserNames([...prevState.users, newUser])
      }), () => {
        // The state is guaranteed to be updated here.
        this.sortUsers();
      });

      this.props.doAction(this.props.service.id, {
        property: 'addUser',
        value: {uuid: newUuid, name: newName, pin: newPin}
      });
      console.log(`Adding user ${newName} with pin ${newPin}`);
    }
    this.sortUsers();
  }  

  removeUser = (index) => {
    const { users } = this.state;
    
    if (users && index >= 0 && index < users.length) {
      const userToRemove = users[index].uuid;
    
      // Remove user from Redux store
      this.props.doAction(this.props.service.id, {
        property: 'removeUser',
        value: userToRemove
      });

      console.log(`Removing user ${userToRemove} from state`);
    
      // Remove user from local state
      const updatedUsers = users.filter((user, i) => i !== index);
      this.setState({ users: updatedUsers });
    
    } else {
      console.error(`Invalid index ${index} for users array.`);
    }
    this.sortUsers();
  }
  
  sortUsers = () => {
    this.setState(prevState => {
      const sortedUsers = [...prevState.users].sort((a, b) => {
        if (a && b && a.name && b.name) {
          return a.name.localeCompare(b.name, undefined, { numeric: true });
        }
      });
      return { users: sortedUsers };
    });
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
      const userToModify = users[editIndex];
      
      // First, update the local state
      const updatedUsers = [...users];
      updatedUsers[editIndex] = { ...userToModify, name: editName, pin: editPin };
      this.setState({
        users: updatedUsers,
        editIndex: null,
        editName: '',
        editPin: ''
      }, () => {
        // The state is guaranteed to be updated here.
        this.sortUsers();
      });
  
      // Then, update in Redux store
      this.props.doAction(this.props.service.id, {
        property: 'modifyUser',
        value: {
          uuid: userToModify.uuid,  // Send uuid to identify the user
          newName: editName,
          newPin: editPin
        }
      });
    } else {
      console.error(`Invalid index ${editIndex} for users array.`);
    }
  }
  
  handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        this.setState({ uploadedFile: file });
    }
  }

  processUploadedFile = () => {
    if (this.state.uploadedFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            this.parseAndAddUsers(content);
        };
        reader.readAsText(this.state.uploadedFile);
    }
  }

  parseAndAddUsers = (content) => {
    const lines = content.split("\n");
    let delayCounter = 0;  // Counter to track delay

    lines.forEach(line => {
        const matches = line.match(/"([^"]+)",(\d{6})/);
        if (matches) {
            const name = matches[1];
            const pin = matches[2];
            setTimeout(() => {
                this.setState(prevState => ({
                    newName: name,
                    newPin: pin
                }), () => {
                    this.addUser();
                });
            }, delayCounter * 2 * 1000);  // Delay by 1 second for each user

            delayCounter++;
        }
    });
  }

  render() {
    const { newName, newPin, editIndex, editName, editPin, users } = this.state;
    const alphaNumericSort = (a, b) => {
        if (a && b && a.name && b.name) {
            return a.name.localeCompare(b.name, undefined, { numeric: true });
        }
    };
    const sortedUsers = [...users].sort(alphaNumericSort);

    return (
        <Switch>
            <Route exact path={this.props.match.url} render={() => (
                <Container style={darkThemeStyles.container}>
                    <Typography variant="h6" style={{ color: darkThemeStyles.textField.color }}>Upload Users from File</Typography>
                    <div style={{ display: 'flex', marginBottom: '20px' }}>
                        <Input
                            type="file"
                            onChange={this.handleFileUpload}
                            style={{ marginRight: '10px' }}
                        />
                        <Button variant="contained" style={darkThemeStyles.buttonPrimary} onClick={this.processUploadedFile}>
                            Submit
                        </Button>
                    </div>

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
			service
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
  
