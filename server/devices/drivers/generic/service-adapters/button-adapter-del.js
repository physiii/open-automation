const GenericServiceAdapter = require('./service-adapter.js'),
	utils = require('../../../../utils.js'),
	moment = require('moment'),
	crypto = require('crypto'),
	LEVEL_SCALE = 255;

class GenericButtonAdapter extends GenericServiceAdapter {
	_adaptState (state) {
		return GenericServiceAdapter.prototype._adaptState.call(this, {
			...state
		});
	}

	_adaptSocketEmit (event, data, callback = () => { /* no-op */ }) {
		let adapted_data = {...data},
			adapted_event = event,
			adapted_callback = callback,
			should_emit = true;

		// TODO: Validate action values. If error, callback and set should_emit false.

		switch (event) {
			case 'action':
				if (data.property === 'level') {
					adapted_event = 'button';
					adapted_data = {level: this._adaptLevelToDevice(data.value)};
				}
				break;
			case 'settings':
				should_emit = false;
				this._sendSchedules(data.settings.schedule).then(() => callback()).catch((error) => {
					console.error(error);
					callback(error);
				});
				break;
		}

		return GenericServiceAdapter.prototype._adaptSocketEmit.call(this, adapted_event, adapted_data, adapted_callback, should_emit);
	}

};

GenericButtonAdapter.generic_type = 'button';
GenericButtonAdapter.relay_type = 'button';
GenericButtonAdapter.settings_definitions = new Map([...GenericServiceAdapter.settings_definitions])
	.set('schedule', {
		main_property: 'time',
		secondary_property: 'level',
		sort_by: 'time',
		validation: {is_required: false}
	});

module.exports = GenericButtonAdapter;
