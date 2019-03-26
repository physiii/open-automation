const Service = require('./service.js'),
	TAG = '[GameMachineService]';

class GameMachineService extends Service {}

GameMachineService.type = 'game-machine';
GameMachineService.friendly_type = 'Game Machine';
GameMachineService.indefinite_article = 'A';

module.exports = GameMachineService;
