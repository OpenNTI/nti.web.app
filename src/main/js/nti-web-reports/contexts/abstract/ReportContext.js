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
	 * 	description: String
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
	 * 	context: ReportContext (instance of this class)
	 * }
	 *
	 * @type {Array}
	 */
	subContexts = []


	/**
	 * How to group the reports
	 *
	 * Items should look like :
	 *
	 * {
	 * 	name: String,
	 * 	rels: [String]
	 * }
	 *
	 * @type {Array}
	 */
	groups = []


	canAccessReports () {
		//For now assume that if the context has any Reports you can access all the reports
		return this.context && this.context.Reports && this.context.Reports.length;
	}


	getReports () {
		if (!this.canAccessReports()) { return []; }

		const {reports} = this;
		const subReports = this.getSubContextReports();

		return [...reports, ...subReports];
	}

	getSubContextReports () {
		const {subContexts} = this;

		let reports = [];

		for (let subContext of subContexts) {
			const subReports = subContext.reports;

			reports = reports.concat(subReports.map(subReport => ({...subReport, context: subContext.name})));
		}

		return reports;
	}
}
