const getServices = (servicesList, toJs = true) => {
		const services = servicesList.get('services');

		return toJs ? services.toList().toJS() : services;
	},
	getServicesByType = (servicesList, type, toJs = true) => {
		const gatewayServices = servicesList.get('services').filter((service) => service.type === type);

		return toJs ? gatewayServices.toList().toJS() : gatewayServices;
	},
	getServiceById = (serviceId, servicesList, toJs = true) => {
		const service = servicesList.getIn(['services', serviceId]);

		if (!service) {
			return;
		}

		return toJs ? service.toJS() : service;
	},
	getServiceNameById = (serviceId, servicesList) => getServiceById(serviceId, servicesList).settings.name,
	cameraGetRecordings = (cameraService, toJs = true) => {
		if (!cameraService) {
			return;
		}

		const recordings = cameraService.recordingsList.get('recordings');

		return toJs ? recordings.toList().toJS() : recordings;
	},
	cameraGetRecordingsByDate = (cameraService, date, toJs = true) => {
		if (!cameraService) {
			return;
		}

		// Make sure date is a valid moment date.
		if (!date || !date.isValid || !date.isValid()) {
			return;
		}

		const recordings = cameraService.recordingsList.get('recordings').filter((recording) => date.isSame(recording.date, 'day'));

		return toJs ? recordings.toList().toJS() : recordings;
	},
	cameraGetRecordingById = (cameraService, recordingId) => {
		if (!cameraService) {
			return;
		}

		return cameraService.recordingsList.getIn(['recordings', recordingId]);
	},
	cameraIsRecordingsListLoading = (cameraService) => {
		return cameraService.recordingsList.get('loading');
	},
	hasInitialFetchCompleted = (servicesList) => {
		return servicesList.get('fetched');
	};

export {
	getServices,
	getServicesByType,
	getServiceById,
	getServiceNameById,
	cameraGetRecordings,
	cameraGetRecordingsByDate,
	cameraGetRecordingById,
	cameraIsRecordingsListLoading,
	hasInitialFetchCompleted
};
