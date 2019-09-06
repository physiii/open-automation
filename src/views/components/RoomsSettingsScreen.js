import React from 'react';
import PropTypes from 'prop-types';
import {Switch, Redirect} from 'react-router-dom';
import {Route, withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import RoomEditScreen from './RoomEditScreen.js';
import List from './List.js';
import Button from './Button.js';
import BlankState from './BlankState.js';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {arrayMove} from 'react-sortable-hoc';
import {sortRooms, deleteRoom} from '../../state/ducks/rooms-list/operations.js';
import {getRooms, hasInitialFetchCompleted, getRoomsError} from '../../state/ducks/rooms-list/selectors.js';

export class RoomsSettingsScreen extends React.Component {
	constructor (props) {
		super(props);

		this.handleEditClick = this.handleEditClick.bind(this);
		this.handleSort = this.handleSort.bind(this);
		this.handleDoneClick = this.handleDoneClick.bind(this);

		this.state = {isEditingList: false};
	}

	componentDidUpdate () {
		if (this.state.isEditingList && !this.props.rooms.length) {
			this.setState({isEditingList: false}); // eslint-disable-line react/no-did-update-set-state
		}
	}

	handleEditClick () {
		this.setState({isEditingList: true});
	}

	handleDeleteClick (room) {
		if (confirm('Do you want to delete ‘' + room.name + '’?')) {
			this.props.deleteRoom(room);
		}
	}

	handleSort ({oldIndex, newIndex}) {
		this.props.sortRooms(arrayMove(this.props.rooms.map((room) => room.id), oldIndex, newIndex));
	}

	handleDoneClick () {
		this.setState({isEditingList: false});
	}

	render () {
		return (
			<NavigationScreen
				title="Rooms"
				url={this.props.match.urlWithoutOptionalParams}
				toolbarActions={this.state.isEditingList
					? <Button onClick={this.handleDoneClick}>Done</Button>
					: <React.Fragment>
						{Boolean(this.props.rooms.length) && <Button onClick={this.handleEditClick}>Edit</Button>}
						<Button to={this.props.match.url + '/add'}>Add</Button>
					</React.Fragment>}
				toolbarBackAction={this.state.isEditingList
					? <React.Fragment />
					: null}>
				{this.props.error && <p>{this.props.error}</p>}
				{this.props.isLoading
					? <span>Loading</span>
					: <Switch>
						<Route exact path={this.props.match.url} render={() => (
							<React.Fragment>
								{!this.props.rooms.length &&
									<BlankState
										heading="No Rooms"
										body="Use the ‘Add’ button and rooms will show up here." />
								}
								<List isOrdered={true} isSortable={this.state.isEditingList} renderIfEmpty={false} onSortEnd={this.handleSort}>
									{this.props.rooms.map((room) => ({
										key: room.id,
										label: room.name,
										// TODO: Add devices count.
										link: this.state.isEditingList || room.isUnsaved ? '' : this.props.match.url + '/' + room.id,
										secondaryAction: this.state.isEditingList ? <Button onClick={() => this.handleDeleteClick(room)} disabled={room.isUnsaved}>Delete</Button> : null
									}))}
								</List>
							</React.Fragment>
						)} />
						<RoomEditScreen path={this.props.match.path + '/add'} isNew={true} />
						<RoomEditScreen path={this.props.match.path} />
						<Route render={() => <Redirect to={this.props.match.url} />} />
					</Switch>}
			</NavigationScreen>
		);
	}
}

RoomsSettingsScreen.propTypes = {
	rooms: PropTypes.array.isRequired,
	isLoading: PropTypes.bool,
	error: PropTypes.string,
	match: PropTypes.object.isRequired,
	sortRooms: PropTypes.func,
	deleteRoom: PropTypes.func
};

const mapStateToProps = ({roomsList}) => ({
		rooms: getRooms(roomsList),
		isLoading: !hasInitialFetchCompleted(roomsList),
		error: getRoomsError(roomsList)
	}),
	mapDispatchToProps = (dispatch) => ({
		sortRooms: (order) => dispatch(sortRooms(order)),
		deleteRoom: (room) => dispatch(deleteRoom(room))
	});

export default compose(
	withRoute(),
	connect(mapStateToProps, mapDispatchToProps)
)(RoomsSettingsScreen);
