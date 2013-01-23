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

});

