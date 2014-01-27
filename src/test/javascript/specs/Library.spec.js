describe('Library Store', function() {

	beforeEach(function() {
		Library.clearListeners(); //don't invoke the UI
		Library.getStore().removeAll();
		Library.load();

		app.getController('CourseWare').onSessionReady();

		waitsFor(
			function() { return Library.loaded; },
			'Library load never completed',
			30000
		);
	});






	it('should have titles (for tests)', function() {
		expect(Library.getStore().count()).toBeGreaterThan(0);
	});

});
