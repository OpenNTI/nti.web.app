describe('Purchase form tests', function(){

	var form, testBody;

	beforeEach(function(){
		testBody = document.createElement('div');
		document.body.appendChild(testBody);
		form = NextThought.view.store.purchase.Form.create({renderTo: testBody});
	});

	afterEach(function(){
		form.destroy();
		document.body.removeChild(testBody);
	});

	describe('getCardNumberVal', function(){
		var parts = ['1234', '1234', '1234', '1234'],
			input;

		beforeEach(function(){
			input = form.getEl().down('[name=number]');
		});

		it('handles space separators', function(){
			input.value = parts.join(' ');
			expect(form.getCardNumberVal(input)).toBe(parts.join(''));
		});

		it('handles - separators', function(){
			input.value = parts.join('-');
			expect(form.getCardNumberVal(input)).toBe(parts.join(''));
		});

		it('handles no separators', function(){
			input.value = parts.join('');
			expect(form.getCardNumberVal(input)).toBe(parts.join(''));
		});
	});
});