describe('Purchase form tests', function(){

	var form, testBody;

	beforeEach(function(){
		testBody = document.createElement('div');
		document.body.appendChild(testBody);
		form = NextThought.view.store.purchase.Form.create({});
		spyOn(form, 'enableSubmission');
		form.render(testBody);
	});

	afterEach(function(){
		form.destroy();
		document.body.removeChild(testBody);
	});

	it('Starts disabled', function(){
		expect(form.enableSubmission.calls.length).toBe(1);
		expect(form.enableSubmission).toHaveBeenCalledWith(false);
	});

	it('Delegates setting confirm state to window', function(){
		var win = jasmine.createSpyObj('window', ['setConfirmState']);
		spyOn(form, 'up').andCallFake(function(sel){
			return sel === 'window' ? win : null;
		});

		form.enableSubmission.andCallThrough();
		form.enableSubmission(true);

		expect(win.setConfirmState).toHaveBeenCalledWith(true);
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

	describe('value for input', function(){

		var input;
		beforeEach(function(){
			input = document.createElement('input');
		});

		it('Supperts data-getter mapping to jquery.payment', function(){
			var result;

			input.setAttribute('data-getter', 'cardExpiryVal');
			input.value = '10/2015';

			result = form.valueForInput(input);
			expect(Ext.isObject(result)).toBeTruthy();
			expect(result.month).toBe(10);
			expect(result.year).toBe(2015);
		});

		it('Support data-getter mapping to this', function(){
			var result;

			input.setAttribute('data-getter', 'getCardNumberVal');
			input.value = '4242-4242-4242-4242';
			spyOn(form, 'getCardNumberVal').andCallThrough();

			result = form.valueForInput(input);
			expect(result).toBe('4242424242424242');

			expect(form.getCardNumberVal).toHaveBeenCalledWith(input);
		});

		it('Defaults to value', function(){
			var result;
			input.value = '123';

			result = form.valueForInput(input);
			expect(result).toBe(input.value);
		});
	});

	describe('validate required', function(){

		var required, notRequired;
		beforeEach(function(){
			required = document.createElement('input');
			required.setAttribute('data-required', 'true');
			required.value = 'required';

			notRequired = document.createElement('input');
			notRequired.value = 'notRequired';
		});

		it('Excepts truthy if not required', function(){
			expect(form.validateForRequired(notRequired, notRequired.value)).toBeTruthy();
		});

		it('Excepts falsy if not required', function(){
			notRequired.value = '';
			expect(form.validateForRequired(notRequired, notRequired.value)).toBeTruthy();
		});

		it('Excepts truthy if required', function(){
			expect(form.validateForRequired(required, required.value)).toBeTruthy();
		});

		it('Rejects falsy if not required', function(){
			required.value = '';
			expect(form.validateForRequired(required, required.value)).toBeFalsy();
		});
	});

	describe('custom validator', function(){

		var input;
		beforeEach(function(){
			input = document.createElement('input');
		});

		it('no validator passes', function(){
			input.value = '12345';
			expect(form.validateWithValidator(input, input.value)).toBeTruthy();
		});

		describe('validator calls jquery.payment validator', function(){
			beforeEach(function(){
				input.setAttribute('data-validator', 'validateCardCVC');
				spyOn(jQuery.payment, 'validateCardCVC').andCallThrough();
			});

			it('marks failing values invalid', function(){
				input.value = '12345';
				expect(form.validateWithValidator(input, input.value)).toBeFalsy();
				expect(jQuery.payment.validateCardCVC).toHaveBeenCalledWith(input.value);
			});

			it('leaves passing values alone', function(){
				input.value = '456';
				expect(form.validateWithValidator(input, input.value)).toBeTruthy();
				expect(jQuery.payment.validateCardCVC).toHaveBeenCalledWith(input.value);
			});
		});
	});

	describe('validate input', function(){

		var input;
		beforeEach(function(){
			input = document.createElement('input');
		});

		it('Checks required and validator', function(){
			spyOn(form, 'validateForRequired').andReturn(true);
			spyOn(form, 'validateWithValidator').andReturn(true);

			input.value = 'foo';

			expect(form.validateInput(input)).toBe('foo');
			expect(form.validateForRequired).toHaveBeenCalledWith(input, 'foo');
			expect(form.validateWithValidator).toHaveBeenCalledWith(input, 'foo');

		});

		it('Results in invalid if either fail', function(){
			spyOn(form, 'validateForRequired').andCallThrough();
			spyOn(form, 'validateWithValidator').andReturn(true);

			input.setAttribute('data-required', 'true');
			input.value = '';

			expect(form.validateInput(input)).toBeNull();
		});

		it('Remove invalid if input validates', function(){
			Ext.fly(input).addCls('invalid');

			spyOn(form, 'validateForRequired').andReturn(true);
			spyOn(form, 'validateWithValidator').andReturn(true);

			input.value = 'foo';

			expect(form.validateInput(input)).toBe('foo');
			expect(Ext.fly(input).hasCls('invalid')).toBeFalsy();
		});
	});

	describe('collectVal', function(){

		var data = {}, input;
		beforeEach(function(){
			input = document.createElement('input');
		});

		it('Adds a property by name', function(){
			input.setAttribute('name', 'foo');
			input.val = 'bar';

			form.collectVal(data, input, input.val);

			expect(data.foo).toBe('bar');
		});

		it('Unwraps objects', function(){
			input.setAttribute('name', 'foo_');
			input.val = 'bar/baz';

			form.collectVal(data, input, {1: 'bar', 2: 'baz'});

			expect(data['foo_1']).toBe('bar');
			expect(data['foo_2']).toBe('baz');
		});

	});
});