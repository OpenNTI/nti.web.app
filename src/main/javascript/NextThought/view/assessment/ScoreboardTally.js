Ext.define('NextThought.view.assessment.ScoreboardTally', {
	extend: 'Ext.Component',
	alias: 'widget.assessment-tally',

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


	afterRender: function() {
		this.callParent(arguments);
		this.correctCount.update('');

		if (this.incorrectCount) {
			this.incorrectCount.update('');
		}

		this.correctBox.setVisibilityMode(Ext.dom.Element.DISPLAY).hide();

		if (this.incorrectBox) {
			this.incorrectBox.setVisibilityMode(Ext.dom.Element.DISPLAY).hide();
		}

		if (this.questionBox) {
			this.questionsBox.setVisibilityMode(Ext.dom.Element.DISPLAY).hide();
		}
	},

	setGreyText: function(text) {
		if (!this.rendered) {
			this.on({single: true, afterrender: this.setGreyText.bind(this, [text])});
			return;
		}
		this.correctBox.hide();
		this.incorrectBox.hide();
		this.questionsBox.show().update(text);
	},

	setGreenText: function(text) {
		if (!this.rendered) {
			this.on({single: true, afterrender: this.setGreenText.bind(this, [text])});
			return;
		}
		this.incorrectBox.hide();
		this.questionsBox.hide();
		this.correctBox.show().update(text);
	},

	setRedText: function(text) {
		if (!this.rendered) {
			this.on({single: true, afterrender: this.setRedText.bind(this, [text])});
			return;
		}
		this.correctBox.hide();
		this.questionsBox.hide();
		this.incorrectBox.show().update(text);
	},

	setTally: function(correct, total, noScore) {
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

		function updateTpl() {
			me.correctCount.update(correct || 0);
			me.incorrectCount.update(incorrect);
			me.questionsBox.update(Ext.util.Format.plural(total, 'question'));

			me.correctBox[correct === 0 ? 'hide' : 'show']();
			me.incorrectBox[noScore || incorrect === 0 ? 'hide' : 'show']();
			me.questionsBox[noScore ? 'show' : 'hide']();

			me.message.update(msg);
		}

		if (me.rendered) {
			updateTpl();
		}else {
			this.on('afterrender', updateTpl, this);
		}

	}

});
