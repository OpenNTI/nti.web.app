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

	describe('Forum fragment generation', function(){

	});

	describe('Forum fragment parsing', function(){

		var fragString;

		function createFragString(parts){
			return '!forums/'+parts.join('/');
		}

		function getStateObject(parts, dontCheck){
			var result = controller.interpretForumsFragment(createFragString(parts));

			if(!dontCheck){
				expect(result.active).toEqual('forums');
				expect(result.forums).toBeTruthy();
				return result.forums;
			}

			return result;
		}

		it('Requires at least u and Community', function(){
			var obj = getStateObject([], true);

			expect(obj).toEqual({active: 'forums'});

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
			var obj = getStateObject(['asdlfkjadls;fkjads;lfkj'], true);
			expect(obj).toEqual({active: 'forums'});
		});
	});
});
