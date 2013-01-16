describe('Whiteboard remembering tool and state', function(){

	var wbWindow, editor, testBody;
	beforeEach( function(){
		testBody = document.createElement('div');
		document.body.appendChild(testBody);
		wbWindow = Ext.create('NextThought.view.whiteboard.Window', { renderTo: testBody, width:802 });
		editor = wbWindow.down('whiteboard-editor');
	});

	afterEach(function(){
		wbWindow.destroy();
		document.body.removeChild(testBody);
	});

	it('checks initial tool state', function(){
		var currentState = editor.getCurrentState();

		expect(currentState.activeTool).toBeUndefined();
		expect(currentState.options).toBeUndefined();
	});

	it('checks changing the tool state', function(){
		var currentState;
		expect(editor.getCurrentState().activeTool).toBeUndefined();

		//Change selected tool to shape from pencil.
		expect(editor.toolbar.getCurrentTool().forTool).toEqual('pencil');
		editor.toolbar.setCurrentTool('shape');
		//Fire change event:
		editor.toolbar.fireEvent('wb-tool-change', editor.toolbar);

		currentState = editor.getCurrentState();
		expect(currentState.activeTool).toEqual('shape');
		expect(currentState.options.sides).toEqual(1);
		expect(currentState.options.stroke).toEqual("333333");
	});

	it('checks changing option state', function(){
		var option = editor.query('[option=triangle shape]')[0];

		//Change selected shape option from 1 (line) to 3 (triangle)
		expect(editor.getCurrentState().options.sides).toEqual(1);
		expect(editor.toolbar.getCurrentTool().getOptions().sides).toEqual(1);
		option.toggle(true);
		option.fireEvent('wb-options-change', option.up('wb-tool-shape-options'));

		expect(editor.getCurrentState().options.sides).toEqual(3);

	});

	it('checks if tool & options state are persisted', function(){
		var anotherWB = Ext.create('NextThought.view.whiteboard.Window', { renderTo: testBody, width:802 }),
			myEditor = anotherWB.down('whiteboard-editor'),
			currentState = myEditor.getCurrentState();

		expect(currentState.activeTool).toEqual('shape');
		expect(currentState.options.stroke).toEqual("333333");
		expect(currentState.options.sides).toEqual(3);

		anotherWB.destroy();
	});


});