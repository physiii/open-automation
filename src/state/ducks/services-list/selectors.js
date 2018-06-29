const servicesWithoutGateways = (servicesList) => {
		return servicesList.services.toList().filter((service) => service.type !== 'gateway');
	},
	gatewayServices = (servicesList) => {
		return servicesList.services.toList().filter((service) => service.type === 'gateway');
	},
	serviceById = (serviceId, servicesList) => {
		return servicesList.services.get(serviceId);
	},
	recordingsForDate = (cameraService, date) => {
		return cameraService.recordingsList.recordings.toList().filter((recording) => date.isSame(recording.date, 'day'));
	},
	recordingById = (cameraService, recordingId) => {
		return cameraService.recordingsList.recordings.get(recordingId);
	},
	cameraRecordingsDateGrouped = (cameraService) => {
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
		return servicesList.fetched;
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
