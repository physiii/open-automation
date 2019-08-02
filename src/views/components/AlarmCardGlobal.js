import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {doServiceAction} from '../../state/ducks/services-list/operations.js';
import ServiceCardBase from './ServiceCardBase.js';
import Switch from './Switch.js';
import './AlarmCardGlobal.css';

export class GlobalAlarmCard extends React.Component {
	constructor (props) {
		super(props);

		this.toggleMode = this.toggleMode.bind(this);
	}

	toggleMode () {
		this.props.doAction(this.props.service.id, {
			property: 'mode',
			value: this.props.service.state.get('mode') > 0 ? 0 : 1
		});
	}

	render () {
		return (
			<ServiceCardBase
				name={this.props.service.settings.get('name') || 'Global Alarm'}
				status={this.props.service.state.get('mode') > 0
					? 'Armed'
					: 'Disarmed'}
				isConnected={true}
				onCardClick={this.toggleMode}
				{...this.props}>
				<div styleName="container">
					<Switch
						isOn={this.props.service.state.get('mode') > 0}
						showLabels={true}
						onLabel="Armed"
						offLabel="Disarmed" />
				</div>
			</ServiceCardBase>
		);
	}
}

GlobalAlarmCard.propTypes = {
	service: PropTypes.object,
	doAction: PropTypes.func
};

const mergeProps = (stateProps, {dispatch}, ownProps) => ({
	...ownProps,
	...stateProps,
	doAction: (serviceId, action) => dispatch(doServiceAction(serviceId, action))
});

export default connect(null, null, mergeProps)(GlobalAlarmCard);
