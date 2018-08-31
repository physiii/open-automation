const Service = require('./service.js'),
	TAG = '[SirenService]';

class SirenService extends Service {}

SirenService.type = 'siren';
SirenService.friendly_type = 'Siren';
SirenService.indefinite_article = 'A';

module.exports = SirenService;
