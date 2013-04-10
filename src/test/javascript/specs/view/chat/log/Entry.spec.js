describe('Entry Link Tests',function(){
	var Entry, testBody, noop = function(){};

	beforeEach(function(){
		testBody = document.createElement('div');
		document.body.appendChild(testBody);
		Entry = Ext.create('NextThought.view.chat.log.Entry',{
			renderTo: testBody,
			afterRender: noop,
			initComponent: noop,
			message:{
				get: function(){ return 'false';},
				getId: function(){ return 'id';}
			}
		});

		spyOn(Entry,'fireEvent');
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

		Entry.click(e);

		expect(Entry.fireEvent).toHaveBeenCalledWith('navigate-to-href',Entry,'www.google.com');
	});

	it('passing a whiteboard container for reply',function(){
		var e = {
			stopEvent: noop,
			getTarget: function(v){
				if(v === '.whiteboard-container'){
					return true;
				}else if (v === '.reply') {
					return true;
				}
			}
		};

		Entry.click(e);

		expect(Entry.fireEvent).toHaveBeenCalledWith('reply-to-whiteboard','f',Entry,'id','false','false');
	});

	it('passing a whiteboard container for read only',function(){
		var e = {
			stopEvent: noop,
			getTarget: function(v){
				if(v === '.whiteboard-container'){
					return true;
				}
				return null;
			}
		};

		Entry.click(e);

		expect(Entry.fireEvent).toHaveBeenCalledWith('show-whiteboard',Entry,'f');
	});
	
});
