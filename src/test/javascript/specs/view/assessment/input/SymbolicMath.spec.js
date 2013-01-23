describe('SymbolicMath input Tests', function(){

	var SM = NextThought.view.assessment.input.SymbolicMath;

	describe('Works around mathquill bull', function(){
		it('uses the \\space macro for mathquill input', function(){
			var text = 'a b\\:\\%';
			expect(SM.transformToMathquillInput(text)).toEqual('a\\space b\\space \\%');
		});

		it('Turns macros back into whitespace to send to server', function(){
			var text = 'a\\space b\\space \\%';
			expect(SM.sanitizeMathquillOutput(text)).toEqual('a b \\%');
		});
	});
});
