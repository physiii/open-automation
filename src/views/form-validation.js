export default class FormValidator {
	constructor (state) {
		this.validations = {};
		this.errors = {};
		this.setState(state);
	}

	setState (state) {
		this.state = state;
	}

	validateForm (state = this.state) {
		this.errors = Object.keys(this.validations).reduce((errors, name) => {
			const validate = this.validations[name];

			return {
				...errors,
				[name]: validate(state)
			};
		}, {});

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

	hasErrors () {
		return Object.keys(this.errors).some((name) => this.errors[name]);
	}
}

// Validation Rules
export const required = (value, label) => {
		return value ? null : label + ' is required';
	},
	decimal = (value, label) => Number.isFinite(value) ? null : label + ' must be a number',
	integer = (value, label) => Number.isInteger(value) ? null : label + ' must be a whole number',
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
	mustMatch = (fieldToMatch, fieldToMatchLabel) => (value, label, state) => {
		return value === state[fieldToMatch] ? null : label + ' must match ' + fieldToMatchLabel;
	},
	isEmail = (value, label) => {
		const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line no-useless-escape

		return emailRegex.test(value) ? null : label + ' must be a valid email address';
	};

const ruleNameToFunctionMap = {
	'decimal': () => decimal,
	'integer': () => integer,
	'is_required': (isRequired) => isRequired ? required : () => null,
	min,
	max,
	'min_length': minLength,
	'max_length': maxLength
};
