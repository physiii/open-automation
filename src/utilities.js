export const isEmpty = (value) => {
		if (typeof value === 'number' || typeof value === 'boolean') {
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
	getUniqueId = (() => {
		let count = 0;

		return () => 'id' + (count += 1);
	})();
