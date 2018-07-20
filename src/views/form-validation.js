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

	validateField (name, event, value) {
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
		this.validations[name] = (state) => {
			for (const validateRule of rules) {
				const errorMessage = validateRule(state[name], label, state);

				if (errorMessage) {
					return errorMessage;
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
	minLength = (minimumLength) => (value, label) => {
		return value.length >= minimumLength ? null : label + ' must be at least ' + minimumLength + ' characters';
	},
	mustMatch = (fieldToMatch, fieldToMatchLabel) => (value, label, state) => {
		return value === state[fieldToMatch] ? null : label + ' must match ' + fieldToMatchLabel;
	},
	isEmail = (value, label) => {
		const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line no-useless-escape

		return emailRegex.test(value) ? null : label + ' must be a valid email address';
	};
