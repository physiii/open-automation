import React from 'react';
import PropTypes from 'prop-types';
import DeviceCard from './DeviceCard.js';
import {connect} from 'react-redux';
import {devicesWithoutGateways} from '../../state/ducks/devices/selectors.js';
import '../styles/layouts/_cardGrid.scss';

export const Dashboard = (props) => (
	<div className="oa-l-cardGrid">
		{props.devices
			? props.devices.map((device, index) => (
				<div key={index} className="oa-l-cardGrid--card">
					<DeviceCard device={device} />
				</div>
			))
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
