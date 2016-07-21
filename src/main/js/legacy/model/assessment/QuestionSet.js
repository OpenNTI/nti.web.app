const Ext = require('extjs');
const {isFeature, swallow} = require('legacy/util/Globals');
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
		{name: 'title', type: 'String'}
	],

	tallyParts: function () {
		function sum (agg, r) {
			return agg + (r.tallyParts ? r.tallyParts() : 1);
		}
		return (this.get('questions') || []).reduce(sum, 0);
	},

	containsId: function (id) {
		var items = this.get('questions').filter(function (p) {
			return p && p.getId() === id;
		});

		return items.length > 0 || this.getId() === id;
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

	clearProgress: function (save) {
		this.progress = {};

		if (save) {
			this.saveProgress();
		}
	},

	setPreviousEffortDuration: function (duration) {
		this.previousEffortDuration = duration;
	},

	setProgress: function (question, input) {
		if (input.isDestroyed) {
			return;
		}

		var id = question.getId(),
			values = this.progress[id] || [],
			value = input.getValue();

		if (value === undefined) {
			value = null;
		}

		values[input.getOrdinal()] = value;
		this.progress[id] = values;
	},

	saveProgress: function (question, input) {
		if (question && input) {
			this.setProgress(question, input);
		}

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

			this.saveProgressHandler(this.progress)
				.then(this.onSaveProgress.bind(this, question, input));
		}
	},

	onSaveProgress: function (question, input, result) {
		if (!result || result.status === 409) {
			this.afterSaveProgress.call(null, false);
			return;
		}

		var submission = result.getQuestionSetSubmission(),
			qId = question && question.getId(),
			questions = (submission && submission.get('questions')) || [];

		//if the input wants to reapply the progress after an upload
		//find the question in the result and update it
		if (input && input.reapplyProgress) {
			questions.every(function (q) {
				if (q.get('questionId') === qId) {
					input.updateWithProgress(q);
					return false;
				}

				return true;
			});
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
