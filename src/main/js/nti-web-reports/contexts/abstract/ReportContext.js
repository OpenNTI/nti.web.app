import ReportStore from './ReportStore';

export default class ReportContext {
	constructor (object) {
		this.context = object;
	}

	/**
	 * The list of known reports on this context
	 *
	 * Items should look like:
	 *
	 * {
	 * 	rel: String,
	 * 	name: String,
	 * 	description: String,
	 * 	supported_types: []
	 * }
	 *
	 * @type {Array}
	 */
	reports = []

	/**
	 * The list of subContext under this context
	 *
	 * Items should look like:
	 *
	 * {
	 * 	name: String,
	 * 	context: ReportContext (instance of this class),
	 * 	store: Store to load the items for this context
	 * }
	 *
	 * @type {Array}
	 */
	subContexts = []


	/**
	 * How to group/order reports the reports
	 *
	 * Items should look like :
	 *
	 * {
	 * 	name: String,
	 * 	rels: [String] //in the order they should appear
	 * }
	 *
	 * @type {Array}
	 */
	groups = []


	canAccessReports () {
		//For now assume that if the context has any Reports you can access all the reports
		return this.context && this.context.Reports && this.context.Reports.length;
	}


	getReportGroups () {
		if (!this.canAccessReports()) { return []; }

		const {groups} = this;
		const reports = this.getContextReports();
		const subReports = this.getSubContextReports();

		const reportMap = ([...reports, ...subReports]).reduce((acc, report) => {
			acc[report.rel] = report;
			return acc;
		}, {});

		let groupedReports = [];

		for (let group of groups) {
			groupedReports.push({
				name: group.name,
				reports: group.rels.map(rel => reportMap[rel])
			});
		}

		return groupedReports;
	}


	getContextReports () {
		const {reports, context} = this;
		const contextReports = context.Reports.reduce((acc, report) => {
			acc[report.rel] = report;
			return acc;
		}, {});

		return reports.map((report) => {
			const contextReport = contextReports[report.rel];

			return {
				name: report.name,
				description: report.description,
				'supported_types': report.supported_types,
				store: new ReportStore(contextReport)
			};
		});
	}

	getSubContextReports () {
		const {subContexts} = this;

		let reports = [];

		for (let subContext of subContexts) {
			const subReports = subContext.reports;

			reports = reports.concat(subReports.map(subReport => ({...subReport, context: subContext})));
		}

		return reports;
	}
}
