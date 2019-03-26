import Immutable from 'immutable';

class DeviceRecord extends Immutable.Record({
	id: null,
	name: null,
	isUnsaved: false
}) {}

export default DeviceRecord;
