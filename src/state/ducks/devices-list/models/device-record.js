import Immutable from 'immutable';

const DeviceRecord = Immutable.Record({
	id: null,
	account_id: null,
	services: Immutable.List([]),
	settings: Immutable.Map({}),
	info: Immutable.Map({}),
	state: Immutable.Map({})
});

export default DeviceRecord;
