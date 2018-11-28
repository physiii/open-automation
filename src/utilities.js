import Immutable from 'immutable';

export const isEmpty = (value) => {
		if (typeof value === 'number') {
			if (Object.is(value, NaN)) {
				return true;
			}

			return false;
		}

		if (typeof value === 'boolean') {
			return false;
		}

		if (typeof value === 'undefined' || value === null) {
			return true;
		}

		// Arrays and strings.
		if (typeof value.length !== 'undefined' && value.length === 0) {
			return true;
		}
	},
	formatUsd = Intl
		? new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0
		}).format
		: (number) => number, // Fallback if Internationalization API isn't available.
	getUniqueId = (() => {
		let count = 0;

		return () => 'id' + (count += 1);
	})(),
	immutableMapFromArray = (array = [], mapper, mapClass = Immutable.Map) => {
		return mapClass(array.map((item) => [
			item.id,
			typeof mapper === 'function' ? mapper(item) : item
		]));
	},
	immutableOrderedMapFromArray = (array, mapper) => {
		return immutableMapFromArray(array, mapper, Immutable.OrderedMap);
	};
