import Immutable from 'immutable';

// The ServiceRecord defines the fields of services and their default values.
const ServiceRecord = (defaultValues = {}) => class extends Immutable.Record({
		id: null,
		type: null,
		device_id: null,
		error: null,
		settings: null,
		state: null,
		settings_definitions: null,
		strings: null,
		...defaultValues
	}) {
		constructor (values) {
			super({
				...defaultValues,
				...values,
				settings_definitions: Immutable.Map(values.settings_definitions),
				settings: getMapWithDefaults(defaultValues.settings, values.settings),
				state: getMapWithDefaults(defaultValues.state, values.state),
				strings: Immutable.Map(values.strings)
			});
		}

		set (key, value) {
			let _value;

			switch (key) {
				case 'settings':
				case 'state':
					_value = getMapWithDefaults(defaultValues[key], value);
					break;
				case 'settings_definitions':
					_value = Immutable.Map(value);
					break;
				default:
					_value = value;
					break;
			}

			return super.set(key, _value || defaultValues[key]);
		}
	},
	getMapWithDefaults = (defaults, values) => Immutable.Map({
		...defaults,
		...Immutable.Map.isMap(values) ? values.toObject() : values
	});

export default ServiceRecord;
