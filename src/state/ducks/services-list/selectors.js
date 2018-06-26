const servicesWithoutGateways = (servicesList) => {
		return servicesList.services.filter((service) => service.type !== 'gateway');
	},
	gatewayServices = (servicesList) => {
		return servicesList.services ? servicesList.services.filter((service) => service.type === 'gateway') : [];
	},
	serviceById = (serviceId, servicesList) => {
		return servicesList.services.find((service) => service.id === serviceId);
	},
	recordingsForDate = (cameraService, date) => {
		if (!cameraService.recordingsList || !cameraService.recordingsList.recordings) {
			return null;
		}

		return cameraService.recordingsList.recordings.filter((recording) => date.isSame(recording.date, 'day'));
	},
	recordingById = (cameraService, recordingId) => {
		if (!cameraService.recordingsList || !cameraService.recordingsList.recordings) {
			return null;
		}

		return cameraService.recordingsList.recordings.find((recording) => recording.id === recordingId);
	},
	cameraRecordingsDateGrouped = (cameraService) => {
		if (!cameraService.recordingsList || !cameraService.recordingsList.recordings) {
			return null;
		}

		// Group by year
		let recordings = cameraService.recordingsList.recordings.groupBy((recording) => new Date(recording.date).getFullYear()).toOrderedMap();

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
	hasInitialFetchCompleted = (servicesList) => {
		return Boolean(servicesList.services);
	};

export {
	servicesWithoutGateways,
	gatewayServices,
	serviceById,
	recordingsForDate,
	recordingById,
	cameraRecordingsDateGrouped,
	hasInitialFetchCompleted
};
