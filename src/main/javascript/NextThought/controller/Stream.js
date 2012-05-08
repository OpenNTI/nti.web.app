Ext.define('NextThought.controller.Stream', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.proxy.Socket',
		'NextThought.util.ParseUtils'
	],

	stores: [
		'Stream',
		'Page'
	],

	models: [
		'Change'
	],

	views: [],

	refs: [],

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

//		this.control({},{});
	},

	onSessionReady: function(){
		//Load page and root stream stores...
		var ss = this.getStreamStore(),
			ps = this.getPageStore();

		ps.on('load', function(pageStore, records, success){
			if (!success) {
				console.error('Problem loading page store');
				return;
			}

			ss.getProxy().url = ps.getById('tag:nextthought.com,2011-10:Root').getLink(Globals.RECURSIVE_STREAM);
			ss.load();
		},this, {single: true});
	},


//	onClick: function(item) {
//		var cid = item.get('ContainerId'),
//			ntiid = item.getId(),
//			mType = item.getModelName(),
//			rp, p;
//
//		if (mType !== 'Note' && mType !== 'Highlight') {
//			return;
//		}
//
//		//ensure reader panel is up
//		rp = Ext.ComponentQuery.query('library-view-container')[0];
//		rp.activate();
//		p = rp.down('reader-panel').prefix;
//
//		LocationProvider.setLocation(cid, function(a){
//			if (IdCache.hasIdentifier(ntiid)){
//				//use default reader-panel prefix as we are always opening this in the reader panel
//				a.scrollToId(IdCache.getComponentId(ntiid, null, p));
//			}
//		});
//	},


	//called by the Library controller when navigation occurs
	containerIdChanged: function(containerId) {
		var as = Ext.getCmp('activity-stream'),
			friendsToChangeMap = {},
			masterId = Library.getLineage(containerId).last();

		function addUsers(m, activityStream) {
			for (var user in m) {
				if (m.hasOwnProperty(user)){
					UserRepository.prefetchUser(user, function(u){
						activityStream.addUser(u[0], m[u[0].get('Username')]);
					}, this);
				}
			}
		}

		function addToChangeMap(mid, change, m) {
			var itemContainerId = Library.getLineage(change.get('Item').get('ContainerId')).last(),
				creator;
			if (mid !== itemContainerId) {
				return;
			}

			creator = change.get('Creator');
			if (!m[creator]){
				m[creator] = [];
			}
			m[creator].push(change);
		}


		this.getStreamStore().each(
			function(change) {
				addToChangeMap(masterId, change, friendsToChangeMap);
			}
			,this);

		addUsers(friendsToChangeMap, as);

		//TODO - Is there a see all per user?  Should be...
		//TODO - ellipses the messages?
		this.getStreamStore().on('add', function(store, records) {
			Ext.each(records, function(r){
				as.addActivity(r.get('Creator'), r);
			}, this);
		});
	},


	getStoreForStream: function(containerId) {
		//root all streams to the book...
		containerId = Library.getLineage(containerId).last();
		var me = this,
			store = me.getController('Library').getPageStore(),
			stores = me.streamStores,
			ps = stores[containerId];

		function buildStore(){
			var ps,
				link = store.getLink(containerId,Globals.RECURSIVE_STREAM);

			//page exists, no link
			if(link===null) {
				return null;
			}

			//we don't know... reload page store
			if(link===false) {
				store.on('load', onReload, me, {single: true});
				store.load();
			}

			ps = stores[containerId] || Ext.create('NextThought.store.Stream',
					{ storeId:'stream-store:'+containerId, containerId: containerId });

			ps.getProxy().url = link;
			stores[containerId] = ps;
			return ps;
		}

		function onReload(){
			var link = store.getLink(containerId,Globals.RECURSIVE_STREAM),
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
			me = this;

		Ext.each(Library.getLineage(cid),function(cid){
			var s = me.getStoreForStream(cid);
			if( s ) {
				s.add(change);
			}
		});

		//add it to the root stream store, why the heck not?
		this.getStreamStore().add(change);


		this.self.fireChange(change);
	}
});
