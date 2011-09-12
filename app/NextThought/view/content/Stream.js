
Ext.define('NextThought.view.content.Stream', {
	extend:'NextThought.view.content.Panel',
    alias:'widget.stream-panel',
	requires: [
			'NextThought.proxy.UserDataLoader',
            'NextThought.view.widgets.StreamEntry'
			],
	cls: 'x-stream-home',

    autoScroll: false,
	border: false,
    defaults: {border: false},
	items:[{autoScroll:true, padding: 5}],

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
                        if(NextThought.isDebug)
                            Ext.TaskManager.stop(this._task);
                    }
		        });
		    },
		    scope: this,
		    interval: 300000//30 sec
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
                //dead change, probably deleted...
                continue;
            }

			var u = change.get('Creator');

			if(/all/i.test(f.groups) || f.shareTargets[ u ] || (f.includeMe && f.includeMe==u)){
                p.add({change: change, xtype: 'streamEntry'});
			}
		}
	}
});