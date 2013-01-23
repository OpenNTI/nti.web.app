describe("UserDataThreader utils", function() {

	var ThreaderUtil;

	beforeEach(function(){
		ThreaderUtil = {};
		/*jslint sub:true */ //no way to ignore reserved property if using don notation
		ThreaderUtil['__proto__'] = NextThought.util.UserDataThreader['__proto__'];
		/*jslint sub:false */
	});

	it("Makes public api available", function(){
		expect(ThreaderUtil.threadUserData).toBeTruthy();
		expect(ThreaderUtil.buildThreads).toBeTruthy();
	});

	describe("Parenting works as expected", function(){
		it('abandons links successfully', function(){
			var a = {
				parent: {},
				children: []
			};

			expect(a.parent).toBeTruthy();
			expect(a.children).toBeTruthy();

			ThreaderUtil.tearDownThreadingLinks(a);
			expect(a.parent).toBeUndefined();
			expect(a.parent).toBeUndefined();
		});
	});

	describe("buildItemTree", function(){

		function createThreadable(name, placeholder){
			var n = {
				isThreadable: true,
				parent: {},
				children: [],
				placeholder: placeholder,
				getModelName: function(){
					return name;
				},
				getId: function(){
					return 'foo';
				},
				get: function(){
					return null;
				}
			};

			return n;
		}

		it('abandons preexisting relationships', function(){
			var n = createThreadable('Note'), tree = {}, results;

			ThreaderUtil.buildItemTree([n], tree);
			results = Ext.Object.getValues(tree);
			expect(Ext.isEmpty(results)).toBeFalsy();
			expect(results.length).toEqual(1);

			results = results.first();
			expect(results.parent).toBeUndefined();
			expect(Ext.isEmpty(results.children)).toBe(true);
		});

		it('keeps preexisting relationships for placeholders', function(){
			var n = createThreadable('Note', true), tree = {}, results;

			ThreaderUtil.buildItemTree([n], tree);
			results = Ext.Object.getValues(tree);
			expect(Ext.isEmpty(results)).toBeFalsy();
			expect(results.length).toEqual(1);

			results = results.first();
			expect(results.parent).toBeDefined();
			expect(results.children).toBeDefined();
		});
	});
});

