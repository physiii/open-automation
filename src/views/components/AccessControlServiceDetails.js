import React from 'react';
import PropTypes from 'prop-types';
import {Switch, Redirect, withRouter} from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {doServiceAction, fetchDeviceLog} from '../../state/ducks/services-list/operations.js';
import {getDeviceLog, getServiceById} from '../../state/ducks/services-list/selectors.js';
import {Route} from './Route.js';
import ServiceSettingsScreen from './ServiceSettingsScreen.js';
import styles from './ServiceDetails.css';

import RangeControl from './RangeControl.js';

const ONE_SECOND_IN_MILLISECONDS = 1000,
	ONE_MINUTE_IN_SECONDS = 60,
	ONE_HOUR_IN_MINUTES = 60,
	OVERVIEW_WINDOW_HOURS = 6,
	GRAPH_TITLES = {
		atm_temp: 'Atmospheric Temperature',
		humidity: 'Humidity',
		water_temp: 'Water Temperature',
		ph: 'Water pH',
		ec: 'Water Electric Conductivity'
	};

export class AccessControlServiceDetails extends React.Component {

	constructor (props) {
		super(props);


		const holdTemp = props.service.state.get('hold_temp') ? props.service.state.get('hold_temp') : {min: 0, max: 100};

		this.state = {
			logsReady: false,
			holdTemp,
			sensorGraphs: [],
			didMount: false,
			receivedTempValues: false,
			Options: {
				chart: {
					id: 'chart2',
					type: 'line',
					height: 100,
					foreColor: '#ccc',
					toolbar: {
						autoSelected: 'pan',
						show: false
					}
				},
				colors: ['#00BAEC'],
				stroke: {
					width: 5,
					curve: 'smooth'
				},
				grid: {
					borderColor: '#555',
					clipMarkers: false,
					yaxis: {
						lines: {
							show: false
						}
					}
				},
				dataLabels: {
					enabled: false
				},
				markers: {
					size: 4,
					colors: ['#000524'],
					strokeColor: '#00BAEC',
					strokeWidth: 2
				},
				series: [
					{
						data: []
					}
				],
				tooltip: {
					theme: 'dark'
				},
				xaxis: {
					type: 'datetime'
				},
				yaxis: {
					min: 22,
					tickAmount: 4
				}
			},
			OptionsOverview: {
				chart: {
					id: 'chart1',
					height: 100,
					type: 'bar',
					foreColor: '#ccc',
					brush: {
						target: 'chart2',
						enabled: true
					},
					selection: {
						enabled: true,
						fill: {
							color: '#fff',
							opacity: 0.4
						},
						xaxis: {
							min: 0,
							max: 0
						}
					}
				},
				colors: ['#FF0080'],
				series: [
					{
						data: []
					}
				],
				stroke: {
					width: 2
				},
				grid: {
					borderColor: '#444'
				},
				markers: {
					size: 0
				},
				xaxis: {
					type: 'datetime',
					tooltip: {
						enabled: false
					}
				},
				yaxis: {
					tickAmount: 2
				}
			}
		};
	}

	componentDidMount () {
		this.props.fetchLog(this.props.service.id);
	}

	componentDidUpdate(prevProps) {
		if (prevProps.logs !== this.props.logs) {
			if (!this.props.logs[0]) return;

			const logs = this.props.logs,
				keyArray = Object.keys(logs[0].services[0].state);

			keyArray.forEach((key) => {
				if (GRAPH_TITLES[key]) this.createGraph(logs, key, GRAPH_TITLES[key]);
			});
		}
	}

	getTimeMax () {
		if (!this.props.logs[0]) return;
		const logs = this.props.logs,
			date = logs[logs.length - 1].date;

		return new Date(date).getTime();
	}

	getTimeMin () {
		const time = this.getTimeMax()
			- OVERVIEW_WINDOW_HOURS
			* ONE_HOUR_IN_MINUTES
			* ONE_MINUTE_IN_SECONDS
			* ONE_SECOND_IN_MILLISECONDS;

		return time;
	}

	createGraph (logs, key, title) {
		const series = logs.map((item) => {
				return [new Date(item.date).getTime(), item.services[0].state[key]];
			}),
			values = this.props.logs.map((item) => {
				return item.services[0].state[key];
			}),
			minMax = [Math.min.apply(null, values), Math.max.apply(null, values)],
			newOptions = JSON.parse(JSON.stringify(this.state.Options)),
			newOptionsOverview = JSON.parse(JSON.stringify(this.state.OptionsOverview));

		newOptions.chart.id = key + 'Options';
		newOptions.series[0].data = series;
		newOptions.series[0].name = title;
		newOptions.yaxis.min = minMax[0] - 1;
		newOptions.yaxis.max = minMax[1] + 1;

		newOptionsOverview.chart.id = key + 'OptionsOverview';
		newOptionsOverview.chart.brush.target = key + 'Options';
		newOptionsOverview.chart.selection.xaxis.max = this.getTimeMax();
		newOptionsOverview.chart.selection.xaxis.min = this.getTimeMin();
		newOptionsOverview.series[0].data = series;
		newOptionsOverview.yaxis.min = minMax[0] - 1;
		newOptionsOverview.yaxis.max = minMax[1] + 1;

		const newGraphs = this.state.sensorGraphs.map((graph) => graph),
			newGraph = {key, title, options: newOptions, optionsOverview: newOptionsOverview, display: false},
			index = newGraphs.findIndex((graph) => graph.key === key);

		if (index < 0) {
			this.setState({sensorGraphs: newGraphs});
			newGraphs.unshift(newGraph);
		}
	}

