describe('Transcript link tests',function(){
	var testBody, Transcript, noop = function(){};

	beforeEach(function(){
		testBody = document.createElement('div');
		document.body.appendChild(testBody);
		Transcript = Ext.create('NextThought.view.chat.transcript.Main',{
			renderTo: testBody,
			afterRender: noop,
			initComponent: noop,
			readOnlyWBsData:['id']
		});

		spyOn(Transcript,'fireEvent');
	});

	afterEach(function(){
		document.body.removeChild(testBody);
	});

	it('passing an anchor fires navigate-to-href',function(){
		var e = {
			stopEvent: noop,
			getTarget: function(v){
				if(v === 'a'){
					return {href:'www.google.com'};
				}else{
					return null;
				}
			}
		};

		Transcript.click(e);

		expect(Transcript.fireEvent).toHaveBeenCalledWith('navigate-to-href',Transcript,'www.google.com');
	});

	it('passing a whiteboard-container fires show-whiteboard',function(){
		var e = {
			stopEvent: noop,
			getTarget: function(v){
				if(v === '.whiteboard-container'){
					return {
						up: function(){
							return {
								getAttribute: function(){
									return 0;
								}
							}
						}
					}
				}
			}
		};

		Transcript.click(e);

		expect(Transcript.fireEvent).toHaveBeenCalledWith('show-whiteboard',Transcript,'id');
	});
});