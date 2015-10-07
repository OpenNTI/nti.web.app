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
