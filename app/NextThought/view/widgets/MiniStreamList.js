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
	items:[{html:'Recent Items:', cls:'sidebar-header'},{defaults:{border: false}}],
	
	_filter: {},
	_containerId: null,
	_stream: null,
	
	constructor: function(){
		this.callParent(arguments);
		
		//make a buffered function out of our updater
		this.updateStream = Ext.Function.createBuffered(this.updateStream,100,this);

		return this;
	},
	
	initComponent: function(){
		this.callParent(arguments);
        this.setContainer(this._containerId);
	},
	
	setContainer: function(id){
        this._containerId = id;
        this._stream = null;

        if(!id){
            this.updateStream();
            return;
        }

        UserDataLoader.getRecursiveStream(id,
            {
                scope: this,
                success: function(stream){
                    this._stream = stream;
                    this.updateStream();
                },
                failure: function() {}
            });


	},

    onNotification: function(c) {
        if (!this._containerId) return;
        if (!c) return;

        var id = c.Item ? c.Item.get('ContainerId') : null;
        if (!id || Library.isOrDecendantOf(this._containerId, id)) {
            this._stream = this._stream || [];
            this._stream.unshift(c);
            this.updateStream();
        }
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
                p.add({change: change, xtype: 'miniStreamEntry'});
			}
		}

        if (!c) p.add({html: 'No recent activity to show'});
	}
});