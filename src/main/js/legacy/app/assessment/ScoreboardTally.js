const Ext = require('@nti/extjs');

const Globals = require('legacy/util/Globals');
const {getString} = require('legacy/util/Localization');

require('legacy/mixins/EllipsisText');


module.exports = exports = Ext.define('NextThought.app.assessment.ScoreboardTally', {
	extend: 'Ext.Component',
	alias: 'widget.assessment-tally',


	mixins: {
		EllipsisText: 'NextThought.mixins.EllipsisText'
	},

	cls: 'tally-box',


	renderTpl: Ext.DomHelper.markup([
		{ cls: 'message' },
		{ cls: 'tally', cn: [
			{cls: 'stat correct', cn: [{tag: 'span', cls: 'count'},' {{{NextThought.view.assessment.ScoreboardTally.correct}}}'] },
			{cls: 'stat incorrect', cn: [{tag: 'span', cls: 'count'},' {{{NextThought.view.assessment.ScoreboardTally.incorrect}}}'] },
			{cls: 'stat questions' }
		]}
	]),


	renderSelectors: {
		message: '.message',
		correctBox: '.tally .correct',
		correctCount: '.tally .correct .count',
		incorrectBox: '.tally .incorrect',
		incorrectCount: '.tally .incorrect .count',
		questionsBox: '.tally .questions'
	},


	afterRender: function () {
		this.callParent(arguments);
		this.correctCount.update('');

		if (this.incorrectCount) {
			this.incorrectCount.update('');
		}

		this.correctBox.setVisibilityMode(Ext.dom.Element.DISPLAY).hide();

		if (this.incorrectBox) {
			this.incorrectBox.setVisibilityMode(Ext.dom.Element.DISPLAY).hide();
		}

		if (this.questionsBox) {
			this.questionsBox.setVisibilityMode(Ext.dom.Element.DISPLAY).hide();
		}
	},


	setMessage: function (txt) {
		if (!this.rendered) {
			this.on('afterrender', this.setMessage.bind(this, txt));
			return;
		}

		this.message.update(txt);

		if (this.ellipseMessage) {
			this.truncateText(this.message.dom);
		}
	},


	setGreyText: function (text) {
		if (!this.rendered) {
			this.on({single: true, afterrender: this.setGreyText.bind(this, [text])});
			return;
		}
		this.correctBox.hide();

		if (this.incorrectBox) {
			this.incorrectBox.hide();
		}

		if (this.questionsBox) {
			this.questionsBox.show().update(text);
		}
	},

	setGreenText: function (text) {
		if (!this.rendered) {
			this.on({single: true, afterrender: this.setGreenText.bind(this, [text])});
			return;
		}

		if (this.incorrectBox) {
			this.incorrectBox.hide();
		}

		if (this.questionsBox) {
			this.questionsBox.hide();
		}

		this.correctBox.show().update(text);
	},

	setRedText: function (text) {
		if (!this.rendered) {
			this.on({single: true, afterrender: this.setRedText.bind(this, [text])});
			return;
		}

		this.correctBox.hide();

		if (this.questionsBox) {
			this.questionsBox.hide();
		}

		if (this.incorrectBox) {
			this.incorrectBox.show().update(text);
		}
	},

	setTally: function (correct, total, noScore) {
		//force Integers or NaN
		correct = parseInt(correct, 10);
		total = parseInt(total, 10);

		if (total < correct) {
			console.warn('Setting a strange talley where total is less than correct. Total:' + total + ', Correct: ' + correct);
		}

		var me = this, incorrect = Math.max(total - correct, 0),
			percent = Math.ceil(100 * correct / total) || 0,
			//clamp the bucket id to be an integer between 0-10 inclusive.
			bucketId = Math.min(
				10,
				Math.max(Math.ceil(percent / 10), 0)),
			messageBucket = bucketId || 0,
			msg = '';

		try {
			msg = getString('question_set_scoreboard_' + messageBucket, getString('default_scoreboard_message'));
		}
		catch (e) {
			console.error('Error getting message: ' + e.message, Globals.getError(e));
		}

		function updateTpl () {
			me.correctCount.update(correct || 0);

			if (me.incorrectCount) {
				me.incorrectCount.update(incorrect);
			}

			if (me.questionsBox) {
				me.questionsBox.update(Ext.util.Format.plural(total, 'question'));
			}

			me.correctBox[correct === 0 ? 'hide' : 'show']();

			if (me.incorrectBox) {
				me.incorrectBox[noScore || incorrect === 0 ? 'hide' : 'show']();
			}

			if (me.questionsBox) {
				me.questionsBox[noScore ? 'show' : 'hide']();
			}

			me.message.update(msg);
		}

		if (me.rendered) {
			updateTpl();
		}else {
			this.on('afterrender', updateTpl, this);
		}

	}

});
