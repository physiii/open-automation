const devicesWithoutGateways = (devicesList) => {
		return devicesList.devices.filter((device) => device.type !== 'gateway');
	},
	deviceById = (deviceId, devicesList) => {
		return devicesList.devices.find((device) => device.id === deviceId);
	},
	cameraRecordingsDateGrouped = (camera) => {
		if (!camera.recordingsList.recordings) {
			return null;
		}

		// Group by year
		let recordings = camera.recordingsList.recordings.groupBy((recording) => new Date(recording.date).getFullYear()).toOrderedMap();

		// Group by month and date
		recordings.forEach((year, yearKey) => {
			recordings = recordings.set(
				yearKey,
				year.groupBy((recording) => new Date(recording.date).getMonth()).toOrderedMap()
			);

			// Group by date
			recordings.get(yearKey).forEach((month, monthKey) => {
				recordings = recordings.setIn(
					[
						yearKey,
						monthKey
					],
					month.groupBy((recording) => new Date(recording.date).getDate()).toOrderedMap()
				);
			});
		});

		return recordings;
	},
	hasInitialFetchCompleted = (devicesList) => {
		return Boolean(devicesList.devices);
	};

export {
	devicesWithoutGateways,
	deviceById,
	cameraRecordingsDateGrouped,
	hasInitialFetchCompleted
};
