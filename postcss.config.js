const autoprefixer = require('autoprefixer'),
	icssValues = require('postcss-icss-values');

module.exports = {
	plugins: [
		autoprefixer,
		icssValues
	]
};
