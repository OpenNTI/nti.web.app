import {getService} from 'nti-web-client';

const ALL_REPORTS_LINK = '/dataserver2/reporting/reports';

let ALL_REPORTS = null;

export default async function getAllReports () {
	if (ALL_REPORTS) { return ALL_REPORTS; }

	try {
		const service = await getService();
		ALL_REPORTS = await service.getBatch(ALL_REPORTS_LINK);

		return ALL_REPORTS.Items;
	} catch (e) {
		return [];
	}
}
