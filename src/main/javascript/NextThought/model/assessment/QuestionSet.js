Ext.define('NextThought.model.assessment.QuestionSet', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.naquestionset',
	requires: [
		'NextThought.model.converters.Items',
		'NextThought.util.Parsing'
	],

	progress: {},

	isSet: true,
	fields: [
		{ name: 'questions', type: 'arrayItem' }
	],


	tallyParts: function() {
		function sum(agg, r) {
			return agg + (r.tallyParts ? r.tallyParts() : 1);
		}
		return (this.get('questions') || []).reduce(sum, 0);
	},


	containsId: function(id) {
		var items = this.get('questions').filter(function(p) {
			return p && p.getId() === id;
		});

		return items.length > 0 || this.getId() === id;
	},

	getStartTime: function() {
		return this.startTime || 0;
	},

	setStartTime: function(time) {
		this.startTime = time;
	},


	getPreviousEffortDuration: function() {
		return this.previousEffortDuration || 0;
	},


	clearProgress: function(save) {
		this.progress = {};

		if (save) {
			this.saveProgress();
		}
	},


	setPreviousEffortDuration: function(duration) {
		this.previousEffortDuration = duration;
	},


	setProgress: function(question, input) {
		var id = question.getId(),
			values = this.progress[id] || [],
			value = input.getValue();

		if (value === undefined) {
			value = null;
		}

		values[input.getOrdinal()] = value;
		this.progress[id] = values;
	},


	saveProgress: function(question, input) {
		if (question && input) {
			this.setProgress(question, input);
		}

		if (!this.saveProgressEventSrc) {
			console.error('No cmp to fire save progress on...');
			return;
		}

		if (isFeature('save-progress')) {
			if (this.beforeSaveProgress) {
				this.beforeSaveProgress.call();
			}

			this.saveProgressEventSrc.fireEvent('save-progress', this, this.progress, this.onSaveProgress.bind(this, question, input));
		}
	},


	onSaveProgress: function(question, input, result) {
		if (!result) {
			this.afterSaveProgress.call(null, false);
			return;
		}

		var submission = result.getQuestionSetSubmission(),
			qId = question && question.getId(),
			questions = (submission && submission.get('questions')) || [];

		//if the input wants to reapply the progress after an upload
		//find the question in the result and update it
		if (input && input.reapplyProgress) {
			questions.every(function(q) {
				if (q.get('questionId') === qId) {
					input.updateWithProgress(q);
					return false;
				}

				return true;
			});
		}

		this.afterSaveProgress.call(null, true);
	},


	addSaveProgressHandler: function(cmp, before, after) {
		this.saveProgressEventSrc = cmp;
		this.beforeSaveProgress = before;
		this.afterSaveProgress = after;
	}
});
