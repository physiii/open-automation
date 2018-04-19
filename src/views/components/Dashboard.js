import React from 'react';
import PropTypes from 'prop-types';
import DeviceCard from './DeviceCard.js';
import {connect} from 'react-redux';
import {devicesWithoutGateways} from '../../state/ducks/devices/selectors.js';

export const Dashboard = (props) => (
	<div>
		{props.devices
			? props.devices.map((device, index) => <DeviceCard key={index} device={device} />)
			: null
		}
	</div>
);

Dashboard.propTypes = {
	devices: PropTypes.array
};

const mapStateToProps = (state) => ({
	devices: devicesWithoutGateways(state.devices)
});

export default connect(mapStateToProps)(Dashboard);
