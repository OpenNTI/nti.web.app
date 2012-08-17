Ext.define('NextThought.controller.Stream', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.proxy.Socket',
		'NextThought.util.Parsing'
	],

	stores: [
		'Stream'
	],

	models: [
		'Change',
		'PageInfo'
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
	},

	onSessionReady: function(){
		//Load page and root stream stores...
		var ss = this.getStreamStore();
		ss.on('add', this.updateStreamStore, this);

		$AppConfig.service.getPageInfo(Globals.CONTENT_ROOT,
			//success:
			function(pageInfo){
				ss.getProxy().url = pageInfo.getLink(Globals.RECURSIVE_STREAM);
				ss.load();
			},
			//failure:
			function(){
				console.error('Could not load Stream Store!', arguments);
			},
			this);
	},


	//called by the Library controller when navigation occurs
	containerIdChanged: function(containerId) {
		var as = Ext.getCmp('activity-stream'),
			ss = this.getStreamStore(),
			friendsToChangeMap = {},
			masterId = LocationProvider.getLineage(containerId).last();

		function addUsers(m, activityStream) {
			var user;

			function update(u){
				activityStream.addUser(u[0], m[u[0].get('Username')], true);
			}

			for (user in m) {
				if (m.hasOwnProperty(user)){
					UserRepository.getUser(user, update, this);
				}
			}
		}

		function addToChangeMap(mid, change, m) {
			var itemContainerId = LocationProvider.getLineage(change.get('Item').get('ContainerId')).last(),
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

		ss.each(
			function(change) {
				addToChangeMap(masterId, change, friendsToChangeMap);
			}
			,this);

		addUsers(friendsToChangeMap, as);
	},


	updateStreamStore: function(store, records) {
		var as = Ext.getCmp('activity-stream');
		Ext.each(records, function(r){
			as.addActivity(r.get('Creator'), r);
		}, this);
	},


	getStoreForStream: function(containerId, success, failure, scope) {
		var me = this,
			stores = me.streamStores,
			ps = stores[containerId];

		//root all streams to the book...
		containerId = LocationProvider.getLineage(containerId).last();

		function pageInfoSuccess(pageInfo) {
			var link = pageInfo.getLink(Globals.RECURSIVE_STREAM);
			//page exists but no link, does this still happen?
			if(link===null) {
				return;
			}

			ps = stores[containerId] || Ext.create('NextThought.store.Stream',
				{ storeId:'stream-store:'+containerId, containerId: containerId });

			ps.getProxy().url = link;
			stores[containerId] = ps;
			Ext.callback(success, scope, [ps]);
		}

		//If we already have that store, just callback, otherwise go about loading it.
		if (ps) {
			Ext.callback(success, scope, [ps]);
		}
		else {
			$AppConfig.service.getPageInfo(containerId, pageInfoSuccess, failure, this);
		}
	},


	incomingChange: function(change) {
		change = ParseUtils.parseItems([change])[0];
		var me = this,
			item = change.get('Item'),
			cid = change.getItemValue('ContainerId'),
			libPageStore = this.getController('Library').pageStores[cid];

		Ext.each(LocationProvider.getLineage(cid),function(cid){
			me.getStoreForStream(cid,
				//success
				function(s){
					s.add(change);
				},
				//failure
				function(){
					console.error('could not load store for', cid, arguments);
				},
				me
			);
		});

		//add it to the root stream store, why the heck not?
		this.getStreamStore().add(change);
		this.getStreamStore().filter();
		this.self.fireChange(change);

		//add it to the page items store I guess:
		if (libPageStore){
			if(!/deleted/i.test(change.get('ChangeType'))){
				libPageStore.add(item);
			}
			else {
				item = libPageStore.getById(item.getId());
				if(item){
					libPageStore.remove(item);
				}
			}
		}
	}
});
