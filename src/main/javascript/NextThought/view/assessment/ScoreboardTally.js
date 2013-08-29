Ext.define('NextThought.view.assessment.ScoreboardTally', {
	extend: 'Ext.Component',
	alias:  'widget.assessment-tally',

	cls: 'tally-box',

	renderTpl: Ext.DomHelper.markup([
										{ cls: 'message' },
										{ cls: 'tally', cn: [
											{cls: 'stat correct', cn: [
												{tag: 'span', cls: 'count'},
												' correct'
											] },
											{cls: 'stat incorrect', cn: [
												{tag: 'span', cls: 'count'},
												' incorrect'
											] },
											{cls: 'stat questions', cn: [
												{tag: 'span', cls: 'count'},
												' questions'
											] }
										]}
									]),


	renderSelectors: {
		message:        '.message',
		correctBox:     '.tally .correct',
		correctCount:   '.tally .correct .count',
		incorrectBox:   '.tally .incorrect',
		incorrectCount: '.tally .incorrect .count',
		questionsBox:   '.tally .questions',
		questionsCount: '.tally .questions .count'
	},


	afterRender: function () {
		this.callParent(arguments);
		this.correctCount.update('16');
		this.incorrectCount.update('4');

		this.correctBox.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.incorrectBox.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.questionsBox.setVisibilityMode(Ext.dom.Element.DISPLAY).hide();
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

		function updateTpl() {
			me.correctCount.update(correct || 0);
			me.incorrectCount.update(incorrect);
			me.questionsCount.update(total);

			me.correctBox[correct === 0 ? 'hide' : 'show']();
			me.incorrectBox[noScore || incorrect === 0 ? 'hide' : 'show']();
			me.questionsBox[noScore ? 'show' : 'hide']();

			me.message.update(msg);
		}

		if (me.rendered) {
			updateTpl();
		} else {
			this.on('afterrender', updateTpl, this);
		}

	}

});
