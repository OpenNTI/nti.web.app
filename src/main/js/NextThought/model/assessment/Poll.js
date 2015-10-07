Ext.define('NextThought.model.assessment.Poll', {
	extend: 'NextThought.model.assessment.Question',
	mimeType: 'application/vnd.nextthought.napoll',

	isPoll: true,

	fields: [
		{name: 'isClosed', type: 'Boolean'}
	],


	getReportLink: function() {
		return this.getLink('report-InquiryReport.pdf');
	},


	getResultsLink: function() {
		return this.getLink('Aggregated');
	}
});
