const GenericServiceAdapter = require('./service-adapter.js'),
	utils = require('../../../../utils.js'),
	moment = require('moment'),
	crypto = require('crypto'),
	TAG = '[GenericButtonAdapter]',
	LEVEL_SCALE = 255;

class GenericButtonAdapter extends GenericServiceAdapter {
	_adaptState (state) {
		return GenericServiceAdapter.prototype._adaptState.call(this, {
			...state,
			mode: this._adaptModeToRelay(state.mode)
		});
	}

	_adaptSocketEmit (event, data, callback = () => { /* no-op */ }) {
		let adapted_data = {...data},
			adapted_event = event,
			adapted_callback = callback,
			should_emit = true;

		// TODO: Validate action values. If error, callback and set should_emit false.
		console.log(TAG,"_adaptSocketEmit",event,data);
		switch (event) {
			case 'action':
				if ('mode' === data.property) {
					adapted_event = 'button';
					adapted_data = {mode: this._adaptModeToDevice(data.value)};
				}
				break;
			case 'settings':
				if ('sensitivity' in data.settings) {
					adapted_event = 'button';
					adapted_data = {sensitivity: this._adaptModeToDevice(data.settings.sensitivity)};
				}
				if ('schedule' in data.settings) {
					this._sendSchedules(data.settings.schedule).then(() => callback()).catch((error) => {
						console.error(error);
						callback(error);
					});
				}
				break;
		}

		console.log("adapted_data: ", adapted_data);
		return GenericServiceAdapter.prototype._adaptSocketEmit.call(this, adapted_event, adapted_data, adapted_callback, should_emit);
	}

	_adaptModeToDevice (mode) {
		// Convert 0-1 percentage scale to value range of the mode property on the device.
		return Math.round(mode * LEVEL_SCALE);
	}

	_adaptModeToRelay (mode) {
		// Convert mode property to a percentage between 0 and 1.
		return Math.round((mode / LEVEL_SCALE) * 100) / 100;
	}

	_sendSchedules (new_schedules = []) {
		return new Promise((resolve, reject) => {
			this._events.emit(this._getPrefixedEvent('settings/get'), {}, (error, {settings}) => {
				if (error) {
					reject('Unable to save new settings.');
					return;
				}

				const schedule_change_callback_status = {},
					schedule_changes = this._getScheduleChanges(settings.schedule, new_schedules);
				let device_errored = false;

				// Validation failed?
				if (!schedule_changes) {
					reject('The values for the schedule settings are invalid.');
					return;
				}

				console.log(TAG,"_sendSchedules",settings);
				// No schedule changes.
				if (schedule_changes.length < 1) {
					resolve();
					// reject('Unable to save new settings!');
					return;
				}

				// Send the changes to the device.
				for (const {seconds_into_day, mode, on, should_add, should_delete} of schedule_changes) {
					if (device_errored) {
						return;
					}

					const schedule_id = this._getScheduleId(seconds_into_day, mode, on),
						payload = {
							service_id: this.generic_id,
							event_id: schedule_id
						};

					schedule_change_callback_status[schedule_id] = false;

					if (should_add) {
						payload.action = 'add';
						payload.seconds_into_day = seconds_into_day;
						payload.state = {on, mode};
					} else if (should_delete) {
						payload.action = 'remove';
					} else {
						break;
					}

					this.socket.emit('schedule', payload, (error) => {
						if (error) {
							device_errored = true;
							reject('Unable to save new settings.');
							return;
						}

						schedule_change_callback_status[schedule_id] = true;

						const callback_statuses = Object.values(schedule_change_callback_status),
							all_changes_successful = callback_statuses.every((value) => value === true);

						if (callback_statuses.length === schedule_changes.length && all_changes_successful) {
							resolve();
						}
					});
				};
			});
		});
	}

	_getScheduleChanges (existing_schedules = [], new_schedules = []) {
		let validation_passed = true;
		const schedules_to_add = this._adaptSchedules(this._filterSchedules(existing_schedules, new_schedules, 'added'), 'added'),
			schedules_to_delete = this._adaptSchedules(this._filterSchedules(existing_schedules, new_schedules, 'removed'), 'removed');

		// Validation failed?
		if (!schedules_to_add || !schedules_to_delete) {
			return false;
		}

		return [
			...schedules_to_add,
			...schedules_to_delete
		];
	}

	_adaptSchedules (schedules, added_or_removed) {
		let validation_passed = true;
		const adapted_schedules = schedules.map((schedule) => {
			const time = moment.utc(schedule.time);

			if (utils.isEmpty(schedule.time) || utils.isEmpty(schedule.mode) || !time.isValid()) {
				validation_passed = false;
				return;
			}

			return {
				seconds_into_day: moment.duration(time.diff(time.clone().startOf('day'))).asSeconds(),
				mode: this._adaptModeToDevice(schedule.mode),
				on: true,
				should_add: added_or_removed === 'added',
				should_delete: added_or_removed === 'removed'
			};
		});

		return validation_passed && adapted_schedules;
	}

	_filterSchedules (existing_schedules, new_schedules, find_which_schedules) {
		let schedules_to_filter,
			schedules_to_compare;

		if (find_which_schedules === 'added') {
			schedules_to_filter = new_schedules;
			schedules_to_compare = existing_schedules;
		} else if (find_which_schedules === 'removed') {
			schedules_to_filter = existing_schedules;
			schedules_to_compare = new_schedules;
		} else {
			return;
		}

		if (!Array.isArray(schedules_to_filter)) {
			schedules_to_filter = [];
		}

		if (!Array.isArray(schedules_to_compare)) {
			schedules_to_compare = [];
		}

		return schedules_to_filter.filter((filter_schedule) => {
			return !schedules_to_compare.find((compare_schedule) => {
				return compare_schedule.time === filter_schedule.time &&
					compare_schedule.mode === filter_schedule.mode &&
					compare_schedule.on === filter_schedule.on;
			});
		});
	}

	_getScheduleId (time, mode, on) {
		return crypto.createHash('md5').update(String(time) + String(mode) + String(on)).digest('hex').substring(0, 15);
	}
};

GenericButtonAdapter.generic_type = 'button';
GenericButtonAdapter.relay_type = 'button';
GenericButtonAdapter.settings_definitions = new Map([...GenericServiceAdapter.settings_definitions])
	.set('sensitivity', {
		type: 'percentage',
		label: 'Sensitivity',
		default_value: 0.5,
		validation: {is_required: true}
	})
	.set('show_on_dashboard', {
		type: 'boolean',
		label: 'Dashboard',
		default_value: true,
		validation: {is_required: true}
	})
	.set('schedule', {
		type: 'list-of',
		label: 'Schedule',
		item_properties: new Map()
			.set('time', {
				type: 'time-of-day',
				label: 'Time',
				default_value: '0001-01-01T12:00:00.000Z',
				validation: {is_required: true}
			})
			.set('mode', {
				type: 'percentage',
				label: 'Mode',
				default_value: 1,
				validation: {is_required: true}
			}),
		main_property: 'time',
		secondary_property: 'mode',
		sort_by: 'time',
		validation: {is_required: false}
	});

module.exports = GenericButtonAdapter;
