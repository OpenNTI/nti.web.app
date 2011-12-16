Ext.define('NextThought.controller.Stream', {
    extend: 'Ext.app.Controller',

    requires: [
        'NextThought.proxy.Socket',
        'NextThought.util.ParseUtils'
    ],

	stores: [
		'Stream'
	],

    models: [
        'Change'
    ],

	views: [
        'modes.Stream',
        'content.Stream'
    ],

    refs: [
        { ref: 'viewport', selector: 'master-view' },
        { ref: 'streamPeople', selector: 'stream-mode-container people-list' },
        { ref: 'stream', selector: 'stream-mode-container stream-panel' },
        { ref: 'miniStream', selector: 'mini-stream' }
    ],

    statics:{
        eventName: 'changed',
        evtRouter: Ext.create('Ext.util.Observable'),

        registerChangeListener: function(callback, scope){
            this.evtRouter.on(this.eventName, callback, scope||window);
        },

        removeChangeListener: function(callback, scope){
            this.evtRouter.un(this.eventName, callback, scope||window);
        },

        fireChange: function(change){
            this.evtRouter.fireEvent(this.eventName, change);
        }

    },

    init: function() {
        var me = this;

        this.application.on('session-ready', this.onSessionReady, this);

        this.streamStores = {};

        Socket.register({
            'data_noticeIncomingChange': function(){me.incomingChange.apply(me, arguments);}
        });

        this.control({
			'stream-mode-container filter-control':{
				'filter-changed': this.streamFilterChanged
            }
        },{});
    },

    onSessionReady: function(){
        var s = this.getStreamStore(),
            ps = Ext.getStore('Page');

        function load() {
            s.getProxy().url = ps.getById('tag:nextthought.com,2011-10:Root').getLink(RECURSIVE_STREAM);
            s.load();
        }

        if (ps.isLoading()) {
            ps.on('load', load, this, {single: true});
        }
        else {
            load();
        }
    },

    containerIdChanged: function(containerId) {
		var widget = this.getMiniStream(),ss;
		//make sure stream doesn't contain old stuff.
		widget.updateStream([]);
		widget._containerId = containerId;
        ss = this.getStoreForStream(containerId);
        if (ss)
            ss.load();
    },

    getStoreForStream: function(containerId) {
		var me = this,
			store = me.getController('Reader').getPageStore(),
			stores = me.streamStores,
			ps = stores[containerId];

		function buildStore(){
			var ps,
				link = store.getLink(containerId,RECURSIVE_STREAM);

			if(link===null) return null;

			if(link===false) {
				store.on('load', onReload, me, {single: true});
				store.load();
				return false;
			}

			ps = Ext.create('NextThought.store.Stream', { storeId:'stream-store:'+containerId, _containerId: containerId });
			ps.getProxy().url = link;
			ps.on('load', me.onSpecificStreamLoadComplete, me);
			stores[containerId] = ps;
			return ps;
		}

		function onReload(){
			var link = store.getLink(containerId,RECURSIVE_STREAM),
				s;
			if(!link){
				console.warn('Could not find page:', containerId);
				return;
			}
			s = buildStore();
			s.load();
		}

		return ps? ps : buildStore();
    },

    onSpecificStreamLoadComplete: function(store)
    {
		var k = '_containerId',
			w = this.getMiniStream();

		if( w[k]==store[k] ) {
			w.updateStream(store.data.items);
		}
    },

    incomingChange: function(change) {
        change = ParseUtils.parseItems([change])[0];

        var cid = change.getItemValue('ContainerId'),
            s = this.getStoreForStream(cid),
            k = '_containerId',
            w = this.getMiniStream();

		if(s){
			s.add(change);
            if (w[k]==cid) w.addChange(change);
		}
        this.self.fireChange(change);
    },

    streamFilterChanged: function(newFilter){
        var o = [
            this.getStream(),
            this.getStreamPeople(),
            this.getMiniStream()
        ];

        Ext.each(o,function(i){i.applyFilter(newFilter);});
    }

});
