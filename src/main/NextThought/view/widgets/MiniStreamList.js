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
	_store: null,
    
	constructor: function(){
		this.callParent(arguments);
		
		//make a buffered function out of our updater
		this.updateStream = Ext.Function.createBuffered(this.updateStream,100,this);

		return this;
	},
	
	initComponent: function(){
		this.callParent(arguments);
        this.setContainer(this._containerId);
        this._store = UserDataLoader.getStreamStore();
        this._store.on('add', this.onAdd, this);
        this._store.on('load', this.onLoad, this);
	},
	
	setContainer: function(id){
        var me = this;
        me._containerId = id;
        me._stream = null;

        if(!id){
            me.updateStream();
            return;
        }

        this.onLoad(this._store);
	},

    onLoad: function(store, changes) {
        var changeSet = [];

        if(Ext.isArray(changes)) changeSet = changes;
        else store.each(function(c){changeSet.push(c);}, this);

        this.onAdd(store, changeSet);
    },

    onAdd: function(store, changeSet) {
        if (!this._containerId) return;
        if (!changeSet) return;

        if (!Ext.isArray(changeSet)) changeSet = [changeSet];

        for (var key in changeSet) {
            if (!changeSet.hasOwnProperty(key)) continue;
            var c = changeSet[key];

            try {
                var id = c.get('Item') ? c.get('Item').get('ContainerId') : null;


                if (!id || Library.isOrDecendantOf(this._containerId, id)) {
                    this._stream = this._stream || [];
                    this._stream.unshift(c);

                }
            }
            catch (err) {
                console.log('Unexpected Error', err.message);
            }
        }

        this.updateStream();
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