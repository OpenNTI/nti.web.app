import {getReports} from '../../utils';

function getReportKey (rel, contextID) {
	return `${rel}-${contextID || ''}`;
}


export default class ReportContext {
	constructor (object) {
		this.context = object;
	}


	/**
	 * A map of contexts that can be loaded underneath this context
	 *
	 * Items should look like:
	 *
	 * {
	 * 	name: String, //displayable name
	 * 	id: String //unique name for the sub context in this context (used to look up the view to load them)
	 * }
	 *
	 * @type {Object}
	 */
	subContexts = {}


	/**
	 * How to group/order reports the reports
	 *
	 * Items should look like :
	 *
	 * {
	 * 	name: String,
	 * 	description: String,
	 * 	reports: [ //the reports in the order they should show in
	 * 		{
	 * 			rel: String, //the rel of the report
	 * 			contextID: String, //the context the report should come from, if falsy the context is the same as this.context
	 * 		}
	 * 	]
	 * }
	 *
	 * @type {Array}
	 */
	groups = []


	canAccessReports () {
		//For now assume that if the context has any Reports you can access all the reports
		return this.context && this.context.Reports && this.context.Reports.length;
	}


	async getReportGroups () {
		if (!this.canAccessReports()) { return []; }

		const {groups} = this;

		const contextReports = await this.getContextReports();
		const subContextReports = await this.getSubContextReports();

		const reportMap = ([...contextReports, ...subContextReports]).reduce((acc, report) => {
			acc[getReportKey(report.rel, report.contextID)] = report;

			return acc;
		}, {});

		return groups.map((group) => {
			return {
				name: group.name,
				description: group.description,
				reports: group.reports.map(report => reportMap[getReportKey(report.rel, report.contextID)])
			};
		});
	}


	getContextReports () {
		const {context} = this;

		return context.Reports;
	}


	async getSubContextReports () {
		const {subContexts, context} = this;

		try {
			const reports = await getReports();

			return reports.reduce((acc, report) => {
				const {contexts} = report;
				const {Items:reportContexts} = contexts || {};

				for (let reportContext of reportContexts) {
					const subContext = subContexts[reportContext];

					if (subContexts[reportContext]) {
						acc.push({
							title: report.title,
							description: report.description,
							supportedTypes: report.supportedTypes,
							rel: report.rel,
							context,
							contextName: subContext.name,
							contextID: subContext.id
						});
					}
				}

				return acc;
			}, []);
		} catch (e) {
			return [];
		}
	}
}
