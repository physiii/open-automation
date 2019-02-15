import Immutable from 'immutable';

class DeviceRecord extends Immutable.Record({
	id: null,
	account_id: null,
	gateway_id: null,
	services: Immutable.OrderedMap({}),
	settings_definitions: Immutable.OrderedMap({}),
	settings: Immutable.Map({}),
	room_id: null,
	info: Immutable.Map({}),
	state: Immutable.Map({}),
	error: null
}) {
	constructor (values) {
		super({
			...values,
			services: Immutable.OrderedMap(values.services.map(({id, type}) => [
				id,
				{id, type}
			])),
			settings_definitions: Immutable.OrderedMap(values.settings_definitions),
			settings: Immutable.Map(values.settings),
			state: Immutable.Map(values.state)
		});
	}

	set (key, value) {
		let _value;

		switch (key) {
			case 'settings':
			case 'state':
				_value = Immutable.Map(value);
				break;
			case 'settings_definitions':
				_value = Immutable.OrderedMap(value);
				break;
			default:
				_value = value;
				break;
		}

		return super.set(key, _value);
	}
}

export default DeviceRecord;
