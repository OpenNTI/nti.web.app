Ext.define('NextThought.view.assessment.ScoreboardTally',{
	extend: 'Ext.Component',
	alias: 'widget.assessment-tally',

	cls: 'tally-box',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'message', html: 'Great Job! You&rsquo;re well on your way...' },
		{ cls: 'tally', cn: [
			{cls: 'stat correct', cn:[{tag: 'span', cls:'count'},' correct'] },
			{cls: 'stat incorrect', cn:[{tag: 'span', cls:'count'},' incorrect'] }
		]}
	]),


	renderSelectors: {
		correctBox: '.tally .correct',
		correctCount: '.tally .correct .count',
		incorrectBox: '.tally .incorrect',
		incorrectCount: '.tally .incorrect .count'
	},


	afterRender: function(){
		this.callParent(arguments);
		this.correctCount.update('16');
		this.incorrectCount.update('4');
	},



	setTally: function(correct,total){
		this.correctCount.update(correct);
		this.incorrectCount.update(total-correct);
	}

});
