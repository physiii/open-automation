import Immutable from 'immutable';

// The ServiceRecord defines the fields of services and their default values.
const ServiceRecord = (defaultValues = {}) => class extends Immutable.Record({
		id: null,
		type: null,
		device_id: null,
		device: null,
		error: null,
		settings_definitions: null,
		settings: null,
		state: null,
		logList: null,
		strings: null,
		event_definitions: null,
		action_definitions: null,
		automator_supported: false,
		...defaultValues
	}) {
		constructor (values) {
			const settings = mapWithDefaults(defaultValues.settings, values.settings);

			super({
				...defaultValues,
				...values,
				settings_definitions: hydrateSettingsDefinitions(values.settings_definitions, settings),
				settings,
				state: mapWithDefaults(defaultValues.state, values.state),
				strings: Immutable.Map(values.strings),
				event_definitions: Immutable.OrderedMap(values.event_definitions)
			});
		}

		set (key, value) {
			let _value;

			switch (key) {
				case 'settings':
				case 'state':
					_value = mapWithDefaults(defaultValues[key], value);
					break;
				case 'settings_definitions':
					_value = hydrateSettingsDefinitions(value, this.settings);
					break;
				case 'strings':
					_value = Immutable.Map(value);
					break;
				case 'event_definitions':
					_value = Immutable.OrderedMap(value);
					break;
				case 'action_definitions':
					_value = Immutable.OrderedMap(value);
					break;
				default:
					_value = value;
					break;
			}

			return super.set(key, _value || defaultValues[key]);
		}

		getEventLabel (event) {
			const definition = this.event_definitions && this.event_definitions.get(event);

			return definition ? definition.label : event || event;
		}
	},
	hydrateSettingsDefinitions = (definitions, settings) => Immutable.OrderedMap(definitions.map(([property, definition]) => {
		const hydratedDefinition = {...definition};

		if (definition.type === 'list-of') {
			hydratedDefinition.item_properties = Immutable.OrderedMap(hydratedDefinition.item_properties);
		}

		// If the service already has a name, name is a required field (can't be deleted).
		if (property === 'name' && settings.get('name')) {
			hydratedDefinition.validation = {
				...hydratedDefinition.validation,
				is_required: true
			};
		}

		return [property, hydratedDefinition];
	})),
	mapWithDefaults = (defaults, values) => Immutable.Map({
		...defaults,
		...Immutable.Map.isMap(values) ? values.toObject() : values
	});

export default ServiceRecord;
