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

		this.application.on('session-ready', this.sessionReady, this);

        Socket.register({
            'data_noticeIncomingChange': function(){me.incomingChange.apply(me, arguments);}
        });

        this.control({
			'stream-mode-container filter-control':{
				'filter-changed': this.streamFilterChanged
            }
        },{});
    },


	sessionReady: function(){
		var store = this.getStreamStore();
		store.proxy.url = _AppConfig.service.getStreamURL();
		store.load();
	},


    incomingChange: function(change) {
        change = ParseUtils.parseItems([change])[0];
        this.getStreamStore().add(change);

        this.self.fireChange(change);
    },

    streamFilterChanged: function(newFilter){
        var o = [
            this.getStream(),
            this.getStreamPeople()
        ];

        Ext.each(o,function(i){i.applyFilter(newFilter);});
    }

});
