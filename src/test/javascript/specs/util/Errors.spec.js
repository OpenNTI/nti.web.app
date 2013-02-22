describe("Error Message", function(){
	var errors;

	beforeEach(function(){
		errors = {};
		/*jslint sub:true */ //no way to ignore reserved property if using don notation
		errors['__proto__'] = NextThought.util.Errors['__proto__'];
		/*jslint sub:false */
		errors.addMsg({
			'Not Found': {
				msg : "The {name} you are looking for does not exist.",
				defaults: {
					"name" : "item"
				}
			},
			'Invalid':{
				msg: "The {code} you entered {msg}",
				defaults:{
					"code" : "code",
					"msg" : "is invalid"
				}
			}
		});
	});

	describe("Given correct formatting",function(){
		it("Getting Default Error msg passing no replacements",function(){
			var msg = errors.getError('Default');

			expect(msg).toBe('An unknown error occured.');
		});

		it("Getting 'Not Found' error msg passing no replacements",function(){
			var msg = errors.getError('Not Found');

			expect(msg).toBe('The item you are looking for does not exist.');
		});

		it("Getting 'Not Found error msg passing replacements",function(){
			var msg = errors.getError('Not Found',{ 'name' : 'droid'});

			expect(msg).toBe('The droid you are looking for does not exist.');
		});

		it("Getting 'Invalid' error msg passing no replacements",function(){
			var msg = errors.getError('Invalid');

			expect(msg).toBe('The code you entered is invalid');
		});

		it("Getting 'Invalid' error msg passing 1st replacement",function(){
			var msg = errors.getError('Invalid',{ 'code':'number'});

			expect(msg).toBe('The number you entered is invalid');
		});

		it("Getting 'Invalid' error msg passing 2nd replacement",function(){
			var msg = errors.getError('Invalid',{ 'msg':'is dumb'});

			expect(msg).toBe('The code you entered is dumb');
		});

		it("Getting 'Invalid' error msg passing both replacements",function(){
			var msg = errors.getError('Invalid',{'code':'number','msg':'is dumb'});

			expect(msg).toBe('The number you entered is dumb');
		});
	});

	describe("Given incorrect formatting",function(){
		it("Passing no existent error code",function(){
			var msg = errors.getError("Imaginary");

			expect(msg).toBe('An unknown error occured.');
		});

		it("Passing too many replacements",function(){
			var msg = errors.getError('Not Found', { 'name' : 'droid', 'item' : 'nothing'});

			expect(msg).toBe('The droid you are looking for does not exist.');
		});

		it("Passing nothing",function(){
			var msg = errors.getError();

			expect(msg).toBe('An unknown error occured.');
		});
	});
});
