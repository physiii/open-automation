import React from 'react';
import PropTypes from 'prop-types';
import VideoStream from './VideoStream.js';
import PlayButtonIcon from '../icons/PlayButtonIcon.js';
import './VideoPlayer.css';

export class VideoPlayer extends React.Component {
	constructor (props) {
		super(props);
		this.state = {isPlaying: false};
		this.onClick = this.onClick.bind(this);
	}

	onClick () {
		this.setState({isPlaying: !this.state.isPlaying});
	}

	getAspectRatioPaddingTop () {
		const aspectRatio = this.props.height / this.props.width;

		return (aspectRatio * 100) + '%'; // eslint-disable-line no-magic-numbers
	}

	render () {
		return (
			<div styleName="player" onClick={this.onClick}>
				<div styleName={this.state.isPlaying ? 'overlayPlaying' : 'overlay'}>
					{!this.state.isPlaying
						? <PlayButtonIcon shadowed={true} />
						: null }
				</div>
				<div styleName="video" style={{width: this.props.width}}>
					<span styleName="aspectRatio" style={{paddingTop: this.getAspectRatioPaddingTop()}} />
					<VideoStream styleName="canvas" {...this.props} shouldStream={this.state.isPlaying} />
				</div>
			</div>
		);
	}
}

VideoPlayer.propTypes = {
	cameraServiceId: PropTypes.string.isRequired,
	recording: PropTypes.object,
	streamingToken: PropTypes.string,
	width: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired
};

export default VideoPlayer;
