import Immutable from 'immutable';

const DeviceRecord = Immutable.Record({
	id: null,
	location_id: null,
	services: Immutable.List([]),
	settings: Immutable.Map({}),
	info: Immutable.Map({})
});

export default DeviceRecord;
