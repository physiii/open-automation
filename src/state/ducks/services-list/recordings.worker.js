onmessage = (message) => {
	if (!Array.isArray(message.data.recordings)) {
		return;
	}

	const recordingsDateIndex = new Map(),
		datesOfRecordings = new Map();

	message.data.recordings.forEach((recording) => {
		const date = new Date(recording.date),
			month = date.getFullYear() + '-' + (date.getMonth() + 1),
			day = date.getDate(),
			dateKey = month + '-' + day,
			recordingsForDate = recordingsDateIndex.get(dateKey),
			datesForMonth = datesOfRecordings.get(month);

		if (recordingsForDate) {
			recordingsForDate.add(recording.id);
		} else {
			recordingsDateIndex.set(dateKey, new Set([recording.id]));
		}

		if (datesForMonth) {
			datesForMonth.add(day);
		} else {
			datesOfRecordings.set(month, new Set([day]));
		}
	});

	postMessage({
		dateIndex: recordingsDateIndex,
		dates: datesOfRecordings
	});
};
