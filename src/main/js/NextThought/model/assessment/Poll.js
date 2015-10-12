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
	},

	__loadResults: function() {
		var link = this.getResultsLink(),
			load;

		if (this.__loadResultsPromise) {
			load = this.__loadResultsPromise;
		} else if (link) {
			load = Service.request(link)
				.then(function(response) {
					return Ext.decode(response);
				});
		} else {
			load = Promise.reject('No Link');
		}

		this.__loadResultsPromise = load;

		return this.__loadResultsPromise;
	},


	getResults: function() {
		return this.__loadResults();
	}
});
