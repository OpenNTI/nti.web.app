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
		var me = this,
			link = me.getResultsLink(),
			load;

		if (me.__loadResultsPromise) {
			load = me.__loadResultsPromise;
		} else if (link) {
			load = Service.request(link)
				.then(function(response) {
					return Ext.decode(response);
				});
		} else {
			load = Promise.reject('No Link');
		}

		me.__loadResultsPromise = load;

		//Wait an event pump then clear the cached result
		wait()
			.then(function() {
				delete me.__loadResultsPromise;
			});


		return me.__loadResultsPromise;
	},


	getResults: function() {
		return this.__loadResults();
	}
});
