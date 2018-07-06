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
		const scene = this.getSceneById(sceneId);

		for (let i = 0; i < scene.actions.length; i++) {
			const action = scene.actions[i],
				service = DevicesManager.getServiceById(action.service_id);

			service.action(action.property, action.value);
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
		automation = new Scene(data);
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
