import Immutable from 'immutable';

class RoomRecord extends Immutable.Record({
	id: null,
	name: null,
	isUnsaved: false
}) {}

export default RoomRecord;