	plot (index, key) {
		this.setState((state) => ({
			sensorGraphs: state.sensorGraphs.map((el) => el.key === key ? {...el, display: !el.display} : el)
		}));
	}

	handleHoldRangeInput (value) {
		this.state.holdTemp.min = value[0];
		this.state.holdTemp.max = value[1];

		this.setState(this.state);
	}

	handleHoldRangeChange (value) {
		this.state.holdTemp.min = value[0];
		this.state.holdTemp.max = value[1];

		this.setState(this.state);
		this.props.doAction(this.props.service.id, {
			property: 'setHoldTemp',
			value
		});
	}

	setPhPoint () {
		this.props.doAction(this.props.service.id, {
			property: 'setPhPoint',
			value: 1
		});
	}

	render () {
		return (
			<Switch>
				<Route exact path={this.props.match.url} render={() => (
					<div>
						<div className={styles.graphContainerExpanded}>Water Temperature Range
							<span>
								<div className={styles.tempScheduleLabel}>{this.state.holdTemp.min}&#8457;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{this.state.holdTemp.max}&#8457;</div>
							</span>
							<span className={styles.tempSlider}>
								<RangeControl
									onInput={this.handleHoldRangeInput.bind(this)}
									onChange={this.handleHoldRangeChange.bind(this)}
									min={this.state.holdTemp.min}
									max={this.state.holdTemp.max} />
							</span>
						</div>
						<div className={styles.graphContainerExpanded}>pH Calibration
							<span className={styles.themeContainer}>
								<div
									className={styles.theme_1}
									onClick={this.setPhPoint.bind(this)}
								/>
								<div
									className={styles.theme_2}
									onClick={this.setPhPoint.bind(this)}
								/>
							</span>
							<span>
								<div>Set 4.0 Point</div><div>Set 7.0 Point</div><div>Set 10.0 Point</div>
							</span>
						</div>
						{this.state.logsReady ?
							<div>
								<div className={styles.sensorTitle}>Sensor Graphs</div>
								{this.state.sensorGraphs.map((item, index) => (
									<div
										className={ item.display ? styles.graphContainerExpanded : styles.graphContainer}
										key={item.key}>
										{ this.state.sensorGraphs[index].display
											?
											<div>
												<div onClick={() => this.plot(index, item.key)}>{item.title}</div>
												<ReactApexChart options={item.options} series={item.options.series} type="line" height={200} />
												<ReactApexChart options={item.optionsOverview} series={item.optionsOverview.series} type="bar" height={100} />
											</div>
											:
											<div>
												<div onClick={() => this.plot(index, item.key)}>{item.title}</div>
											</div>
										}
									</div>
								))}
							</div>
							: 'Getting logs...'}
					</div>
				)} />
				<ServiceSettingsScreen service={this.props.service} path={this.props.match.path + AccessControlServiceDetails.settingsPath} />
				<Route render={() => <Redirect to={this.props.match.url} />} />
			</Switch>
		);
	}
}

AccessControlServiceDetails.settingsPath = '/service-settings';

AccessControlServiceDetails.propTypes = {
	service: PropTypes.object.isRequired,
	children: PropTypes.node,
	doAction: PropTypes.func,
	setHoldTemp: PropTypes.func,
	shouldShowSettingsButton: PropTypes.bool,
	shouldShowRoomField: PropTypes.bool,
	serviceType: PropTypes.string,
	match: PropTypes.object,
	logs: PropTypes.array.isRequired,
	fetchLog: PropTypes.func
};

AccessControlServiceDetails.defaultProps = {
	logs: [],
	fetchLog: () => { /* no-op */ }
};

const mapStateToProps = ({servicesList}, {match}) => {
		const service = getServiceById(servicesList, match.params.serviceId, false);

		return {
			service,
			logs: getDeviceLog(servicesList, service && service.id)
		};
	},
	mapDispatchToProps = (stateProps, {dispatch}, ownProps) => ({
		...ownProps,
		...stateProps,
		doAction: (serviceId, action) => dispatch(doServiceAction(serviceId, action)),
		fetchLog: (serviceId) => dispatch(fetchDeviceLog(serviceId))
	});

export default compose(
	withRouter,
	connect(mapStateToProps, null, mapDispatchToProps)
)(AccessControlServiceDetails);
