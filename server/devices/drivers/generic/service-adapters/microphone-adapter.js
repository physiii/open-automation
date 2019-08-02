const GenericServiceAdapter = require('./service-adapter.js'),
	TAG = '[GenericMicrophoneAdapter]',
	SENSITIVITY_SCALE = 255;

class GenericMicrophoneAdapter extends GenericServiceAdapter {
	_adaptSocketEmit (event, data, callback = () => { /* no-op */ }) {
		let adapted_data = {...data},
			adapted_event = event,
			adapted_callback = callback,
			should_emit = true;

		switch (event) {
			case 'settings':
				if ('sensitivity' in data.settings) {
					adapted_data.settings.sensitivity = this._adaptPercentageToDevice(data.settings.sensitivity, SENSITIVITY_SCALE);
				}
				break;
		}

		return GenericServiceAdapter.prototype._adaptSocketEmit.call(this, adapted_event, adapted_data, adapted_callback, should_emit);
	}
};

GenericMicrophoneAdapter.generic_type = 'microphone';
GenericMicrophoneAdapter.relay_type = 'microphone';
GenericMicrophoneAdapter.settings_definitions = new Map([...GenericServiceAdapter.settings_definitions])
	.set('sensitivity', {
		type: 'percentage',
		label: 'Sensitivity',
		default_value: 1,
		validation: {is_required: true}
	});

module.exports = GenericMicrophoneAdapter;
