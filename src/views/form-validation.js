export default class FormValidator {
	constructor (state) {
		this.validations = {};
		this.errors = {};
		this.setState(state);
	}

	setState (state) {
		this.state = state;
	}

	getValidationErrors (state = this.state) {
		const errors = Object.keys(this.validations).reduce((_errors, name) => {
			const validate = this.validations[name];

			return {
				..._errors,
				[name]: validate(state)
			};
		}, {});

		return errors;
	}

	validateForm (state = this.state) {
		this.errors = this.getValidationErrors(state);

		return this.errors;
	}

	validateField (name, value, event) {
		const validate = this.validations[name];

		let error = validate({
			...this.state,
			[name]: value ? value : this.state[name]
		});

		// For change events, do not show a new error, only clear an existing error.
		if (event === 'change') {
			const existingError = this.errors[name],
				newError = error;

			error = newError !== existingError ? null : existingError;
		}

		this.errors = {
			...this.errors,
			[name]: error
		};

		return this.errors;
	}

	field (name, label, ...rules) {
		let _rules = rules;

		// Convert rules object to array of rule functions.
		if (rules[0] && typeof rules[0] !== 'function') {
			const rulesObject = rules[0] || {};

			_rules = Object.keys(rulesObject).map((rule) => {
				const ruleFunction = ruleNameToFunctionMap[rule] || (() => null);

				return ruleFunction(rulesObject[rule]);
			});
		}

		this.validations[name] = (state) => {
			// Skip validation for a property that's not required and has no value.
			if ((typeof state[name] === 'undefined' || state[name] === null) && !_rules.includes(required)) {
				return null;
			}

			for (const validateRule of _rules) {
				if (typeof validateRule === 'function') {
					const errorMessage = validateRule(state[name], label || name, state);

					if (errorMessage) {
						return errorMessage;
					}
				}
			}

			return null;
		};

		return this;
	}

	hasErrors (errors = this.errors) {
		return Object.keys(errors).some((name) => errors[name]);
	}
}

// Validation Rules
export const required = (value, label) => {
		return value ? null : label + ' is required';
	},
	decimal = (value, label) => Number.isFinite(value) ? null : label + ' must be a number',
	integer = (value, label) => Number.isInteger(value) ? null : label + ' must be a whole number',
	percentage = (value, label) => Number.isFinite(value) && value >= 0 && value <= 1 ? null : label + ' must be a percentage',
	min = (minimum) => (value, label) => {
		return value >= minimum ? null : label + ' must be at least ' + minimum;
	},
	max = (maximum) => (value, label) => {
		return value <= maximum ? null : label + ' must be no more than ' + maximum;
	},
	minLength = (minimumLength) => (value, label) => {
		return value.length >= minimumLength ? null : label + ' must be at least ' + minimumLength + ' characters';
	},
	maxLength = (maximumLength) => (value, label) => {
		return value.length <= maximumLength ? null : label + ' must be no more than ' + maximumLength + ' characters';
	},
	unique = ({values = [], message} = {}) => (value, label) => {
		return values.includes(value) ? message || label + ' must be unique' : null;
	},
	mustMatch = (fieldToMatch, fieldToMatchLabel) => (value, label, state) => {
		return value === state[fieldToMatch] ? null : label + ' must match ' + fieldToMatchLabel;
	},
	email = (value, label) => {
		const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line no-useless-escape

		return emailRegex.test(value) ? null : label + ' must be a valid email address';
	};

const ruleNameToFunctionMap = {
	'decimal': () => decimal,
	'integer': () => integer,
	'time-of-day': () => () => null,
	'is_required': (isRequired) => isRequired ? required : () => null,
	'is_email': (isEmail) => isEmail ? email : () => null,
	min,
	max,
	'min_length': minLength,
	'max_length': maxLength,
	unique
};
