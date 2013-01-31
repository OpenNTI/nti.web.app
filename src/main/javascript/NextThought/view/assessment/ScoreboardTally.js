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
		//force Integers or NaN
		correct = parseInt(correct,10);
		total = parseInt(total,10);

		if(total < correct){
			console.warn('Setting a strange talley where total is less than correct. Total:'+total+', Correct: '+correct);
		}

		var incorrect = Math.max(total-correct,0),
			percent = Math.ceil(100*correct/total),
			//clamp the bucket id to be an integer between 0-10 inclusive.
			bucketId = Math.min(
					10,
					Math.max( Math.ceil(percent/10),0 ) ),
			messageBucket = this.messages[bucketId],
			messageId = 0,
			msg = '';

		try {
			messageId = Math.floor(Math.random()*100)%messageBucket.length;
			msg = messageBucket[messageId];
		}
		catch(e){
			console.error('Error getting message: '+ e.message, Globals.getError(e));
		}

		this.correctCount.update(correct);
		this.incorrectCount.update(incorrect);

		this.correctBox[correct === 0?'hide':'show']();
		this.incorrectBox[incorrect === 0?'hide':'show']();

		this.message.update( msg );

	}

});
