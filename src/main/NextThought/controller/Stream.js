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
        ss = this.getStoreForStream(containerId);
		widget.setStore(ss);
		if( ss.getProxy().url && !ss.isLoading() )
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

			//page exists, no link
			if(link===null) return null;

			//we don't know... reload page store
			if(link===false) {
				store.on('load', onReload, me, {single: true});
				store.load();
			}

			ps = stores[containerId] || Ext.create('NextThought.store.Stream',
					{ storeId:'stream-store:'+containerId, _containerId: containerId });

			ps.getProxy().url = link;
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


    incomingChange: function(change) {
        change = ParseUtils.parseItems([change])[0];
        var cid = change.getItemValue('ContainerId'),
            lineage = Library.getLineage(cid),
			me = this;

		Ext.each(lineage,function(cid){
			var s = me.getStoreForStream(cid);
			if( s ) s.add(change);
		});

		this.getStreamStore().add(change);
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
