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

export class AutomationChooseServiceTriggerScreen extends React.Component {
	constructor (props) {
		super(props);

		this.handleEventClick = this.handleEventClick.bind(this);
		this.handleDeleteClick = this.handleDeleteClick.bind(this);
	}

	handleEventClick (event, service) {
		this.props.saveTrigger(
			{
				type: 'event',
				service_id: service.id,
				event
			},
			Number.parseInt(this.props.match.params.triggerIndex)
		);
	}

	handleDeleteClick () {
		this.props.deleteTrigger(Number.parseInt(this.props.match.params.triggerIndex));
	}

	render () {
		const device = this.props.device;

		if (!device || (!this.props.isNew && !(this.props.triggers && this.props.triggers.get(Number.parseInt(this.props.match.params.triggerIndex))))) {
			return <Redirect to={this.props.match.parentMatch.url} />;
		}

		return (
			<NavigationScreen
				title={(this.props.isNew ? 'Add' : 'Edit') + ' Trigger'}
				url={this.props.match.urlWithoutOptionalParams}
				toolbarActions={!this.props.isNew && <Button onClick={this.handleDeleteClick}>Delete</Button>}
				toolbarBackAction={{label: 'Back'}}>
				<SettingsScreenContainer withPadding={true}>
					{this.props.device.services.map((service) => {
						return (
							<section key={service.id}>
								<ServiceHeader service={service} isConnected={true} />
								<h2>Event Triggers</h2>
								{service.event_definitions.toArray().map(([event, definition]) => (
									<Button key={event} onClick={() => this.handleEventClick(event, service)}>
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

AutomationChooseServiceTriggerScreen.propTypes = {
	title: PropTypes.string,
	device: PropTypes.object.isRequired,
	triggers: PropTypes.object,
	isNew: PropTypes.bool,
	triggerIndex: PropTypes.number,
	saveTrigger: PropTypes.func.isRequired,
	deleteTrigger: PropTypes.func,
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
	withRoute({params: '/:deviceId/:triggerIndex?'}),
	connect(mapStateToProps)
)(AutomationChooseServiceTriggerScreen);
