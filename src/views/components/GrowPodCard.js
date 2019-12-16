import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {doServiceAction} from '../../state/ducks/services-list/operations.js';
import Switch from './Switch.js';
import ServiceCardBase from './ServiceCardBase.js';
import './GrowPodCard.css';

export class GrowPodCard extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			is_changing: false
		};
	}

	onCardClick () {
		this.setLevel(this.props.service.state.get('light_level') > 0 ? 0 : 1);
	}

	getPercentage1 (value) {
		return Math.round(value) / 100;
	}

	getPercentage100 (value) {
		return Math.round(value * 100);
	}

	setLevel (value) {
		if (!this.props.service.state.get('connected')) {
			return;
		}

		this.props.doAction(this.props.service.id, {
			property: 'light_level',
			value
		});
	}

	render () {
		const isConnected = this.props.service.state.get('connected');

		return (
			<ServiceCardBase
				name={this.props.service.settings.get('name') || 'GrowPod'}
				status={this.props.service.state.get('connected') ? this.props.service.state.get('uptime') : 'Unknown'}
				isConnected={isConnected}
				onCardClick={this.onCardClick.bind(this)}
				{...this.props}>
				<div styleName="container">
					<section styleName="main">
						<span styleName="hopperTotalDescription">
							Temp (Atmosphere):{this.props.service.state.get('connected') ? ' ' + this.props.service.state.get('atm_temp') : 'Unknown'}
						</span>
						<br />
						<span styleName="hopperTotalDescription">
							Humidity:{this.props.service.state.get('connected') ? ' ' + this.props.service.state.get('humidity') : 'Unknown'}
						</span>
						<br />
						<span styleName="hopperTotalDescription">
							Temp (water):{this.props.service.state.get('water_temp') ? ' ' + this.props.service.state.get('water_temp').toFixed(1) : 'Unknown'}
						</span>
						<br />
						<span styleName="hopperTotalDescription">
							pH:{this.props.service.state.get('ph') ? ' ' + this.props.service.state.get('ph').toFixed(1) : 'Unknown'}
						</span>
						<br />
						<span styleName="hopperTotalDescription">
							EC:{this.props.service.state.get('connected') ? ' ' + this.props.service.state.get('ec') : 'Unknown'}
						</span>
						<br />
					</section>
					<br />
					Light <Switch
						isOn={this.props.service.state.get('light_level') > 0}
						onClick={this.setLevel.bind(this)}
						showLabels={true}
						disabled={!isConnected} />
				</div>
			</ServiceCardBase>
		);
	}
}

GrowPodCard.propTypes = {
	service: PropTypes.object,
	doAction: PropTypes.func
};

const mergeProps = (stateProps, {dispatch}, ownProps) => ({
	...ownProps,
	...stateProps,
	doAction: (serviceId, action) => dispatch(doServiceAction(serviceId, action))
});

export default connect(null, null, mergeProps)(GrowPodCard);
