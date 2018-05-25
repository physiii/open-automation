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
		const aspectRatio = this.props.height / this.props.width;

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
				<div className="oa-VideoPlayer--video" style={{width: this.props.width}}>
					<span className="oa-VideoPlayer--aspectRatio" style={{paddingTop: this.getAspectRatioPaddingTop()}} />
					<VideoStream className="oa-VideoPlayer--canvas" {...this.props} shouldStream={this.state.isPlaying} />
				</div>
			</div>
		);
	}
}

VideoPlayer.propTypes = {
	cameraServiceId: PropTypes.string.isRequired,
	recording: PropTypes.object,
	streamingToken: PropTypes.string.isRequired,
	width: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired
};

export default VideoPlayer;
