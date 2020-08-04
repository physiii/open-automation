import React from 'react';
import PropTypes from 'prop-types';
import {Switch, Redirect, withRouter} from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import List from './List.js';
import ToggleSwitch from './Switch.js';
import SliderControl from './SliderControl.js';
import moment from 'moment';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {doServiceAction, fetchDeviceLog} from '../../state/ducks/services-list/operations.js';
import {getDeviceLog, getServiceById} from '../../state/ducks/services-list/selectors.js';
import {Route} from './Route.js';
import SettingsScreenContainer from './SettingsScreenContainer.js';
import ServiceSettingsScreen from './ServiceSettingsScreen.js';
import './ServiceDetails.css';
import RangeControl from './RangeControl.js';
import Form from './Form.js';

const ONE_SECOND_IN_MILLISECONDS = 1000,
			ONE_MINUTE_IN_SECONDS = 60,
			ONE_HOUR_IN_MINUTES = 60,
			OVERVIEW_WINDOW_HOURS = 1;

const GRAPH_TITLES = {
	atm_temp: 'Atmospheric Temperature',
	humidity: 'Humidity',
	water_temp: 'Water Temperature',
	ph: 'Water pH',
	ec: 'Water Electric Conductivity',
	water_level: 'Water Level',
	feed_pump: 'Feed Pump',
	air_pump: 'Air Pump'
};

const TIMES = [
	{id: 0, name: '12:00 AM'},
	{id: 1, name: '1:00 AM'},
	{id: 2, name: '2:00 AM'},
	{id: 3, name: '3:00 AM'},
	{id: 4, name: '4:00 AM'},
	{id: 5, name: '5:00 AM'},
	{id: 6, name: '6:00 AM'},
	{id: 7, name: '7:00 AM'},
	{id: 8, name: '8:00 AM'},
	{id: 9, name: '9:00 AM'},
	{id: 10, name: '10:00 AM'},
	{id: 11, name: '11:00 AM'},
	{id: 12, name: '12:00 PM'},
	{id: 13, name: '1:00 PM'},
	{id: 14, name: '2:00 PM'},
	{id: 15, name: '3:00 PM'},
	{id: 16, name: '4:00 PM'},
	{id: 17, name: '5:00 PM'},
	{id: 18, name: '6:00 PM'},
	{id: 19, name: '7:00 PM'},
	{id: 20, name: '8:00 PM'},
	{id: 21, name: '9:00 PM'},
	{id: 22, name: '10:00 PM'},
	{id: 23, name: '11:00 PM'}
];

export class GrowServiceDetails extends React.Component {

	constructor (props) {
		super(props);

		const feedPump = props.service.state.get('feed_pump') ? props.service.state.get('feed_pump') : {interval: 0, duration: 0, hold: false},
			airPump = props.service.state.get('air_pump') ? props.service.state.get('air_pump') : {interval: 0, duration: 0},
			waterTempRange = props.service.state.get('water_temp_range') ? props.service.state.get('water_temp_range') : {min: 60, max: 90},
			waterLevel = props.service.state.get('water_level') ? props.service.state.get('water_level') : 0,
			light = props.service.state.get('light') ? props.service.state.get('light') : {on: 0, off: 23, bloom: false, hold: false, grow: false},
			phCal = props.service.state.get('ph_cal') ? props.service.state.get('ph_cal') : {ph4: 0, ph7: 0, ph10: 0};

		console.log("!! LIGHT RANGE !!", light);
		this.state = {
			logsReady: false,
			feedPump,
			airPump,
			phCal,
			waterTempRange,
			light,
			sensorGraphs: [],
			didMount: false,
			receivedTempValues: false,
			Options: {
				chart: {
					id: "chart2",
					type: "line",
					height: 100,
					foreColor: "#ccc",
					toolbar: {
						autoSelected: "pan",
						show: false
					}
				},
				colors: ["#00BAEC"],
				stroke: {
					width: 5,
					curve: 'smooth'
				},
				grid: {
					borderColor: "#555",
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
			    colors: ["#000524"],
			    strokeColor: "#00BAEC",
			    strokeWidth: 2
			  },
				series: [
					{
						data: []
					}
				],
				tooltip: {
					theme: "dark"
				},
				xaxis: {
					type: "datetime"
				},
				yaxis: {
					min: 22,
					tickAmount: 4
				}
			},
			OptionsOverview: {
				chart: {
					id: "chart1",
					height: 100,
					type: "bar",
					foreColor: "#ccc",
					brush: {
						target: "chart2",
						enabled: true
					},
					selection: {
						enabled: true,
						fill: {
							color: "#fff",
							opacity: 0.4
						},
						xaxis: {
							min: 0,
							max: 0
						}
					}
				},
				colors: ["#FF0080"],
				series: [
					{
						data: []
					}
				],
				stroke: {
					width: 2
				},
				grid: {
					borderColor: "#444"
				},
				markers: {
					size: 0
				},
				xaxis: {
					type: "datetime",
					tooltip: {
						enabled: false
					}
				},
				yaxis: {
					tickAmount: 2
				}
			},
		};
	}

