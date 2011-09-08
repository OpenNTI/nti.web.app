
Ext.define('NextThought.view.content.Stream', {
	extend:'NextThought.view.content.Panel',
    alias:'widget.stream-panel',
	requires: [
			'NextThought.proxy.UserDataLoader',
            'NextThought.view.widgets.StreamEntry'
			],
	cls: 'x-stream-home',

	border: false,

	defaults: {border: false},
	items:[{margin: 3, defaults:{border: false}}],

	_filter: {},

	_task: null,
	_stream: null,

	constructor: function(){
		this.callParent(arguments);

		//make a buffered function out of our updater
		this.updateStream = Ext.Function.createBuffered(this.updateStream,100,this);


		// Start a simple clock task that updates a div once per second
		this._task = {
		    run: function(){
		        UserDataLoader.getRecursiveStream(
		        	null,{
		        	scope: this,
		        	success: function(stream){
		        		this._stream = stream;
		        		this.updateStream();
		        	},
                    failure: function(){
                        Ext.TaskManager.stop(this._task);
                    }
		        });
		    },
		    scope: this,
		    interval: 30000//30 sec
		}
		Ext.TaskManager.start(this._task);
		return this;
	},

    initComponent: function(){
   		this.callParent(arguments);
	},

	applyFilter: function(filter){
		this._filter = filter;
		this.updateStream();
	},

	updateStream: function(){
		var k, change,
			p = this.items.get(0),
			f = this._filter;

		p.removeAll();

		if(!this._stream || !f.shareTargets)return;

		for(k in this._stream){
			if(!this._stream.hasOwnProperty(k))continue;
			change = this._stream[k];

            if (!change.get) {
                console.log('This change has no get method, what is it?', change);
                continue;
            }

			var u = change.get('Creator');

			if(f.shareTargets[ u ] || (f.includeMe && f.includeMe==u)){
                p.add(Ext.create('NextThought.view.widgets.StreamEntry', {change: change}));
			}
		}
	}
});