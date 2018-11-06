const Service = require('./service.js'),
	TAG = '[DimmerService]';

class DimmerService extends Service {}

DimmerService.type = 'dimmer';
DimmerService.friendly_type = 'Dimmer';
DimmerService.indefinite_article = 'A';

module.exports = DimmerService;
