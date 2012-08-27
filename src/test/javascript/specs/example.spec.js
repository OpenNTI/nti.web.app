describe("Basic Assumptions", function() {

	it("has ExtJS4 loaded", function() {
		expect(Ext).toBeDefined();
		expect(Ext.getVersion()).toBeTruthy();
		expect(Ext.getVersion().major).toEqual(4);
	});


	it("has loaded nextthought code",function(){
		expect(NextThought).toBeDefined();
	});



	it("jQuery loaded, but in no conflict mode", function(){
		//NOTE: We have to add jQuery back in because of mathquill for now...
		expect(typeof $).toBe('undefined');
		expect(typeof jQuery).toBeTruthy();
	});

});