	componentDidMount () {
		this.props.fetchLog(this.props.service.id);
	}

	componentDidUpdate(prevProps) {
	  if (prevProps.logs !== this.props.logs) {
			if (!this.props.logs[0]) return;

			if (!this.state.logsReady) {
				let logs = this.props.logs;
				let keyArray = Object.keys(logs[0].services[0].state);

				keyArray.forEach(key => {
					if (GRAPH_TITLES[key]) this.createGraph(logs, key, GRAPH_TITLES[key]);
				})

			  this.setState({logsReady: true})
			}

	  }
	}

	getTimeMax () {
		if (!this.props.logs[0]) return;
		let logs = this.props.logs,
			date = logs[logs.length - 1].date;

		return new Date(date).getTime();
	}

	getTimeMin () {
		let time = this.getTimeMax()
			- OVERVIEW_WINDOW_HOURS
			* ONE_HOUR_IN_MINUTES
			* ONE_MINUTE_IN_SECONDS
			* ONE_SECOND_IN_MILLISECONDS;
		return time;
	}

	createGraph (logs, key, title) {
		let filteredLogs = logs.filter((item, index) => {
				if (index === 0 || index === logs.length - 1) return true;
				if (logs[index - 1].services[0].state[key] !== item.services[0].state[key]) return true;
				if (logs[index + 1].services[0].state[key] !== item.services[0].state[key]) return true;
			}),
			series = filteredLogs.map((item, index) => {
				return [new Date(item.date).getTime(), item.services[0].state[key]];
			}),
			values = filteredLogs.map((item, index) => {
				return item.services[0].state[key];
			}),
			minMax = [Math.min.apply(null, values), Math.max.apply(null, values)];

		let newOptions = JSON.parse(JSON.stringify(this.state.Options));
		newOptions.chart.id = key + 'Options';
		newOptions.series[0].data = series;
		newOptions.series[0].name = title;
		newOptions.yaxis.min = minMax[0] - 1;
		newOptions.yaxis.max = minMax[1] + 1;

		let newOptionsOverview = JSON.parse(JSON.stringify(this.state.OptionsOverview));
		newOptionsOverview.chart.id = key + 'OptionsOverview';
		newOptionsOverview.chart.brush.target = key + 'Options';
		newOptionsOverview.chart.selection.xaxis.max = this.getTimeMax();
		newOptionsOverview.chart.selection.xaxis.min = this.getTimeMin();
		newOptionsOverview.series[0].data = series;
		newOptionsOverview.yaxis.min = minMax[0] - 1;
		newOptionsOverview.yaxis.max = minMax[1] + 1;

		let newGraph = {key, title, options: newOptions, optionsOverview: newOptionsOverview, display: false};
		const index = this.state.sensorGraphs.findIndex(graph => graph.key==key);

		if (index < 0) {
			this.state.sensorGraphs.unshift(newGraph);
			this.setState({sensorGraphs: this.state.sensorGraphs});
		}
	}

	plot (index, key) {
		this.setState(state => ({
			sensorGraphs: state.sensorGraphs.map(el => (
				el.key === key
				? {...el, display: !el.display} : el
			))
    }));
  };

	handleLightToggleInput (key, value) {
		this.state.light[key] = !this.state.light[key];
		this.setState({light: this.state.light});
		this.props.doAction(this.props.service.id, {
			property: 'setLight',
			value: this.state.light
		});
		console.log("handleLightToggleInput", this.state.light);
	}

