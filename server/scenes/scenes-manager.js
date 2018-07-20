//Placehold Scene-manager
const database = require('../database.js'),
	Scene = require('./scene.js'),
	DevicesManager = require('../devices/devices-manager.js'),
	scenesList = new Map(),
	TAG = '[SceneManager]';


class SceneManager {
	constructor () {

	}

	runAutomation(sceneId) {
		const scene = this.getSceneById(sceneId),
			account = scene.account_id;

		for (let i = 0; i < scene.actions.length; i++) {
			let service_id = scene.actions[i].service_id,
		 		service = DevicesManager.getServiceById(service_id, account, true);

			service.action(scene.actions[i]);
		};
	}

	getSceneById (sceneId, accountId, skipAccountAccessCheck) {
		const scene = scenesList.get(sceneId);

		//Verify account has the access to the automations
		if ((scene && (scene.location === accountId)) || skipAccountAccessCheck) {
			return scene;
		}
	}

	addScene (data) {
		let scene = this.getSceneById(data.id,null,true);

		if (scene) {
			return scene;
		};
		scene = new Scene(data);
		scenesList.set(scene.id, scene);
		return scene;
	}

	createScene (data) {
		return new Promise((resolve, reject) => {
			const scene = this.addScene(data);

			database.saveScene(scene.serialize()).then(() => {
				resolve(scene);
			}).catch(reject);
		});
	}

	loadScenesFromDb () {
		return new Promise((resolve, reject) => {
			database.getScenes().then((scenes) => {
				scenesList.clear();

				scenes.forEach((scene) => {
					this.addScene(scene)
				});

				resolve(scenesList);
			}).catch((error) => {
				reject(error);
			});
		});
	}
}

module.exports = new SceneManager();
