window.NTIStrings = window.NTIStrings || {};

//Strings for the question set scoreboard method.  The keys are of the form question_set_scoreboard_percentage_num
//e.g. question_set_scoreboard_8_1
(function(){
	var mcQuestionSetStrings =  {
		0:["Whoops! Review material and try again.", "Try again!", "Oh no! Did you forget your material? Try again!"],
		1:["It&rsquo;s a start! Try again.", "Keep trying!", "Get a few more right, and you&rsquo;re on your way!"],
		2:["It&rsquo;s a start! Try again.", "Keep trying!", "Get a few more right, and you&rsquo;re on your way!"],
		3:[" Keep trying. You&rsquo;ll get there!", "Keep studying, and you&rsquo;ll be well on your way!", "Keep trying!", "You can do it! Try again?"],
		4:[" Keep trying. You&rsquo;ll get there!", "Keep studying, and you&rsquo;ll be well on your way!", "Keep trying!", "You can do it! Try again?"],
		5:["Almost there! Keep it up!", "A little more practice, and you&rsquo;re on your way!", "Almost!", " Good try!"],
		6:["Almost there! Keep it up!", "A little more practice, and you&rsquo;re on your way!", "Almost!", " Good try!"],
		7:["Good job!", "So close!!", "Good work! Almost there!", "You&rsquo;ve almost got it!"],
		8:["Good job!", "So close!!", "Good work! Almost there!", "You&rsquo;ve almost got it!"],
		9:["Great work!", "Wow!", "Great job!", "Brilliant!", "Nice Work!"],
		10:["Excellent! Perfect score!", "Above and beyond! Great job!", "Quite impressive.", "Genius.", "Eureka!"]
	}, i, s, messages;

	for(s = 0 ; s<11; s++){
		for(i = 0 ; i<5; i++){
			messages = mcQuestionSetStrings[s];
			NTIStrings['question_set_scoreboard_'+s+'_'+i] = messages[i<messages.length ? i : messages.length - 1];
		}
	}

}());
