describe("Error Message", function(){
	var errors;
	var defaultMsg = "Default Error Msg";
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
		efaultMsg = "Default Error Msg";
	});

	describe("Given an Error code that exists",function(){
		it("0/1 replacements no default",function(){
			var msg = errors.getError('Not Found');

			expect(msg).toBe("The item you are looking for does not exist.");
		});

		it("0/1 replacements default",function(){
			var msg = errors.getError('Not Found',{},defaultMsg);

			expect(msg).toBe("The item you are looking for does not exist.");
		});

		it("0/2 replacements no default",function(){
			var msg = errors.getError('Invalid');

			expect(msg).toBe("The code you entered is invalid");
		});

		it("0/2 replacements default",function(){
			var msg = errors.getError('Invalid',{},defaultMsg);

			expect(msg).toBe("The code you entered is invalid");
		});		
		it("1/1 replacements no default",function(){
			var msg = errors.getError("Not Found",{'name':'droid'});

			expect(msg).toBe("The droid you are looking for does not exist.");
		});

		it("1/1 replacements default",function(){
			var msg = errors.getError("Not Found",{'name':'droid'},defaultMsg);

			expect(msg).toBe("The droid you are looking for does not exist.");
		});

		it("1/2 (first) replacements no default",function(){
			var msg = errors.getError("Invalid",{'code':'word'});

			expect(msg).toBe("The word you entered is invalid");
		});

		it("1/2 (first) replacements default",function(){
			var msg = errors.getError("Invalid",{'code':'word'},defaultMsg);

			expect(msg).toBe("The word you entered is invalid");
		});

		it("1/2 (second) replacements no default",function(){
			var msg = errors.getError("Invalid",{'msg':'is dumb'});

			expect(msg).toBe('The code you entered is dumb');
		});

		it("1/2 (second) replacements default",function(){
			var msg = errors.getError("Invalid",{'msg':'is dumb'},defaultMsg);

			expect(msg).toBe('The code you entered is dumb');
		});

		it("2/2 (wrong order) replacements no default",function(){
			var msg = errors.getError("Invalid",{'msg':'is dumb','code':'word'});

			expect(msg).toBe('The word you entered is dumb');
		});

		it("2/2 (wrong order) replacements default",function(){
			var msg = errors.getError("Invalid",{'msg':'is dumb','code':'word'},defaultMsg);

			expect(msg).toBe('The word you entered is dumb');
		});

		it("2/2 (right order) replacements no default",function(){
			var msg = errors.getError("Invalid",{'code':'word','msg':'is dumb'});

			expect(msg).toBe('The word you entered is dumb');
		});

		it("2/2 (right order) replacements default",function(){
			var msg = errors.getError("Invalid",{'code':'word','msg':'is dumb'},defaultMsg);

			expect(msg).toBe('The word you entered is dumb');
		});
	});

	describe("Given an error code that doesn't exist",function(){
		it("Replacements passed",function(){
			var msg = errors.getError("Nonexistent",{'test':'test'},defaultMsg);

			expect(msg).toBe(defaultMsg);
		});

		it("Replacements not passed",function(){
			var msg = errors.getError("Nonexistent",{},defaultMsg);

			expect(msg).toBe(defaultMsg);
		});

		it("Replacements no default",function(){
			var msg = errors.getError("Nonexistent",{'test':'test'});

			expect(msg).toBeFalsy();
		});

		it("No Replacements no default",function(){
			var msg = errors.getError("Nonexistent");

			expect(msg).toBeFalsy();
		});


	});
});
