import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {Redirect} from 'react-router-dom';
import {withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import SettingsScreenContainer from './SettingsScreenContainer.js';
import ServiceHeader from './ServiceHeader.js';
import Button from './Button.js';
import {getDeviceById} from '../../state/ducks/devices-list/selectors.js';
import {getServiceById} from '../../state/ducks/services-list/selectors.js';

export class AutomationChooseServiceActionScreen extends React.Component {
	constructor (props) {
		super(props);

		this.handleActionClick = this.handleActionClick.bind(this);
		this.handleDeleteClick = this.handleDeleteClick.bind(this);
	}

	handleActionClick (action, service) {
		this.props.saveAction(
			{
				type: 'action',
				service_id: service.id,
				action
			},
			Number.parseInt(this.props.match.params.actionIndex)
		);
	}

	handleDeleteClick () {
		this.props.deleteAction(Number.parseInt(this.props.match.params.actionIndex));
	}

	render () {
		const device = this.props.device;

		if (!device || (!this.props.isNew && !(this.props.actions && this.props.actions.get(Number.parseInt(this.props.match.params.actionIndex))))) {
			return <Redirect to={this.props.match.parentMatch.url} />;
		}

		return (
			<NavigationScreen
				title={(this.props.isNew ? 'Add' : 'Edit') + ' Action'}
				url={this.props.match.urlWithoutOptionalParams}
				toolbarActions={!this.props.isNew && <Button onClick={this.handleDeleteClick}>Delete</Button>}
				toolbarBackAction={{label: 'Back'}}>
				<SettingsScreenContainer withPadding={true}>
					{this.props.device.services.map((service) => {
						return (
							<section key={service.id}>
								<ServiceHeader service={service} isConnected={true} />
								<h2>Actions</h2>
								{service.action_definitions.map(([action, definition]) => (
									<Button key={action} onClick={() => this.handleActionClick(action, service)}>
										{definition.label}
									</Button>
								))}
							</section>
						);
					})}
				</SettingsScreenContainer>
			</NavigationScreen>
		);
	}
}

AutomationChooseServiceActionScreen.propTypes = {
	title: PropTypes.string,
	device: PropTypes.object,
	actions: PropTypes.object,
	isNew: PropTypes.bool,
	actionIndex: PropTypes.number,
	saveAction: PropTypes.func.isRequired,
	deleteAction: PropTypes.func,
	match: PropTypes.object.isRequired
};

const mapStateToProps = ({devicesList, servicesList}, {match}) => {
	const device = getDeviceById(devicesList, match.params.deviceId);

	if (!device) {
		return {};
	}

	return {
		device: {
			...device,
			// Hydrate services.
			services: device.services.map(({id}) => getServiceById(servicesList, id, false))
		}
	};
};

export default compose(
	withRoute({params: '/:deviceId/:actionIndex?'}),
	connect(mapStateToProps)
)(AutomationChooseServiceActionScreen);
