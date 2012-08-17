Ext.define('NextThought.view.assessment.ScoreboardTally',{
	extend: 'Ext.Component',
	alias: 'widget.assessment-tally',

	cls: 'tally-box',


	messages: {
		0: ['0 Did you even try? O_o'],
		1: ['1 Great Job! You&rsquo;re well on your way...'],
		2: ['2 Great Job! You&rsquo;re well on your way...'],
		3: ['3 Great Job! You&rsquo;re well on your way...'],
		4: ['4 Great Job! You&rsquo;re well on your way...'],
		5: ['5 Great Job! You&rsquo;re well on your way...'],
		6: ['6 Great Job! You&rsquo;re well on your way...'],
		7: ['7 Great Job! You&rsquo;re well on your way...'],
		8: ['8 Great Job! You&rsquo;re well on your way...'],
		9: ['9 Great Job! You&rsquo;re well on your way...'],
		10: ['Great Job!']
	},


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
		var incorrect = total-correct,
			percent = Math.ceil(100*correct/total),
			messageBucket = this.messages[Math.ceil(percent/10)];

		this.correctCount.update(correct);
		this.incorrectCount.update(incorrect);

		this.correctBox[correct === 0?'hide':'show']();
		this.incorrectBox[incorrect === 0?'hide':'show']();

		this.message.update(
			messageBucket[Math.floor(Math.random()*100)%messageBucket.length]
		);

	}

});
