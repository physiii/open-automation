const Service = require('./service.js');

class GrowPodService extends Service {}

GrowPodService.type = 'grow-pod';
GrowPodService.friendly_type = 'GrowPod';
GrowPodService.indefinite_article = 'A';

module.exports = GrowPodService;
