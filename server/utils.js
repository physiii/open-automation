module.exports = {
	onChange: (object, onChange) => {
		const handler = {
			get (target, property, receiver) {
				let value = target[property];

				const tag = Object.prototype.toString.call(value),
					shouldBindProperty = (property !== 'constructor') && (
						tag === '[object Function]' ||
						tag === '[object AsyncFunction]' ||
						tag === '[object GeneratorFunction]'
					);

				if (shouldBindProperty) {
					value = value.bind(target);
				}

				try {
					return new Proxy(value, handler);
				} catch (err) {
					return Reflect.get(target, property, receiver);
				}
			},
			defineProperty (target, property, descriptor) {
				const result = Reflect.defineProperty(target, property, descriptor);
				onChange();
				return result;
			},
			deleteProperty (target, property) {
				const result = Reflect.deleteProperty(target, property);
				onChange();
				return result;
			}
		};

		return new Proxy(object, handler);
	},
	stripHtml: (string = '') => {
		return string.replace(/(<([^>]+)>)/ig, '');
	},
	isValidRgbArray: (array) => {
		if (!Array.isArray(array)) return false;
		if (array.length !== 3) return false;
		if (typeof array[0] !== 'number') return false;
		if (typeof array[1] !== 'number') return false;
		if (typeof array[2] !== 'number') return false;
		if (array[0] < 0 || array[0] > 255) return false;
		if (array[1] < 0 || array[1] > 255) return false;
		if (array[2] < 0 || array[2] > 255) return false;

		return true;
	},
	isValidPercentage: (number, scale = 1) => {
		return typeof number === 'number' && number >= 0 && number <= scale;
	}
};
