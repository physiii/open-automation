// VideoPlayer.js
import React from 'react';
import PropTypes from 'prop-types';
import VideoStream from './VideoStream.js';
import Toolbar from './Toolbar.js';
import PlayButtonIcon from '../icons/PlayButtonIcon.js';
import StopButtonIcon from '../icons/StopButtonIcon.js';
import ExpandIcon from '../icons/ExpandIcon.js';
import fscreen from 'fscreen';
import styles from './VideoPlayer.css';

const controlsHideDelay = 3000;

export class VideoPlayer extends React.Component {
	constructor (props) {
		super(props);

		// Copying props to state here because we specifically only care about
		// the autoplay prop during the first render.
		this.state = {
			isPlaying: this.props.autoplay,
			isFullScreen: false,
			hasPlayedOnce: false,
			currentPlayLocation: 0,
			shouldShowControls: this.props.showControlsWhenStopped || this.props.autoplay
		};

		this.element = React.createRef();

		this.handleClick = this.handleClick.bind(this);
		this.handleFullScreenClick = this.handleFullScreenClick.bind(this);
		this.updateFullScreenState = this.updateFullScreenState.bind(this);
		this.showHideControls = this.showHideControls.bind(this);
	}

	componentDidMount () {
		fscreen.addEventListener('fullscreenchange', this.updateFullScreenState);

		// For autoplay, hide controls after delay.
		if (this.state.shouldShowControls) {
			this.showHideControls();
		}
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
		clearTimeout(this.controlsTimeout);
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

	updateFullScreenState () {
		this.setState({isFullScreen: this.isFullScreen()});
	}

	isFullScreen () {
		return this.element.current === fscreen.fullscreenElement;
	}

	enterFullScreen () {
		if (fscreen.fullscreenEnabled) {
			fscreen.requestFullscreen(this.element.current);
		}
	}

	exitFullScreen () {
		if (fscreen.fullscreenEnabled) {
			fscreen.exitFullscreen();
			this.showHideControls();
		}
	}

	showHideControls (forceShow) {
		this.setState({shouldShowControls: this.state.isPlaying || this.props.showControlsWhenStopped || this.state.isFullScreen || forceShow});

		clearTimeout(this.controlsTimeout);
		this.controlsTimeout = setTimeout(() => {
			this.setState({shouldShowControls: (!this.state.isPlaying && (this.props.showControlsWhenStopped || this.state.isFullScreen)) || false});
		}, controlsHideDelay);
	}

	play () {
		this.setState({
			isPlaying: true,
			hasPlayedOnce: true
		});

		this.showHideControls();
	}

	getVideoWidth () {
		if (this.element) {
			if (this.element.current) {
				return this.element.current.clientWidth;
			}
		}

		return 0;
	}

	getVideoHeight () {
		if (this.element) {
			if (this.element.current) {
				return this.element.current.clientHeight;
			}
		}

		return 0;
	}

	stop () {
		this.setState({
			isPlaying: false,
			shouldShowControls: this.props.showControlsWhenStopped || this.state.isFullScreen
		});
	}

	getAspectRatioPaddingTop () {
		const aspectRatio = this.props.height / this.props.width;

		return (aspectRatio * 100) + '%';
	}

	getMotionWidth () {
		const width1 = this.props.motionArea.p1[0] * this.getVideoWidth(),
			width2 = this.props.motionArea.p2[0] * this.getVideoWidth();

		let width = width2 - width1;

		if (!this.props.firstPointSet && !this.props.firstLoad) {
			width = 0;
		}

		return width;
	}

	getMotionHeight () {
		const width1 = this.props.motionArea.p1[1] * this.getVideoHeight(),
			width2 = this.props.motionArea.p2[1] * this.getVideoHeight();

		let width = width2 - width1;

		if (!this.props.firstPointSet && !this.props.firstLoad) {
			width = 0;
		}

		return width;
	}

	render () {
		return (
			<div
				onKeyDown={this.handleKeyPress}
				className={styles['player' + (this.state.isPlaying ? ' isPlaying' : '') + (this.state.isFullScreen ? ' isFullScreen' : '')]}
				ref={this.element}
				onClick={this.handleClick}
				onMouseMove={() => this.showHideControls()}>
				<div className={styles.overlay}>
					{this.state.isPlaying && this.props.shouldShowControls ? <StopButtonIcon size={64} shadowed={true} /> : null}
					{!this.state.isPlaying && this.props.shouldShowControls ? <PlayButtonIcon size={64} shadowed={true} /> : null}
				</div>
				<div className={styles['toolbar' + (this.props.shouldShowControls ? '' : ' isHidden')]}>
					<Toolbar rightChildren={fscreen.fullscreenEnabled &&
						<ExpandIcon size={22} isExpanded={this.state.isFullScreen} onClick={this.handleFullScreenClick} />} />
				</div>
				{this.state.isPlaying && !this.props.recording &&
					<span className={styles.live}>Live</span>}
				<div className={styles.video}>
					<span className={styles.aspectRatio} style={{paddingTop: this.getAspectRatioPaddingTop()}} />
					{this.props.posterUrl && !this.state.hasPlayedOnce &&
					<img className={styles.poster} src={this.props.posterUrl}/>}

					<div
						className={styles.motionAreaOverlay}
						style={this.props.motionArea ?	{
							left: this.props.motionArea.p1[0] * this.getVideoWidth(),
							top: this.props.motionArea.p1[1] * this.getVideoHeight(),
							width: this.getMotionWidth(),
							height: this.getMotionHeight()
						} : {display: 'none'}} />
					<VideoStream
						className={styles.canvas}
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
	motionArea: PropTypes.object,
	firstLoad: PropTypes.bool,
	firstPointSet: PropTypes.bool,
	secondPointSet: PropTypes.bool,
	recording: PropTypes.object,
	streamingToken: PropTypes.string,
	posterUrl: PropTypes.string,
	autoplay: PropTypes.bool,
	showControlsWhenStopped: PropTypes.bool,
	shouldShowControls: PropTypes.bool,
	width: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	onPlay: PropTypes.func,
	onStop: PropTypes.func
};

VideoPlayer.defaultProps = {
	showControlsWhenStopped: true
};

export default VideoPlayer;
