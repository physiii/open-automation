import Immutable from 'immutable';

class AutomationRecord extends Immutable.Record({
	id: null,
	name: null,
	is_enabled: true,
	type: 'user',
	source: {web: true},
	user_editable: true,
	triggers: Immutable.List(),
	conditions: Immutable.List(),
	scenes: Immutable.List(),
	notifications: Immutable.List(),
	isUnsaved: false,
	error: null
}) {
	constructor (values = {}) {
		super({
			...values,
			triggers: Immutable.List(values.triggers),
			conditions: Immutable.List(values.conditions),
			scenes: Immutable.List(values.scenes),
			notifications: Immutable.List(values.notifications)
		});
	}

	set (key, value) {
		let _value;

		switch (key) {
			case 'triggers':
			case 'conditions':
			case 'scenes':
			case 'notifications':
				_value = Immutable.List(value);
				break;
			default:
				_value = value;
				break;
		}

		return super.set(key, _value);
	}
}

export default AutomationRecord;
