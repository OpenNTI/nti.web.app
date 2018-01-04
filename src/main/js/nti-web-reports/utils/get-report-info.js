import {getService} from 'nti-web-client';

const ALL_REPORTS_LINK = '/dataserver2/reporting/reports';

let ALL_REPORTS = null;

async function getAllReports () {
	if (ALL_REPORTS) { return ALL_REPORTS; }

	const service = await getService();

	ALL_REPORTS = service.get(ALL_REPORTS_LINK);
	return ALL_REPORTS;
}

export default async function getReportInfo (rel) {
	try {
		const reports = await getAllReports();

		for (let report of reports) {
			if (report.rel === rel) {
				return report;
			}
		}

		throw new Error('Report not found');
	} catch (e) {
		throw new Error('Unable to find info for report');
	}
}
