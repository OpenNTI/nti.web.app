Ext.define('NextThought.view.widgets.MiniStreamList', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.mini-stream',
	requires: [
			'NextThought.proxy.UserDataLoader',
            'NextThought.view.widgets.MiniStreamEntry'
			],
	
	border: false,
	margin: '15px auto',
	defaults: {border: false},
	items:[{html:'Recent Items:', cls:'sidebar-header'},{margin: 3, defaults:{border: false}}],
	
	_filter: {},
	_containerId: null,
	
	_task: null,
	_stream: null,
	
	constructor: function(){
		this.callParent(arguments);
		
		//make a buffered function out of our updater
		this.updateStream = Ext.Function.createBuffered(this.updateStream,100,this);

		
		// Start a simple clock task that updates a div once per second
		this._task = {
		    run: function(){
		    	if(!this._containerId)return;
		    	
		        UserDataLoader.getRecursiveStream(
		        	this._containerId,{
		        	scope: this,
		        	success: function(stream){
		        		this._stream = stream;
		        		this.updateStream();
		        	},
                    failure: function() {
                        if(NextThought.isDebug)
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
        this.hide();
	},
	
	setContainer: function(id){
		Ext.TaskManager.stop(this._task);
		this._containerId = id;
		Ext.TaskManager.start(this._task);
	},
	
	applyFilter: function(filter){
		this._filter = filter;
		this.updateStream();
	},

	updateStream: function(){
		var k, change, c=0,
			p = this.items.get(1),
			f = this._filter;
			
		p.removeAll();
		
		if(!this._stream)return;
		
		for(k in this._stream){
			if(!this._stream.hasOwnProperty(k))continue;
			change = this._stream[k];

            if (!change.get) {
                //dead change, probably deleted...
                continue;
            }

            var u = change.get('Creator');

			if( /all/i.test(f.groups) || f.shareTargets && f.shareTargets[ u ] || (f.includeMe && f.includeMe==u)){
				c++;
                p.add(Ext.create('NextThought.view.widgets.MiniStreamEntry', {change: change}));
			}
		}

        (c==0? this.hide : this.show).call(this);
	}
});