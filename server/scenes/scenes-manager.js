const database = require('../database.js'),
	Scene = require('./scene.js'),
	DevicesManager = require('../devices/devices-manager.js'),
	scenes_list = new Map(),
	TAG = '[SceneManager]';

class SceneManager {
	constructor () {
		this.init = this.init.bind(this);
	}

	init () {
		return this.loadScenesFromDb();
	}

	setScene (scene_id, account_id, fallback_values = {}) {
		const scene = this.getSceneById(scene_id, account_id);

		if (!scene) {
			console.error(TAG, 'Tried to set scene ' + scene_id + ', but scene was not found or it does not belong to the account.');
			return;
		}

		scene.actions.forEach((action) => {
			const service = DevicesManager.getServiceById(action.service_id, scene.account_id);

			if (!service) {
				console.error(TAG, 'Tried to set an action for scene ' + scene_id + ', but the service was not found or it does not belong to the account.');
				return;
			}

			const action_fallback_values = fallback_values[service.constructor.type] || {};

			let value = action.value;

			// If there's no value for the action, use the fallback value.
			if (!action.hasOwnProperty('value')) {
				value = action_fallback_values[action.property];
			}

			service.action({...action, value});
		});
	}

	addScene (data) {
		let scene = this.getSceneById(data.id, null, true);

		if (scene) {
			return scene;
		}

		scene = new Scene(data);
		scenes_list.set(scene.id, scene);
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

	// NOTE: Use skip_account_access_check with caution. Never use for requests
	// originating from the client API.
	getSceneById (scene_id, account_id, skip_account_access_check) {
		const scene = scenes_list.get(scene_id);

		// Verify account has the access to the scene.
		if ((scene && (scene.account_id === account_id)) || skip_account_access_check) {
			return scene;
		}
	}

	loadScenesFromDb () {
		return new Promise((resolve, reject) => {
			database.getScenes().then((scenes) => {
				scenes_list.clear();

				scenes.forEach((scene) => {
					this.addScene(scene)
				});

				resolve(scenes_list);
			}).catch(reject);
		});
	}
}

module.exports = new SceneManager();
