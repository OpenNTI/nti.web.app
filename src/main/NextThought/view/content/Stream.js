
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
	_stream: null,

	constructor: function(){
		this.callParent(arguments);

		//make a buffered function out of our updater
		this.updateStream = Ext.Function.createBuffered(this.updateStream,100,this);

		return this;
	},

    initComponent: function(){
   		this.callParent(arguments);
        this._store = UserDataLoader.getStreamStore();
        this._store.on('add', this.onAdd, this);
        this._store.on('load', this.onLoad, this);
	},

    onLoad: function(store, changes) {
        var changeSet = [];

        if(Ext.isArray(changes)) changeSet = changes;
        else store.each(function(c){changeSet.push(c);}, this);

        this.onAdd(store, changeSet);
    },

    onAdd: function(store, changeSet) {
        if (!changeSet) return;

        if (!Ext.isArray(changeSet)) changeSet = [changeSet];

        for (var key in changeSet) {
            if (!changeSet.hasOwnProperty(key)) continue;
            var c = changeSet[key];

            this._stream = this._stream || [];
            this._stream.unshift(c);
        }

        this.updateStream();
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