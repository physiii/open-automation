const Service = require('./service.js');

class DimmerService extends Service {}

DimmerService.type = 'dimmer';
DimmerService.friendly_type = 'Dimmer';
DimmerService.indefinite_article = 'A';

module.exports = DimmerService;
