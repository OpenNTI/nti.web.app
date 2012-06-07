describe("Anchor Utils", function() {
	var AnchorUtils;

	/**
	 * Just do basic setup stuff, make sure anchors utils is setup.
	 */
	//Make sure setup gets called before each test.
	beforeEach(function(){
		AnchorUtils = new NextThought.util.shared.Anchors();
	});

	describe("Tests", function(){
		it("Make sure Anchors is defined", function() {
			expect(NextThought.util.shared.Anchors).toBeDefined();
		});

		it('fake test is best', function(){
			expect(AnchorUtils.doSomething()).toBe(1);
		});
	});



});

