import React from 'react';
import PropTypes from 'prop-types';
import List from './List.js';
import ServiceIcon from '../icons/ServiceIcon.js';
import {connect} from 'react-redux';
import {getDevices} from '../../state/ducks/devices-list/selectors.js';
import {getServiceById} from '../../state/ducks/services-list/selectors.js';

export class DevicesList extends React.Component {
	render () {
		return (
			<List>
				{this.props.devices.map((device) => {
					const firstService = device.services[0],
						additionalServicesCount = device.services.length - 1,
						additionalServicesNoun = 'feature' + (additionalServicesCount > 1 ? 's' : '');

					return {
						key: device.id,
						icon: firstService && <ServiceIcon service={firstService} size={24} shouldRenderBlank={true} />,
						label: device.settings.name || 'Device',
						secondaryText: firstService && (firstService.settings.get('name') || firstService.strings.get('friendly_type')) +
							(additionalServicesCount > 0
								? ' and ' + additionalServicesCount + ' other ' + additionalServicesNoun
								: ''),
						link: this.props.deviceLinkBase ? this.props.deviceLinkBase + '/' + device.id : null,
						onClick: this.props.onDeviceClick ? () => this.props.onDeviceClick(device.id) : null
					};
				})}
			</List>
		);
	}
}

DevicesList.propTypes = {
	devices: PropTypes.array.isRequired,
	deviceLinkBase: PropTypes.string,
	onDeviceClick: PropTypes.func
};

const mapStateToProps = ({devicesList, servicesList}, ownProps) => {
	const devices = ownProps.devices || getDevices(devicesList);

	return {
		devices: devices.map((device) => ({
			...device,
			services: device.services.map(({id}) => getServiceById(servicesList, id, false))
		}))
	};
};

export default connect(mapStateToProps)(DevicesList);
