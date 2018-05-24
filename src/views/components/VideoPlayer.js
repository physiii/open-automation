import React from 'react';
import PropTypes from 'prop-types';
import VideoStream from './VideoStream.js';
import '../styles/modules/_VideoPlayer.scss';

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
		const aspectRatio = this.props.video && this.props.video.resolution
			? this.props.video.resolution.height / this.props.video.resolution.width
			: this.props.camera.settings.resolution_h / this.props.camera.settings.resolution_w;

		return (aspectRatio * 100) + '%'; // eslint-disable-line no-magic-numbers
	}

	render () {
		return (
			<div className="oa-VideoPlayer" onClick={this.onClick}>
				<div className="oa-VideoPlayer--overlay">
					{!this.state.isPlaying
						? <button className="oa-VideoPlayer--playButton">Play</button>
						: null }
				</div>
				<div className="oa-VideoPlayer--video" style={{width: this.props.camera.settings.resolution_w}}>
					<span className="oa-VideoPlayer--aspectRatio" style={{paddingTop: this.getAspectRatioPaddingTop()}} />
					<VideoStream
						className="oa-VideoPlayer--canvas"
						camera={this.props.camera}
						file={this.props.video ? this.props.video.file : null}
						shouldStream={this.state.isPlaying} />
				</div>
			</div>
		);
	}
}

VideoPlayer.propTypes = {
	camera: PropTypes.object,
	video: PropTypes.object
};

export default VideoPlayer;
