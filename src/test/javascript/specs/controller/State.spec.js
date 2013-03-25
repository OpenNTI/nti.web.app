describe('State Controller Tests', function(){

	var controller;

	beforeEach(function(){
		controller = NextThought.controller.State.create({
			models: [],
			views:[],
			refs: [],
			store:[]
		});
	});

	describe('Forum has parsing', function(){

		var fragString;

		function createFragString(parts){
			return '!forums/'+parts.join('/');
		}

		function getStateObject(parts){
			return controller.interpretForumsFragment(createFragString(parts));
		}

		it('Requires at least u and Community', function(){
			var obj = getStateObject([]);

			expect(obj.isUser).toBeUndefined();
			expect(obj.community).toBeUndefined();

			obj = getStateObject(['u', 'NextThought']);
			expect(obj.isUser).toBeTruthy();
			expect(obj.community).toBe('NextThought');
		});

		it('handles up through forum', function(){
			var obj = getStateObject(['u', 'NextThought', 'Bearfoot']);
			expect(obj.isUser).toBeTruthy();
			expect(obj.community).toBe('NextThought');
			expect(obj.forum).toBe('Bearfoot');
		});

		it('handles up through topic', function(){
			var obj = getStateObject(['u', 'NextThought', 'Bearfoot', 'food']);
			expect(obj.isUser).toBeTruthy();
			expect(obj.community).toBe('NextThought');
			expect(obj.forum).toBe('Bearfoot');
			expect(obj.topic).toBe('food');
		});

		it('handles up through comment', function(){
			var obj = getStateObject(['u', 'NextThought', 'Bearfoot', 'food', 'kids']);
			expect(obj.isUser).toBeTruthy();
			expect(obj.community).toBe('NextThought');
			expect(obj.forum).toBe('Bearfoot');
			expect(obj.topic).toBe('food');
			expect(obj.comment).toBe('kids');
		});

		it('handles junk', function(){
			var obj = getStateObject(['asdlfkjadls;fkjads;lfkj']);
			expect(obj).toEqual({});
		});
	});
});
