const GenericServiceAdapter = require('./service-adapter.js'),
	LEVEL_SCALE = 255;

class GenericDimmerAdapter extends GenericServiceAdapter {
	_adaptState (state) {
		return GenericServiceAdapter.prototype._adaptState.call(this, {
			...state,
			// Convert level property to a percentage between 0 and 1.
			level: Math.round((state.level / LEVEL_SCALE) * 100) / 100
		});
	}

	_adaptSocketEmit (event, data, callback) {
		const adapted_data = {...data};

		if (event === 'action' && data.property === 'level') {
			// Convert 0-1 percentage scale to value range of the level property on the device.
			adapted_data.value = Math.round(data.value * LEVEL_SCALE);
		}

		return GenericServiceAdapter.prototype._adaptSocketEmit.call(this, event, adapted_data, callback);
	}
};

GenericDimmerAdapter.generic_type = 'dimmer';
GenericDimmerAdapter.relay_type = 'dimmer';

module.exports = GenericDimmerAdapter;
