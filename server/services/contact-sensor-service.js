const Service = require('./service.js'),
	TAG = '[ContactSensorService]';

class ContactSensorService extends Service {}

ContactSensorService.type = 'contact-sensor';
ContactSensorService.friendly_type = 'Contact Sensor';
ContactSensorService.indefinite_article = 'A';

module.exports = ContactSensorService;
