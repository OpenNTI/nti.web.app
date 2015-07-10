Ext.define('NextThought.app.slidedeck.media.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.app.slidedeck.media.StateStore',
		'NextThought.webvtt.Transcript',
		'NextThought.app.userdata.Actions',
		'NextThought.app.userdata.StateStore'
	],

	constructor: function() {
		this.callParent(arguments);

		this.MediaUserDataStore = NextThought.app.slidedeck.media.StateStore.getInstance();
		this.UserDataActions = NextThought.app.userdata.Actions.create();
		this.UserDataStore = NextThought.app.userdata.StateStore.getInstance();
	},


	initPageStores: function(cmp, cid) {
		var context = this.MediaUserDataStore.getContext(cmp);
		context.currentPageStores = {};
	},


	hasPageStore: function(id, ctx) {
		if (!ctx || !id) {
			return false;
		}

		return !!ctx.currentPageStores[id];
	},


	getPageStore: function(id, ctx) {
		if (!ctx || !id) { return false; }

		return ctx.currentPageStores[id];
	},


	addPageStore: function(id, store, ctx) {
		if (this.hasPageStore(id, ctx)) {
			console.warn('replacing an existing store??');
		}

		ctx.currentPageStores[id] = store;
	},


	loadUserData: function(cmps, reader) {
		var cid, me = this, loaded;

		loaded = Ext.Array.map(cmps, function(cmp) {
			var p;

			cid = cmp.containerIdForData && cmp.containerIdForData();
			cid = Ext.isObject(cid) ? cid.containerId : cid;

			if (cid) {
				me.initPageStores(cmp);
				p = me.loadAnnotations(cmp, cid)
					.then(function(store, cmp) {
						var o = reader && reader.noteOverlay;

						if (o && o.registerGutterRecords) {
							o.registerGutterRecords(store, store.getRange(), cmp);
							return Promise.resolve();
						}

						return Promise.reject();
					})
					.fail(function() {
						return Promise.reject();
					});
			}

			return p || Promise.reject();
		});

		return loaded;
	},


	loadAnnotations: function(cmp, containerId) {
		var context = this.MediaUserDataStore.getContext(cmp),
			store, me = this, parentContext = this.UserDataStore.getContext(cmp.ownerCt);

		me.MediaUserDataStore.addComponentForStore(cmp, containerId);
		return new Promise(function(fulfill, reject) {
			if (me.hasPageStore(containerId, context)) {
				store = me.getPageStore(containerId);
				fulfill(store, cmp);
			}
			else {
				store = me.__buildPageStore(containerId);
				me.addPageStore(containerId, store, context);
				me.UserDataActions.addPageStore(containerId, store, parentContext);
				cmp.bindToStore(store);

				store.on(me, {
					'load': function(s) {
						fulfill(s, cmp);
					},
					single: true
				});

				store.load();
			}
		});
	},


	__buildPageStore: function(containerId) {
		var props = {}, object;

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
	},


	loadTranscript: function(transcript) {
		var me = this;
		return new Promise(function(fulfill, reject) {
			me.loadRawTranscript(transcript)
				.then(function(c) {
					var parser = new NextThought.webvtt.Transcript({ input: c, ignoreLFs: true }),
						cueList = parser.parseWebVTT();

					// cache content and so we don't have to load it again.
					if (!me.MediaUserDataStore.getTranscriptObject(transcript.get('associatedVideoId'))) {
						me.MediaUserDataStore.cacheTranscriptObject(transcript.get('associatedVideoId'), c);
					}

					fulfill(cueList);
				})
				.fail(function() {
					console.log('Failure to load transcripts... ', arguments);
					reject(arguments);
				});
		});
	},


	loadRawTranscript: function(transcript) {
		var me = this,
			content = me.MediaUserDataStore.getTranscriptObject(transcript && transcript.get('associatedVideoId')),
			base = transcript.get('basePath'),
			jsonpUrl = transcript.get('jsonpUrl'),
			url = transcript.get('url');

		jsonpUrl = Globals.getURLRooted(jsonpUrl, base);
		url = Globals.getURLRooted(url, base);

		if (!transcript) {
			return new Promise.reject();
		}

		if (content) {
			return new Promise.resolve(content);
		}


		return new Promise(function(fulfill, reject) {
			ContentProxy.request({
				jsonpUrl: jsonpUrl,
				url: url,
				ntiid: 'webvtt',
				expectedContentType: transcript.get('contentType'),
				success: function(res, req) {
					console.log('SUCCESS Loading Transcripts: ', arguments);
					fulfill(res.responseText);
				},
				failure: function() {
					console.log('FAILURE Loading Transcripts: ', arguments);
					reject(arguments);
				}
			});
		});
	}
});
