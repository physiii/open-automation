import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {doServiceAction} from '../../state/ducks/services-list/operations.js';
import ServiceCardBase from './ServiceCardBase.js';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './DimmerCard.css';

export class DimmerCard extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			slider_value: this.getPercentage1(props.service.state.level),
			is_changing: false
		};
	}

	onCardClick () {
		this.setLevel(this.props.service.state.level > 0 ? 0 : 1);
	}

	onBeforeChange () {
		if (this.state.is_changing) {
			return;
		}

		this.setState({
			slider_value: this.getPercentage100(this.props.service.state.level),
			is_changing: true
		});
	}

	onChange (value) {
		this.setState({slider_value: value});
	}

	onAfterChange (value) {
		this.setState({
			slider_value: value,
			is_changing: false
		});

		this.setLevel(this.getPercentage1(value));
	}

	getPercentage1 (value) {
		return Math.round(value) / 100;
	}

	getPercentage100 (value) {
		return Math.round(value * 100);
	}

	setLevel (value) {
		if (!this.props.service.state.connected) {
			return;
		}

		this.props.doAction(this.props.service.id, {
			property: 'level',
			value
		});
	}

	render () {
		const currentLevel = this.state.is_changing
				? this.state.slider_value
				: this.getPercentage100(this.props.service.state.level),
			isCurrentLevelValid = this.state.is_changing || (Number.isFinite(currentLevel) && this.props.service.state.connected);

		return (
			<ServiceCardBase
				name={this.props.service.settings.name || 'Dimmer'}
				status={isCurrentLevelValid
					? currentLevel + '%'
					: 'Unknown'}
				isConnected={this.props.service.state.connected}
				onCardClick={this.onCardClick.bind(this)}
				{...this.props}>
				<div styleName="container">
					<div onClick={(event) => event.stopPropagation()}>
						<Slider
							value={isCurrentLevelValid
								? currentLevel
								: 0}
							onBeforeChange={this.onBeforeChange.bind(this)}
							onChange={this.onChange.bind(this)}
							onAfterChange={this.onAfterChange.bind(this)}
							disabled={!this.props.service.state.connected} />
					</div>
				</div>
			</ServiceCardBase>
		);
	}
}

DimmerCard.propTypes = {
	service: PropTypes.object,
	doAction: PropTypes.func
};

const mapDispatchToProps = (dispatch) => {
	return {
		doAction: (serviceId, action) => dispatch(doServiceAction(serviceId, action))
	};
};

export default connect(null, mapDispatchToProps)(DimmerCard);