	handleLightTimeChange (key, value) {
		this.state.light[key] = value.time;
		this.setState({light: this.state.light});
		this.props.doAction(this.props.service.id, {
			property: 'setLight',
			value: this.state.light
		});
		console.log("handleLightTimeChange", this.state.light);
	}

	handleTempRangeInput (value) {
		this.state.waterTempRange.min = value[0];
		this.state.waterTempRange.max = value[1];

		this.setState(this.state);
	}

	handleTempRangeChange (value) {
		this.state.waterTempRange.min = value[0];
		this.state.waterTempRange.max = value[1];

		this.setState(this.state);
		this.props.doAction(this.props.service.id, {
			property: 'setTemp',
			value
		});
	}

	setPhPoint (key) {
		this.props.doAction(this.props.service.id, {
			property: 'setPhPoint',
			value: key
		});
	}

	handleFeedPumpSliderInput (key, shouldSend, value) {
		let state = this.state;
		state.feedPump[key] = value;
		this.setState(state);
		if (shouldSend) {
			this.props.doAction(this.props.service.id, {
				property: 'setFeedPump',
				value: this.state.feedPump
			});
		}
	}

	handleFeedPumpToggleInput (key, value) {
		this.state.feedPump[key] = !this.state.feedPump[key];
		// this.setState({feedPump: this.state.feedPump});
		this.setState({feedPump: this.state.feedPump});
		this.props.doAction(this.props.service.id, {
			property: 'setFeedPump',
			value: this.state.feedPump
		});
	}

	handleAirPumpSliderInput (key, shouldSend, value) {
		let state = this.state;
		state.airPump[key] = value;
		this.setState(state);
		if (shouldSend) {
			console.log('handleAirPumpSliderInput', value);
			this.props.doAction(this.props.service.id, {
				property: 'setAirPump',
				value: this.state.airPump
			});
		}
	}

	handleAirPumpToggleInput (key, value) {
		this.state.airPump[key] = !this.state.airPump[key];
		this.setState({airPump: this.state.airPump});
		this.props.doAction(this.props.service.id, {
			property: 'setAirPump',
			value: this.state.airPump
		});
	}

	show (key) {
		this.state[key] = !this.state[key];
		this.setState(this.state);
	}

