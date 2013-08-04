Ext.define('NextThought.view.assessment.ScoreboardTally',{
	extend: 'Ext.Component',
	alias: 'widget.assessment-tally',

	cls: 'tally-box',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'message' },
		{ cls: 'tally', cn: [
			{cls: 'stat correct', cn:[{tag: 'span', cls:'count'},' correct'] },
			{cls: 'stat incorrect', cn:[{tag: 'span', cls:'count'},' incorrect'] }
		]}
	]),


	renderSelectors: {
		message: '.message',
		correctBox: '.tally .correct',
		correctCount: '.tally .correct .count',
		incorrectBox: '.tally .incorrect',
		incorrectCount: '.tally .incorrect .count'
	},


	afterRender: function(){
		this.callParent(arguments);
		this.correctCount.update('16');
		this.incorrectCount.update('4');

		this.correctBox.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.incorrectBox.setVisibilityMode(Ext.dom.Element.DISPLAY);
	},



	setTally: function(correct,total){
		//force Integers or NaN
		correct = parseInt(correct,10);
		total = parseInt(total,10);

		if(total < correct){
			console.warn('Setting a strange talley where total is less than correct. Total:'+total+', Correct: '+correct);
		}

		var incorrect = Math.max(total-correct,0),
			percent = Math.ceil(100*correct/total) || 0,
			//clamp the bucket id to be an integer between 0-10 inclusive.
			bucketId = Math.min(
					10,
					Math.max( Math.ceil(percent/10),0 ) ),
			messageBucket = bucketId || 0,
			msg = '';

		try {
			msg = NTIString('question_set_scoreboard_'+messageBucket, NTIString('default_scoreboard_message'));
		}
		catch(e){
			console.error('Error getting message: '+ e.message, Globals.getError(e));
		}

		this.correctCount.update(correct||0);
		this.incorrectCount.update(incorrect);

		this.correctBox[correct === 0?'hide':'show']();
		this.incorrectBox[incorrect === 0?'hide':'show']();

		this.message.update( msg );

	}

});
