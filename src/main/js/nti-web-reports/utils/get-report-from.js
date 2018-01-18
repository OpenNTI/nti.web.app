export default function getReportFrom (rel, context) {
	const reports = (context && context.Reports) || [];

	for (let report of reports) {
		if (report.rel === rel) {
			return report;
		}
	}
}
