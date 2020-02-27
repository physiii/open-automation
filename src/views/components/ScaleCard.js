import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button.js';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {withRouter} from 'react-router-dom';
import {doServiceAction} from '../../state/ducks/services-list/operations.js';
import ServiceCardBase from './ServiceCardBase.js';
import './ScaleCard.css';

export class ScaleCard extends React.Component {
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

	minTwoDigits (number) {
		return (number < 10 ? '0' : '') + number;
	}

	render () {
		const isConnected = this.props.service.state.get('connected');

		return (
			<ServiceCardBase
				name={this.props.service.settings.get('name') || 'Scale'}
				status={this.props.service.state.get('connected')
					? Math.trunc(this.props.service.state.get('cycletime') / 604800) + 'w ' +
						Math.trunc((this.props.service.state.get('cycletime') % 604800) / 86400) + 'd ' +
						this.minTwoDigits(Math.trunc((this.props.service.state.get('cycletime') % 86400) / 3600)) + ':' +
						this.minTwoDigits(Math.trunc((this.props.service.state.get('cycletime') % 3600) / 60)) + ':' +
						this.minTwoDigits(this.props.service.state.get('cycletime') % 60)
					:	'Unknown'}
				isConnected={isConnected}
				// secondaryAction={<Button>{this.props.service.settings.get('name') || 'Bill Acceptor'} Log</Button>}
				secondaryAction={<Button to={`${this.props.match.url}/device-log/${this.props.service.id}`}>Device Log</Button>}
				onCardClick={this.onCardClick.bind(this)}
				{...this.props}>
				<div styleName="container">
					<section>
						<span styleName="sensorTitle">
							{this.props.service.state.get('weight') ? this.props.service.state.get('weight').toFixed(1) : '0'} lbs
						</span>
						<br />
					</section>
				</div>
			</ServiceCardBase>
		);
	}
}

ScaleCard.propTypes = {
	match: PropTypes.object,
	service: PropTypes.object,
	doAction: PropTypes.func
};

const mergeProps = (stateProps, {dispatch}, ownProps) => ({
	...ownProps,
	...stateProps,
	doAction: (serviceId, action) => dispatch(doServiceAction(serviceId, action))
});

// export default connect(null, null, mergeProps)(ScaleCard);
export default compose(
	connect(null, null, mergeProps),
	withRouter
)(ScaleCard);
