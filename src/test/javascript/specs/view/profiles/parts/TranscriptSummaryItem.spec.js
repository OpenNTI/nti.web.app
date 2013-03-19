describe('Transcript Summary Item tests', function(){
	var body, view, noop = function(){};

	beforeEach(function(){
		body = document.createElement('div');
		document.body.appendChild(body);
		view = Ext.create('NextThought.view.profiles.parts.TranscriptSummaryItem',{
			renderTo : body,
			initComponent : noop,
			afterRender : noop
		});
	})
	describe('No array passed', function(){
		it('Passing nothing',function(){
			var result = view.stringifyNames();

			expect(result).toBe('no one');
		});

		it('Passing a string no less',function(){
			var result = view.stringifyNames('me');

			expect(result).toBe('me');
		});

		it('Passing a string and a less',function(){
			var result = view.stringifyNames('me',5);

			expect(result).toBe('me');
		})
	})

	describe('One name in the array',function(){
		var names;
		beforeEach( function(){
			names = ['me'];
		});
		it("Passing no less",function(){
			var result = view.stringifyNames(names);

			expect(result).toBe("me");
		});

		it("Passing less", function(){
			var result = view.stringifyNames(names, 5);

			expect(result).toBe("me");
		});
	});

	describe('Two names in the array',function(){
		var names;
		beforeEach(function(){
			names = ['me','you'];
		});

		it('Passing no less',function(){
			var result = view.stringifyNames(names);

			expect(result).toBe("me and you");
		});

		it('Passing less of 1',function(){
			var result = view.stringifyNames(names, 1);

			expect(result).toBe("me and 1 other");
		});

		it('Passing less of 2',function(){
			var result = view.stringifyNames(names, 2);

			expect(result).toBe("2 others");
		});

		it('Passing less of 3',function(){
			var result = view.stringifyNames(names, 3);

			expect(result).toBe('2 others');
		});
	});

	describe('Five names in the array',function(){
		var names;
		beforeEach(function(){
			names = ['me','you','him','her','guy'];
		});

		it('Passing no less',function(){
			var result = view.stringifyNames(names);

			expect(result).toBe('me, you, him, her, and guy');
		})

		it('Passing less of 1',function(){
			var result = view.stringifyNames(names,1);

			expect(result).toBe('me, you, him, her, and 1 other');
		})

		it('Passing less of 2',function(){
			var result = view.stringifyNames(names, 2);

			expect(result).toBe('me, you, him, and 2 others');
		});

		it('Passing less of 3',function(){
			var result = view.stringifyNames(names, 3);

			expect(result).toBe('me, you, and 3 others');
		});

		it('Passing less of 4',function(){
			var result = view.stringifyNames(names, 4);

			expect(result).toBe('me and 4 others');
		});

		it('Passing less of 5',function(){
			var result = view.stringifyNames(names, 5);

			expect(result).toBe('5 others');
		})

		it('Passing less of 6',function(){
			var result = view.stringifyNames(names, 6);

			expect(result).toBe('5 others');
		})
	});
});
