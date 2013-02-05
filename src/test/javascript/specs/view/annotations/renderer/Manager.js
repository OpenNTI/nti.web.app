describe('Annotation manager class', function(){

	it('Buffers the render method', function(){
		var renderCallCount = 0, i = 0,
			m = NextThought.view.annotations.renderer.Manager.create();

		//Mock the clock so we can have synchronous setTimout
		jasmine.Clock.useMock();
		//Mock the manager so we can count the actual calls to wrapped
		//manager
		spyOn(m, 'render').andCallThrough();

		m.events.on('rendering', function(){renderCallCount++;});

		for(i = 0; i < 5; i++){
			m.render('default');
		}

		jasmine.Clock.tick(501);

		//The render function should have been called 5 times
		//but it should have only actually done work once
		expect(m.render.calls.length).toBe(5);
		expect(renderCallCount).toBe(1);
	});
});

