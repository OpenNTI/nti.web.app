const Ext = require('@nti/extjs');

const {isFeature} = require('legacy/util/Globals');

require('legacy/model/Base');

module.exports = exports = Ext.define('NextThought.model.assessment.QuestionSet', {
	extend: 'NextThought.model.Base',

	statics: {
		mimeType: 'application/vnd.nextthought.naquestionset'
	},

	mimeType: 'application/vnd.nextthought.naquestionset',
	progress: {},
	isSet: true,

	fields: [
		{ name: 'questions', type: 'arrayItem' },
		{name: 'title', type: 'String'},
		{name: 'question-count', type: 'int'},
		{name: 'isPastDue', tpype: 'bool'}
	],

	tallyParts: function () {
		function sum (agg, r) {
			return agg + (r.tallyParts ? r.tallyParts() : 1);
		}
		return (this.get('questions') || []).reduce(sum, 0);
	},

	containsId: function (id) {
		var items = (this.get('questions') || []).filter(function (p) {
			return p && p.getId() === id;
		});

		return items.length > 0 || this.getId() === id;
	},

	getQuestionCount () {
		return this.get('question-count');
	},

	getStartTime: function () {
		return this.startTime || 0;
	},

	setStartTime: function (time) {
		this.startTime = time;
	},

	getPreviousEffortDuration: function () {
		return this.previousEffortDuration || 0;
	},

	clearProgress: function (save) {},

	setPreviousEffortDuration: function (duration) {
		this.previousEffortDuration = duration;
	},

	setProgress: function (question, input) {},

	saveProgress: function (question, input) {
		if (this.doNotSaveProgress) {
			if (input && input.reapplyProgress && input.updateWithValue) {
				const updatedQ = this.progress[question.getId()];
				if (updatedQ) {
					input.updateWithValue(updatedQ[input.getOrdinal()]);
				}
			}
			return;
		}

		if (!this.saveProgressHandler) {
			console.error('No cmp to fire save progress on...');
			return;
		}

		if (!isFeature('do-not-save-progress')) {
			if (this.beforeSaveProgress) {
				this.beforeSaveProgress.call();
			}

			if (this.inflightSavepoint) {
				this.pendingProgress = this.pendingProgress || [];
				this.pendingProgress.push({question, input});
			} else {
				this.inflightSavepoint = this.saveProgressHandler()
					.then((result) => {
						if(result.status === 403) {
							const respJson = Ext.decode(result.responseText);

							if(respJson.code === 'SubmissionPastDueDateError') {
								this.onSaveProgress();

								this.set('isPastDue', true);

								this.fireEvent('past-due', {});

								delete this.inflightSavepoint;
								delete this.pendingProgress;

								return Promise.resolve();
							}
						}

						const pending = this.pendingProgress;
						const toUpdate = [...(pending || []), {input, question}];
						const resolvePending = pending ? this.saveProgressHandler() : Promise.resolve(result);

						delete this.inflightSavepoint;
						delete this.pendingProgress;

						return resolvePending
							.then((pendingResult) => {
								this.applyProgressTo(toUpdate, pendingResult);

								return pendingResult;
							});
					})
					.then(this.onSaveProgress.bind(this));
			}
		}
	},

	applyProgressTo (inputs, result) {
		const submission = result && result.getQuestionSetSubmission();
		const questionSubmissions = (submission && submission.get('questions')) || [];

		for (let input of inputs) {
			let {input:cmp, question} = input;
			let qID = question && question.getId();

			if (cmp.reapplyProgress) {
				for (let q of questionSubmissions) {
					if (q.get('questionId') === qID) {
						cmp.updateWithProgress(q);
						break;
					}
				}
			}
		}
	},

	onSaveProgress: function (result) {
		if (!result || result.status === 409 || result.status === 404) {
			this.afterSaveProgress.call(null, false);
			return;
		}

		if (this.afterSaveProgress) {
			this.afterSaveProgress.call(null, true);
		}
	},

	/**
	 * Add handlers for saving progress
	 * @param {Function} save	saves the progress and returns a promise
	 * @param {Function} before called before progress is saved
	 * @param {Function} after	called after progress is saved
	 * @param {Boolean} doNotSave if true do not actually save the progress
	 * @returns {void}
	 */
	addSaveProgressHandler: function (save, before, after, doNotSave) {
		this.saveProgressHandler = save;
		this.beforeSaveProgress = before;
		this.afterSaveProgress = after;
		this.doNotSaveProgress = doNotSave;
	}
});
