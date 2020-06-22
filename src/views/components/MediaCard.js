import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import PlayMediaButtonIcon from '../icons/PlayMediaButtonIcon.js';
import MuteButtonIcon from '../icons/MuteButtonIcon.js';
import UnMuteButtonIcon from '../icons/UnMuteButtonIcon.js';
import LeftCarrotIcon from '../icons/LeftCarrotIcon.js';
import RightCarrotIcon from '../icons/RightCarrotIcon.js';
import {doServiceAction} from '../../state/ducks/services-list/operations.js';
import SliderControl from './SliderControl.js';
import ServiceCardBase from './ServiceCardBase.js';
import './MediaCard.css';

export class MediaCard extends React.Component {
	constructor (props) {
		super(props);

		const volume = this.props.service.state.get('volumeLevel') ? this.props.service.state.get('volumeLevel') : 0,
			mute = this.props.service.state.get('muteState') ? this.props.service.state.get('muteState') : false;

		this.state = {
			slider_value: volume,
			volume,
			mute,
			is_changing: false
		};
	}

	handleSliderInput (value) {
		this.setState({
			slider_value: value,
			is_changing: true
		});

		this.setLevel(value);
	}

	onCardClick () {
		// this.setLevel(this.props.service.state.get('brightness') > 0 ? 0 : 1);
	}

	setLevel (value) {
		if (!this.props.service.state.get('connected')) return;

		this.props.doAction(this.props.service.id, {
			property: 'setLevel',
			value
		});
	}

	mute () {
		if (!this.props.service.state.get('connected')) return;

		this.props.doAction(this.props.service.id, {
			property: 'mute',
			value: 1
		});
	}

	pause () {
		if (!this.props.service.state.get('connected')) return;

		this.props.doAction(this.props.service.id, {
			property: 'pause',
			value: 1
		});
	}

	prev () {
		if (!this.props.service.state.get('connected')) return;

		this.props.doAction(this.props.service.id, {
			property: 'prev',
			value: 1
		});
	}

	next () {
		if (!this.props.service.state.get('connected')) return;

		this.props.doAction(this.props.service.id, {
			property: 'next',
			value: 1
		});
	}

	getVolume () {
		if (this.props.service.state.get('volumeLevel')) return this.props.service.state.get('volumeLevel');

		return 'Unknown';
	}

	getMute () {
		return this.props.service.state.get('muteState');
	}

	render () {
		const isConnected = this.props.service.state.get('connected'),
			currentLevel = this.state.slider_value;

		return (
			<ServiceCardBase
				name={this.props.service.settings.get('name') || 'Media'}
				isConnected={isConnected}
				onCardClick={this.onCardClick.bind(this)}
				{...this.props}>
				<span styleName="themeContainerTop">
					<div
						styleName="pausePlayIcon"
						onClick={this.pause.bind(this)}>
						<PlayMediaButtonIcon size={64} shadowed={true} />
					</div>
					<div
						styleName="iconMute"
						onClick={this.mute.bind(this)}>
						{
							this.getMute()
								?	<MuteButtonIcon size={64} shadowed={true} />
								: <UnMuteButtonIcon size={64} shadowed={true} />
						}
					</div>
				</span>
				<span styleName="themeContainerBottom">
					<div
						styleName="prevIcon"
						onClick={this.prev.bind(this)}>
						<LeftCarrotIcon size={64} shadowed={true} />
					</div>
					<div
						styleName="nextIcon"
						onClick={this.next.bind(this)}>
						<RightCarrotIcon size={64} shadowed={true} />
					</div>
				</span>
				<div styleName="sliderWrapper">
					<SliderControl
						value={currentLevel}
						onInput={this.handleSliderInput.bind(this)}
						disabled={!isConnected} />
				</div>
			</ServiceCardBase>
		);
	}
}

MediaCard.propTypes = {
	service: PropTypes.object,
	doAction: PropTypes.func
};

const mergeProps = (stateProps, {dispatch}, ownProps) => ({
	...ownProps,
	...stateProps,
	doAction: (serviceId, action) => dispatch(doServiceAction(serviceId, action))
});

export default connect(null, null, mergeProps)(MediaCard);
