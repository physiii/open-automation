import React from 'react';
import PropTypes from 'prop-types';
import ServiceCardBase from './ServiceCardBase.js';
import MetaList from './MetaList.js';
import Button from './Button.js';
import {formatUsd} from '../../utilities.js';
import moment from 'moment';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {getServiceByTypeAndDeviceId, getSettingsOptionLabelByValue} from '../../state/ducks/services-list/selectors.js';
import {gameMachineAddCredit} from '../../state/ducks/services-list/operations.js';
import styles from './GameMachineCard.css';

const ONE_DOLLAR = 1,
	FIVE_DOLLARS = 5,
	TEN_DOLLARS = 10,
	TWENTY_DOLLARS = 20;

export class GameMachineCard extends React.Component {
	handleAddCreditClick (dollarValue, event) {
		event.stopPropagation();
		this.props.addCredit(this.props.service.id, dollarValue);
	}

	render () {
		const hopperLastEmptiedDate = moment(this.props.billAcceptorService.state.get('hopper_last_emptied')),
			hopperLastEmptied = this.props.billAcceptorService.state.get('hopper_last_emptied') && hopperLastEmptiedDate.isValid() && this.props.service.state.get('connected')
				? hopperLastEmptiedDate.format('h:mm a MMMM Do')
				: 'Unknown',
			billAcceptorDoorName = this.props.contactSensorService.settings.get('name') || 'Bill Acceptor Door';

		let billAcceptorDoorStatus = 'Unknown',
			status = this.props.service.settings.get('active_game') === 'game-board'
				? 'Game Board'
				: this.props.selectedArcadeGameLabel;

		if (this.props.contactSensorService.state.get('contact') === true && this.props.service.state.get('connected')) {
			billAcceptorDoorStatus = 'Closed';
		} else if (this.props.contactSensorService.state.get('contact') === false && this.props.service.state.get('connected')) {
			billAcceptorDoorStatus = 'Open';
			status = billAcceptorDoorName + ' Open';
		}

		return (
			<ServiceCardBase
				name={this.props.service.settings.get('name') || 'Game Machine'}
				status={status}
				isConnected={this.props.service.state.get('connected')}
				secondaryAction={<Button to={`${this.props.match.url}/service-log/${this.props.billAcceptorService.id}`}>{this.props.billAcceptorService.settings.get('name') || 'Bill Acceptor'} Log</Button>}
				{...this.props}>
				<div className={styles.container}>
					<section className={styles.main}>
						<span className={styles.hopperTotal}>{this.props.service.state.get('connected') ? formatUsd(this.props.billAcceptorService.state.get('hopper_total') || 0) : 'Unknown'}</span>
						<span className={styles.hopperTotalDescription}>collected since hopper was emptied.</span>
					</section>
					<section className={styles.addCredit}>
						<h2 className={styles.addCreditTitle}>Add Credit</h2>
						<div className={styles.addCreditButtons}>
							<Button type="link" onClick={this.handleAddCreditClick.bind(this, ONE_DOLLAR)}>$1</Button>
							<Button type="link" onClick={this.handleAddCreditClick.bind(this, FIVE_DOLLARS)}>$5</Button>
							<Button type="link" onClick={this.handleAddCreditClick.bind(this, TEN_DOLLARS)}>$10</Button>
							<Button type="link" onClick={this.handleAddCreditClick.bind(this, TWENTY_DOLLARS)}>$20</Button>
						</div>
					</section>
					<MetaList layout="vertical" alignLabels="left" alignValuesRight={true}>
						{[
							{label: 'Hopper Last Emptied', value: hopperLastEmptied},
							{label: billAcceptorDoorName, value: billAcceptorDoorStatus}
						]}
					</MetaList>
				</div>
			</ServiceCardBase>
		);
	}
}

GameMachineCard.propTypes = {
	service: PropTypes.object,
	match: PropTypes.object,
	billAcceptorService: PropTypes.object,
	contactSensorService: PropTypes.object,
	selectedArcadeGameLabel: PropTypes.string,
	addCredit: PropTypes.func
};

const mapStateToProps = ({servicesList}, {service}) => {
		return {
			billAcceptorService: getServiceByTypeAndDeviceId(servicesList, 'bill-acceptor', service.device_id, false),
			contactSensorService: getServiceByTypeAndDeviceId(servicesList, 'contact-sensor', service.device_id, false),
			selectedArcadeGameLabel: getSettingsOptionLabelByValue(servicesList, service.id, 'arcade_game', service.settings.get('arcade_game'))
		};
	},
	mapDispatchToProps = (dispatch) => {
		return {
			addCredit: (serviceId, dollarValue) => dispatch(gameMachineAddCredit(serviceId, dollarValue))
		};
	};

export default compose(
	connect(mapStateToProps, mapDispatchToProps),
	withRouter
)(GameMachineCard);
