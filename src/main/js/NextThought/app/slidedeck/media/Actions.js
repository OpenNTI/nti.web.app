Ext.define('NextThought.app.slidedeck.media.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.app.slidedeck.media.StateStore'
	],

	constructor: function() {
		this.callParent(arguments);

		this.mediaUserDataStore = NextThought.app.slidedeck.media.StateStore.getInstance();
	},


	initPageStores: function(cmp, cid) {
		var context = this.mediaUserDataStore.getContext(cmp);
		context.currentPageStores = {};
	},


	hasPageStore: function(id, ctx) {
		if(!ctx || !id) {
			return false;
		}

		return !!ctx.currentPageStores[id];
	},


	getPageStore: function(id, ctx) {
		if(!ctx || !id) { return false; }

		return ctx.currentPageStores[id];
	},


	addPageStore: function(id, store, ctx) {
		if (this.hasPageStore(id, ctx)) {
			console.warn('replacing an existing store??');
		}

		ctx.currentPageStores[id] = store;
	},

	
	loadUserData: function(cmps, reader) {
		var cid, me = this;

		Ext.each(cmps, function(cmp) {
			var p;
			cid = cmp.containerIdForData && cmp.containerIdForData();

			if(cid){
				me.initPageStores(cmp);
				me.loadAnnotations(cmp, cid)
					.then(function(store, cmp) {
						var o = reader && reader.noteOverlay;

						if(o && o.registerGutterRecords){
							o.registerGutterRecords(store, store.getRange(), cmp);
						}
					});
			}
		});
	},


	loadAnnotations: function(cmp, containerId) {
		var context = this.mediaUserDataStore.getContext(cmp),
			store, me = this;

		return new Promise(function(fulfill, reject) {
			if (me.hasPageStore(containerId, context)) {
				store = me.getPageStore(cid);
				fulfill(store, cmp);
			}
			else {
				store = me.__buildPageStore(containerId);
				me.addPageStore(containerId, store, context);
				cmp.bindToStore(store);

				store.on(me, {
					'load': function(s){
						fulfill(s, cmp);
					},
					single: true
				});

				store.load();
			}	
		});
		
	},

	
	__buildPageStore: function(containerId) {
		var props = {};

		if (Ext.isObject(containerId)) {
			object = containerId;
			containerId = object.containerId;
			Ext.Object.each(object, function(k, v) {
				if (k !== 'containerId') {
					props[k] = v;
				}
			});
		}

		var url = Service.getContainerUrl(containerId, Globals.USER_GENERATED_DATA),
			store = NextThought.store.PageItem.make(url, containerId, true);

		store.doesNotParticipateWithFlattenedPage = true;
		Ext.apply(store.proxy.extraParams, {
			accept: NextThought.model.Note.mimeType,
			filter: 'TopLevel'
		});

		Ext.apply(store, props || {});
		return store;
	}
});
