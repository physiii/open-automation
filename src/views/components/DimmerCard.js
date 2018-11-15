import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {doServiceAction} from '../../state/ducks/services-list/operations.js';
import ServiceCardBase from './ServiceCardBase.js';
import Switch from './Switch.js';
import SliderControl from './SliderControl.js';
import './DimmerCard.css';

export class DimmerCard extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			slider_value: this.getPercentage100(props.service.state.level),
			is_changing: false
		};
	}

	onCardClick () {
		this.setLevel(this.props.service.state.level > 0 ? 0 : 1);
	}

	handleInput (value) {
		this.setState({
			slider_value: value,
			is_changing: true
		});
	}

	handleChange (value) {
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
		const isConnected = this.props.service.state.connected,
			currentLevel = this.state.is_changing
				? this.state.slider_value
				: this.getPercentage100(this.props.service.state.level);

		return (
			<ServiceCardBase
				name={this.props.service.settings.name || 'Dimmer'}
				status={isConnected && Number.isFinite(currentLevel)
					? currentLevel + '%'
					: 'Unknown'}
				isConnected={isConnected}
				onCardClick={this.onCardClick.bind(this)}
				{...this.props}>
				<div styleName="container">
					<Switch
						isOn={this.props.service.state.level > 0}
						showLabels={true}
						disabled={!isConnected} />
					<div styleName="sliderWrapper" onClick={(event) => event.stopPropagation()}>
						<SliderControl
							value={currentLevel}
							onInput={this.handleInput.bind(this)}
							onChange={this.handleChange.bind(this)}
							disabled={!isConnected} />
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
