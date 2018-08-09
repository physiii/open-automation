import React from 'react';
import PropTypes from 'prop-types';
import VideoStream from './VideoStream.js';
import PlayButtonIcon from '../icons/PlayButtonIcon.js';
import StopButtonIcon from '../icons/StopButtonIcon.js';
import ExpandIcon from '../icons/ExpandIcon.js';
import fscreen from 'fscreen';
import './VideoPlayer.css';

export class VideoPlayer extends React.Component {
	constructor (props) {
		super(props);

		// Copying props to state here because we specifically only care about
		// the autoplay prop during the first render.
		this.state = {
			isPlaying: this.props.autoplay,
			isFullScreen: false,
			hasPlayedOnce: false
		};

		this.wrapper = React.createRef();

		this.handleClick = this.handleClick.bind(this);
		this.handleFullScreenClick = this.handleFullScreenClick.bind(this);
		this.handleCloseClick = this.handleCloseClick.bind(this);
		this.updateFullScreenState = this.updateFullScreenState.bind(this);
	}

	componentDidMount () {
		fscreen.addEventListener('fullscreenchange', this.updateFullScreenState);
	}

	componentDidUpdate (previousProps, previousState) {
		if (!previousState.isPlaying && this.state.isPlaying && typeof this.props.onPlay === 'function') {
			this.props.onPlay();
		} else if (previousState.isPlaying && !this.state.isPlaying && typeof this.props.onStop === 'function') {
			this.props.onStop();
		}

		if (!previousState.isFullScreen && this.state.isFullScreen) {
			this.enterFullScreen();
		} else if (previousState.isFullScreen && !this.state.isFullScreen) {
			this.exitFullScreen();
		}
	}

	componentWillUnmount () {
		fscreen.removeEventListener('fullscreenchange', this.updateFullScreenState);
	}

	handleClick () {
		if (this.state.isPlaying) {
			this.stop();
		} else {
			this.play();
		}
	}

	handleFullScreenClick (event) {
		event.stopPropagation();

		this.setState({isFullScreen: !this.state.isFullScreen});
	}

	handleCloseClick (event) {
		event.stopPropagation();

		this.exitFullScreen();
	}

	updateFullScreenState () {
		this.setState({isFullScreen: this.isFullScreen()});
	}

	isFullScreen () {
		return this.wrapper.current === fscreen.fullscreenElement;
	}

	enterFullScreen () {
		if (fscreen.fullscreenEnabled) {
			fscreen.requestFullscreen(this.wrapper.current);
		}
	}

	exitFullScreen () {
		if (fscreen.fullscreenEnabled) {
			fscreen.exitFullscreen();
		}
	}

	play () {
		this.setState({
			isPlaying: true,
			hasPlayedOnce: true
		});
	}

	stop () {
		this.setState({isPlaying: false});
	}

	getAspectRatioPaddingTop () {
		const aspectRatio = this.props.height / this.props.width;

		return (aspectRatio * 100) + '%';
	}

	render () {
		return (
			<div styleName={this.state.isFullScreen ? 'wrapperFullScreen' : 'wrapper'} ref={this.wrapper}>
				{this.state.isFullScreen &&
					<span styleName="closeButton" onClick={this.handleCloseClick}><ExpandIcon size={18} /></span>}
				<div styleName={this.state.isFullScreen ? 'playerFullScreen' : 'player'} onClick={this.handleClick}>
					<div styleName={this.state.isPlaying ? 'overlayPlaying' : 'overlay'}>
						{!this.state.isPlaying &&
							<PlayButtonIcon size={64} shadowed={true} />}
						{this.state.isPlaying &&
							<StopButtonIcon size={64} shadowed={true} />}
						{this.state.isPlaying && !this.props.recording &&
							<span styleName="live">Live</span>}
						{this.state.isPlaying && fscreen.fullscreenEnabled &&
							<span onClick={this.handleFullScreenClick}><ExpandIcon size={18} /></span>}
					</div>
					<div styleName="video">
						<span styleName="aspectRatio" style={{paddingTop: this.getAspectRatioPaddingTop()}} />
						{this.props.posterUrl && !this.state.hasPlayedOnce &&
							<img styleName="poster" src={this.props.posterUrl} />}
						<VideoStream
							styleName="canvas"
							{...this.props}
							shouldStream={this.state.isPlaying}
							key={(this.props.recording && this.props.recording.id) || this.props.cameraServiceId} />
					</div>
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
