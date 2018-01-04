import {getReportInfo} from '../../utils';

import ReportStore from './ReportStore';


function getReportKey (rel, contextID) {
	return `${rel}-${contextID || ''}`;
}


export default class ReportContext {
	constructor (object) {
		this.context = object;
	}

	/**
	 * The list of subContext under this context
	 *
	 * Items should look like:
	 *
	 * {
	 * 	name: String, //displayable name
	 * 	id: String, //unique name for the context
	 * 	rel: String,
	 * 	store: Store to load the items for this context (class, that takes the context and rel in the constructor)
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

		let reports = [];

		for (let subContext of subContexts) {
			const {rel, name:contextName, id: contextID, store:Store} = subContext;

			try {
				const reportInfo = await getReportInfo(rel);

				reports.push({
					...reportInfo,
					contextName,
					contextID,
					store: new Store(context, rel)
				});
			} catch (e) {
				continue;
			}
		}

		return reports;
	}


	xgetReportGroups () {

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


	xgetContextReports () {
		const {reports, context} = this;

		return reports.map((report) => {
			return {
				name: report.name,
				description: report.description,
				'supported_types': report.supported_types,
				store: new ReportStore(report.rel, context)
			};
		});
	}

	xgetSubContextReports () {
		const {subContexts} = this;

		let reports = [];

		for (let subContext of subContexts) {
			const subReports = subContext.reports;

			reports = reports.concat(subReports.map(subReport => ({...subReport, context: subContext})));
		}

		return reports;
	}
}
