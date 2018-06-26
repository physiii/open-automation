import React from 'react';
import PropTypes from 'prop-types';
import VideoStream from './VideoStream.js';
import PlayButtonIcon from '../icons/PlayButtonIcon.js';
import './VideoPlayer.css';

export class VideoPlayer extends React.Component {
	constructor (props) {
		super(props);

		// Copying props to state here because we specifically only care about
		// the autoplay prop during the first render.
		this.state = {
			isPlaying: this.props.autoplay,
			hasPlayedOnce: false
		};

		this.onClick = this.onClick.bind(this);
	}

	onClick () {
		const isPlaying = !this.state.isPlaying;

		this.setState({
			isPlaying,
			hasPlayedOnce: true
		});

		if (isPlaying && typeof this.props.onPlay === 'function') {
			this.props.onPlay();
		} else if (!isPlaying && typeof this.props.onStop === 'function') {
			this.props.onStop();
		}
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
					{this.state.isPlaying && !this.props.recording
						? <span styleName="live">Live</span>
						: null}
				</div>
				<div styleName="video">
					<span styleName="aspectRatio" style={{paddingTop: this.getAspectRatioPaddingTop()}} />
					{this.props.posterUrl && !this.state.hasPlayedOnce
						? <img styleName="poster" style={{width: this.props.width, height: this.props.height}} src={this.props.posterUrl} />
						: null}
					<VideoStream
						styleName="canvas"
						{...this.props}
						shouldStream={this.state.isPlaying}
						key={(this.props.recording && this.props.recording.id) || this.props.cameraServiceId} />
				</div>
			</div>
		);
	}
}

VideoPlayer.propTypes = {
	// NOTE: The VideoPlayer component should always be called with a key
	// property set to the ID of the recording or camera that is being streamed.
	cameraServiceId: PropTypes.string.isRequired,
	recording: PropTypes.object,
	streamingToken: PropTypes.string,
	posterUrl: PropTypes.string,
	autoplay: PropTypes.bool,
	width: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	onPlay: PropTypes.func,
	onStop: PropTypes.func
};

export default VideoPlayer;
