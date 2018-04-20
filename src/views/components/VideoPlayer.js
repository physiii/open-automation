import React from 'react';
import PropTypes from 'prop-types';
import VideoStream from './VideoStream.js';
import '../styles/modules/_VideoPlayer.scss';

export class Video extends React.Component {
	constructor (props) {
		super(props);
		this.state = {isPlaying: false};
		this.clickHandler = this.clickHandler.bind(this);
	}

	clickHandler () {
		if (this.state.isPlaying) {
			this.setState({isPlaying: false});
		} else {
			this.setState({isPlaying: true});
		}
	}

	render () {
		return (
			<div
				className="oa-VideoPlayer"
				onClick={this.clickHandler}>
				{!this.state.isPlaying
					? <button className="oa-VideoPlayer--playButton">Play</button>
					: null }
				<div className="oa-VideoPlayer--video">
					<VideoStream className="oa-VideoPlayer--canvas" camera={this.props.camera} shouldPlay={this.state.isPlaying} />
				</div>
			</div>
		);
	}
}

Video.propTypes = {
	camera: PropTypes.object
};

export default Video;
