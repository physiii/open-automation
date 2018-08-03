const getServices = (servicesList) => {
		return servicesList.services.toList();
	},
	getGatewayServices = (servicesList) => {
		return servicesList.services.toList().filter((service) => service.type === 'gateway');
	},
	getServiceById = (serviceId, servicesList) => {
		return servicesList.services.get(serviceId);
	},
	getRecordingsForDate = (cameraService, date) => {
		return cameraService.recordingsList.recordings.toList().filter((recording) => date.isSame(recording.date, 'day'));
	},
	getRecordingById = (cameraService, recordingId) => {
		return cameraService.recordingsList.recordings.get(recordingId);
	},
	hasInitialFetchCompleted = (servicesList) => {
		return servicesList.fetched;
	};

export {
	getServices,
	getGatewayServices,
	getServiceById,
	getRecordingsForDate,
	getRecordingById,
	hasInitialFetchCompleted
};
