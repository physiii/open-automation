import Immutable from 'immutable';

// The ServiceRecord defines the fields of services and their default values.
const ServiceRecord = (defaultValues) => class extends Immutable.Record({
	id: null,
	type: null,
	device_id: null,
	...defaultValues,
	settings: Immutable.Map({
		...defaultValues.settings
	}),
	state: Immutable.Map({
		...defaultValues.state
	})
}) {};

export default ServiceRecord;