	render () {
		return (
			<Switch>
				<Route exact path={this.props.match.url} render={() => (
					<div>

							<div styleName='sensorTitle'>Controllers</div>

							<div styleName={ this.state.showFeedPump ? 'graphContainerExpanded' : 'graphContainer'}>
								{ this.state.showFeedPump
									?
									<div>
										<div onClick={this.show.bind(this, 'showFeedPump')}>Feed Pump</div>
										<div styleName="switchWrapper">
											<div styleName="label">Timer</div>
											<ToggleSwitch
												isOn={this.state.feedPump.timer}
												// onClick={this.handleFeedPumpSliderInput.bind(this, 'hold', true)}
												onChange={this.handleFeedPumpToggleInput.bind(this, 'timer')}
												showLabels={true}/>
										</div>
										{this.state.feedPump.timer
											?
											<div>
												<div styleName="sliderWrapper">
													<div styleName="label">Interval</div>
													{ this.state.feedPump.interval } Hours
													<SliderControl
														value={this.state.feedPump.interval}
														min={1}
														max={24}
														onChange={this.handleFeedPumpSliderInput.bind(this, 'interval', true)}
														onInput={this.handleFeedPumpSliderInput.bind(this, 'interval', false)} />
												</div>
												<div styleName="sliderWrapper">
													<div styleName="label">Duration</div>
													{ this.state.feedPump.duration } Minutes
													<SliderControl
														value={this.state.feedPump.duration}
														min={1}
														max={60}
														onChange={this.handleFeedPumpSliderInput.bind(this, 'duration', true)}
														onInput={this.handleFeedPumpSliderInput.bind(this, 'duration', false)} />
												</div>
											</div>
											:
											<div styleName="switchWrapper">
												<div styleName="label">Power</div>
												<ToggleSwitch
													isOn={this.state.feedPump.power}
													// onClick={this.handleFeedPumpSliderInput.bind(this, 'hold', true)}
													onChange={this.handleFeedPumpToggleInput.bind(this, 'power')}
													showLabels={true}/>
											</div>
										}

									</div>
									:
									<div>
										<div onClick={this.show.bind(this, 'showFeedPump')}>Feed Pump</div>
									</div>
								}
							</div>

							<div styleName={ this.state.showAirPump ? 'graphContainerExpanded' : 'graphContainer'}>
								{ this.state.showAirPump
									?
									<div>
										<div onClick={this.show.bind(this, 'showAirPump')}>Air Pump</div>
										<div styleName="switchWrapper">
											<div styleName="label">Timer</div>
											<ToggleSwitch
												isOn={this.state.airPump.timer}
												onChange={this.handleAirPumpToggleInput.bind(this, 'timer')}
												showLabels={true}/>
										</div>
										{this.state.airPump.timer
											?
											<div>
												<div styleName="sliderWrapper">
													<div styleName="label">Interval</div>
													{ this.state.airPump.interval } Hours
													<SliderControl
														value={this.state.airPump.interval}
														min={1}
														max={24}
														onChange={this.handleAirPumpSliderInput.bind(this, 'interval', true)}
														onInput={this.handleAirPumpSliderInput.bind(this, 'interval', false)} />
												</div>
												<div styleName="sliderWrapper">
													<div styleName="label">Duration</div>
													{ this.state.airPump.duration } Minutes
													<SliderControl
														value={this.state.airPump.duration}
														min={1}
														max={60}
														onChange={this.handleAirPumpSliderInput.bind(this, 'duration', true)}
														onInput={this.handleAirPumpSliderInput.bind(this, 'duration', false)} />
												</div>
											</div>
											:
											<div styleName="switchWrapper">
												<div styleName="label">Power</div>
												<ToggleSwitch
													isOn={this.state.airPump.power}
													// onClick={this.handleFeedPumpSliderInput.bind(this, 'hold', true)}
													onChange={this.handleAirPumpToggleInput.bind(this, 'power')}
													showLabels={true}/>
											</div>
										}

									</div>
									:
									<div>
										<div onClick={this.show.bind(this, 'showAirPump')}>Air Pump</div>
									</div>
								}
							</div>

							<div styleName={ this.state.showWaterThermostat ? 'graphContainerExpanded' : 'graphContainer'}>
								{ this.state.showWaterThermostat
									?
									<div>
										<div onClick={this.show.bind(this, 'showWaterThermostat')}>Water Thermostat</div>
										<div styleName="sliderWrapper">
											<span>
												<div styleName="tempScheduleLabel">{this.state.waterTempRange.min}&#8457;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{this.state.waterTempRange.max}&#8457;</div>
											</span>
											<span styleName="tempSlider">
												<RangeControl
													onInput={this.handleTempRangeInput.bind(this)}
													onChange={this.handleTempRangeChange.bind(this)}
													min={this.state.waterTempRange.min}
													max={this.state.waterTempRange.max}
													minRange={60}
													maxRange={90} />
											</span>
										</div>
									</div>
									:
									<div>
										<div onClick={this.show.bind(this, 'showWaterThermostat')}>Water Thermostat</div>
									</div>
								}
							</div>

							<div styleName={ this.state.showPhCal ? 'graphContainerExpanded' : 'graphContainer'}>
								{ this.state.showPhCal
									?
									<div>
										<div onClick={this.show.bind(this, 'showPhCal')}>pH Calibration</div>
										<span styleName="setThemeContainer">
											<div
												styleName="phLow"
												onClick={this.setPhPoint.bind(this, 'ph4')}
											>
												<b>4.0</b>
											</div>
											<div
												styleName="phNeutral"
												onClick={this.setPhPoint.bind(this, 'ph7')}
											>
												<b>7.0</b>
											</div>
											<div
												styleName="phHigh"
												onClick={this.setPhPoint.bind(this, 'ph10')}
											>
												<b>10.0</b>
											</div>
										</span>
									</div>
									:
									<div>
										<div onClick={this.show.bind(this, 'showPhCal')}>pH Calibration</div>
									</div>
								}
							</div>

							<div styleName={ this.state.showLight ? 'graphContainerExpanded' : 'graphContainer'}>
								{ this.state.showLight
									?
									<div>
										<div onClick={this.show.bind(this, 'showLight')}>Light</div>
											{ this.state.light.timer
												?
												<div>
												<span styleName="sensorValues">
													<div styleName="switchWrapper">
														<div styleName="label">Timer</div>
														<ToggleSwitch
															isOn={this.state.light.timer}
															onChange={this.handleLightToggleInput.bind(this, 'timer')}
															showLabels={false}/>
													</div>
													<div styleName="switchWrapper">
														<div styleName="label">Bloom</div>
														<ToggleSwitch
															isOn={this.state.light['bloom']}
															onChange={this.handleLightToggleInput.bind(this, 'bloom')}
															showLabels={false}/>
													</div>
												</span>
												<span styleName="sensorValues">
													<Form
														fields={{time: {
															type: 'one-of',
															label: 'On Time',
															value_options: TIMES.map((time) => ({
																value: time.id,
																label: time.name
															}))
														}}}
														values={{time: this.state.light.on}}
														onSaveableChange={this.handleLightTimeChange.bind(this, 'on')} />
													<Form
														fields={{time: {
															type: 'one-of',
															label: 'Off Time',
															value_options: TIMES.map((time) => ({
																value: time.id,
																label: time.name
															}))
														}}}
														values={{time: this.state.light.off}}
														onSaveableChange={this.handleLightTimeChange.bind(this, 'off')} />
												</span>
												</div>
												:
												<span styleName="sensorValues">
													<div styleName="switchWrapper">
														<div styleName="label">Timer</div>
														<ToggleSwitch
															isOn={this.state.light.timer}
															onChange={this.handleLightToggleInput.bind(this, 'timer')}
															showLabels={false}/>
													</div>
													<div styleName="switchWrapper">
														<div styleName="label">Grow</div>
														<ToggleSwitch
															isOn={this.state.light['grow']}
															onChange={this.handleLightToggleInput.bind(this, 'grow')}
															showLabels={false}/>
													</div>
													<div styleName="switchWrapper">
														<div styleName="label">Bloom</div>
														<ToggleSwitch
															isOn={this.state.light['bloom']}
															onChange={this.handleLightToggleInput.bind(this, 'bloom')}
															showLabels={false}/>
													</div>
												</span>

											}
									</div>
									:
									<div>
										<div onClick={this.show.bind(this, 'showLight')}>Light</div>
									</div>
								}
							</div>

							{this.state.logsReady ?
								<div>

									<div styleName='sensorTitle'>Sensor Graphs</div>

									{this.state.sensorGraphs.map((item, index) => (
										<div
											styleName={ item.display ? 'graphContainerExpanded' : 'graphContainer'}
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
				<ServiceSettingsScreen service={this.props.service} path={this.props.match.path + GrowServiceDetails.settingsPath} />
				<Route render={() => <Redirect to={this.props.match.url} />} />
			</Switch>
		);
	}
}

GrowServiceDetails.settingsPath = '/service-settings';

GrowServiceDetails.propTypes = {
	service: PropTypes.object.isRequired,
	children: PropTypes.node,
	doAction: PropTypes.func,
	shouldShowSettingsButton: PropTypes.bool,
	shouldShowRoomField: PropTypes.bool,
	serviceType: PropTypes.string,
	match: PropTypes.object,
	logs: PropTypes.array.isRequired,
	fetchLog: PropTypes.func
};

GrowServiceDetails.defaultProps = {
	logs: [],
	fetchLog: () => { /* no-op */ }
};

const mapStateToProps = ({servicesList}, {match}) => {
		const service = getServiceById(servicesList, match.params.serviceId, false);

		return {
			service,
			logs: getDeviceLog(servicesList, service && service.id)
		};
	}

const mapDispatchToProps = (stateProps, {dispatch}, ownProps) => ({
	...ownProps,
	...stateProps,
	doAction: (serviceId, action) => dispatch(doServiceAction(serviceId, action)),
	fetchLog: (serviceId) => dispatch(fetchDeviceLog(serviceId))
});

export default compose(
	withRouter,
	connect(mapStateToProps, null, mapDispatchToProps)
)(GrowServiceDetails);
