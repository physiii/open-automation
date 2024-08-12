const Service = require('./service.js');

class MotionService extends Service {}

MotionService.type = 'motion';
MotionService.friendly_type = 'Motion Sensor';
MotionService.indefinite_article = 'A';

module.exports = MotionService;
