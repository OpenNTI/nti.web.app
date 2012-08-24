Ext.define('NextThought.view.assessment.ScoreboardTally',{
	extend: 'Ext.Component',
	alias: 'widget.assessment-tally',

	cls: 'tally-box',


	messages: {
		0:["Whoops! Review material and try again.", "Try again!", "Oh no! Did you forget your material? Try again!"],
		1:["It&rsquo;s a start! Try again.", "Keep trying!", "Get a few more right, and you&rsquo;re on your way!"],
		2:["It&rsquo;s a start! Try again.", "Keep trying!", "Get a few more right, and you&rsquo;re on your way!"],
		3:[" Keep trying. You&rsquo;ll get there!", "Keep studying, and you&rsquo;ll be well on your way!", "Keep trying!", "You can do it! Try again?"],
		4:[" Keep trying. You&rsquo;ll get there!", "Keep studying, and you&rsquo;ll be well on your way!", "Keep trying!", "You can do it! Try again?"],
		5:["Almost there! Keep it up!", "A little more practice, and you&rsquo;re on your way!", "Almost!", " Good try!"],
		6:["Almost there! Keep it up!", "A little more practice, and you&rsquo;re on your way!", "Almost!", " Good try!"],
		7:["Good job!", ":)", "So close!!", "Good work! Almost there!", "You&rsquo;ve almost got it!"],
		8:["Good job!", ":)", "So close!!", "Good work! Almost there!", "You&rsquo;ve almost got it!"],
		9:["Great work!", ":)", "Wow!", "Great job!", "Brilliant!", "Nice Work!"],
		10:["Excellent! Perfect score!", "Above and beyond! Great job!", ":D", "Quite impressive.", "Genius.", "You&rsquo;re a math ninja!", "Eureka!"]
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
