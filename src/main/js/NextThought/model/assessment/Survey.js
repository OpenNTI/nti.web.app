Ext.define('NextThought.model.assessment.Survey', {
	extend: 'NextThought.model.assessment.QuestionSet',
	mimeType: 'application/vnd.nextthought.nasurvey',

	isSurvey: true,

	fields: [
		{name: 'isClosed', type: 'Boolean'},
		{name: 'submissions', type: 'Number'}
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


	getResults: function(pollId) {
		return this.__loadResults()
			.then(function(results) {
				var polls = results.questions, poll;

				poll = polls.reduce(function(acc, p) {
					if (p.pollId === pollId) {
						acc = p;
					}

					return acc;
				}, null);

				return poll;
			});
	}
});
