const GenericServiceAdapter = require('./service-adapter.js'),
	utils = require('../../../../utils.js'),
	moment = require('moment'),
	crypto = require('crypto'),
	LEVEL_SCALE = 255;

class GenericDimmerAdapter extends GenericServiceAdapter {
	_adaptState (state) {
		return GenericServiceAdapter.prototype._adaptState.call(this, {
			...state,
			level: this._adaptLevelToRelay(state.level)
		});
	}

	_adaptSocketEmit (event, data, callback) {
		const adapted_data = {...data};
		let should_emit = true;

		// TODO: Validate action values. If error, callback and set should_emit false.

		switch (event) {
			case 'action':
				if (data.property === 'level') {
					adapted_data.value = this._adaptLevelToDevice(data.value);
				}
				break;
			case 'settings':
				should_emit = false;
				this._sendSchedules(data.schedule).then(() => callback()).catch(callback);
				break;
		}

		return GenericServiceAdapter.prototype._adaptSocketEmit.call(this, event, adapted_data, callback, should_emit);
	}

	_adaptLevelToDevice (level) {
		// Convert 0-1 percentage scale to value range of the level property on the device.
		return Math.round(level * LEVEL_SCALE);
	}

	_adaptLevelToRelay (level) {
		// Convert level property to a percentage between 0 and 1.
		return Math.round((level / LEVEL_SCALE) * 100) / 100;
	}

	_sendSchedules (new_schedules) {
		return new Promise((resolve, reject) => {
			this._events.emit(this._getPrefixedEvent('settings/get'), (error, {settings}) => {
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

				// Send the changes to the device.
				for (const {seconds_into_day, level, on, should_add, should_delete} of schedule_changes) {
					if (device_errored) {
						return;
					}

					const schedule_id = this._getScheduleId(seconds_into_day, level, on),
						payload = {
							service_id: this.generic_id,
							schedule_id
						};

					schedule_change_callback_status[schedule_id] = false;

					if (should_add) {
						payload.action = 'add';
						payload.seconds_into_day = seconds_into_day;
						payload.state = {on, level};
					} else if (should_delete) {
						payload.action = 'delete';
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

						const callback_statues = Object.values(schedule_change_callback_status),
							all_changes_successful = callback_statues.every((value) => value === true);

						if (callback_statues.length === schedule_changes.length && all_changes_successful) {
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

			if (utils.isEmpty(schedule.time) || utils.isEmpty(schedule.level) || !time.isValid()) {
				validation_passed = false;
				return;
			}

			return {
				seconds_into_day: moment.duration(time.diff(time.clone().startOf('day'))).asSeconds(),
				level: this._adaptLevelToDevice(schedule.level),
				on: true,
				should_add: added_or_removed === 'added',
				should_delete: added_or_removed === 'removed'
			};
		});

		return validation_passed && adapted_schedules;
	}

	_filterSchedules (existing_schedules = [], new_schedules = [], find_which_schedules) {
		let schedules_to_filter = find_added_schedules ? new_schedules : existing_schedules,
			schedules_to_compare = find_added_schedules ? existing_schedules : new_schedules;

		if (find_which_schedules === 'added') {
			schedules_to_filter = new_schedules;
			schedules_to_compare = existing_schedules;
		} else if (find_which_schedules === 'removed') {
			schedules_to_filter = existing_schedules;
			schedules_to_compare = new_schedules;
		} else {
			return;
		}

		return schedules_to_filter.filter((filter_schedule) => {
			return !schedules_to_compare.find((compare_schedule) => {
				return compare_schedule.time === filter_schedule.time &&
					compare_schedule.level === filter_schedule.level &&
					compare_schedule.on === filter_schedule.on;
			});
		});
	}

	_getScheduleId (time, level, on) {
		return crypto.createHash('md5').update(String(time) + String(level) + String(on)).digest('hex');
	}
};

GenericDimmerAdapter.generic_type = 'dimmer';
GenericDimmerAdapter.relay_type = 'dimmer';
GenericDimmerAdapter.settings_definitions = new Map([...GenericServiceAdapter.settings_definitions])
	.set('schedule', {
		type: 'list-of',
		label: 'Schedule',
		item_fields: new Map()
			.set('time', {
				type: 'time-of-day',
				label: 'Time',
				validation: {is_required: true}
			})
			.set('level', {
				type: 'percentage',
				label: 'Level',
				validation: {is_required: true}
			}),
		default_value: 0,
		validation: {is_required: false}
	});

module.exports = GenericDimmerAdapter;
