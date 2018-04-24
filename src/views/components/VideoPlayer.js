import React from 'react';
import PropTypes from 'prop-types';
import VideoStream from './VideoStream.js';
import '../styles/modules/_VideoPlayer.scss';

export class Video extends React.Component {
	constructor (props) {
		super(props);
		this.state = {isPlaying: false};
		this.onClick = this.onClick.bind(this);
	}

	onClick () {
		this.setState({isPlaying: !this.state.isPlaying});
	}

	getAspectRatioPaddingTop () {
		const aspectRatio = this.props.camera.resolution.height / this.props.camera.resolution.width;

		return (aspectRatio * 100) + '%'; // eslint-disable-line no-magic-numbers
	}

	render () {
		return (
			<div
				className="oa-VideoPlayer"
				onClick={this.onClick}>
				<div className="oa-VideoPlayer--overlay">
					{!this.state.isPlaying
						? <button className="oa-VideoPlayer--playButton">Play</button>
						: null }
				</div>
				<div className="oa-VideoPlayer--video" style={{width: this.props.camera.resolution.width}}>
					<span
						className="oa-VideoPlayer--aspectRatio"
						style={{paddingTop: this.getAspectRatioPaddingTop()}}
					/>
					<VideoStream className="oa-VideoPlayer--canvas" camera={this.props.camera} shouldStream={this.state.isPlaying} />
				</div>
			</div>
		);
	}
}

Video.propTypes = {
	camera: PropTypes.object
};

export default Video;
