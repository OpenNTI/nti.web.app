const Ext = require('extjs');

const Globals = require('legacy/util/Globals');
const ContentProxy = require('legacy/proxy/JSONP');
const WebvttTranscript = require('legacy/webvtt/Transcript');
const Note = require('legacy/model/Note');
const Slidedeck = require('legacy/model/Slidedeck');
const PlaylistItem = require('legacy/model/PlaylistItem');
const TranscriptItem = require('legacy/model/transcript/TranscriptItem');
const PageItem = require('legacy/store/PageItem');
const UserdataActions = require('legacy/app/userdata/Actions');
const UserdataStateStore = require('legacy/app/userdata/StateStore');
const PathActions = require('legacy/app/navigation/path/Actions');
const LibraryActions = require('legacy/app/library/Actions');

const MediaviewerStateStore = require('./StateStore');

require('legacy/common/Actions');


module.exports = exports = Ext.define('NextThought.app.mediaviewer.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.callParent(arguments);

		this.MediaUserDataStore = MediaviewerStateStore.getInstance();
		this.UserDataActions = UserdataActions.create();
		this.UserDataStore = UserdataStateStore.getInstance();
		this.PathActions = PathActions.create();
		this.LibraryActions = LibraryActions.create();
	},

	initPageStores: function (cmp, cid) {
		var context = this.MediaUserDataStore.getContext(cmp);
		context.currentPageStores = {};
	},

	hasPageStore: function (id, ctx) {
		if (!ctx || !id) {
			return false;
		}

		return !!ctx.currentPageStores[id];
	},

	getPageStore: function (id, ctx) {
		if (!ctx || !id) { return false; }

		return ctx.currentPageStores[id];
	},

	addPageStore: function (id, store, ctx) {
		if (this.hasPageStore(id, ctx)) {
			console.warn('replacing an existing store??');
		}

		ctx.currentPageStores[id] = store;
	},

	loadUserData: function (cmps, reader) {
		var cid, me = this, loaded;
		const unregisteredCmp = cmps.filter(c => c.unregisteredNoteContainer === true)[0];
		const unregisteredNotes = [];

		loaded = Ext.Array.map(cmps, function (cmp) {
			var p;

			cid = cmp.containerIdForData && cmp.containerIdForData();
			cid = Ext.isObject(cid) ? cid.containerId : cid;

			if (cid) {
				me.initPageStores(cmp);
				p = me.loadAnnotations(cmp, cid)
					.then(function (store) {
						var o = reader && reader.noteOverlay;

						if (o && o.registerGutterRecords) {
							o.registerGutterRecords(store, store.getRange(), cmp, (note) => unregisteredNotes.push({note, store}));
							return Promise.resolve();
						}

						return Promise.reject();
					})
					.catch(function () {
						return Promise.reject();
					});
			}

			return p || Promise.reject();
		});

		Promise.all(loaded)
			.then(() => {
				const o = reader && reader.noteOverlay;
				const seen = {};

				if (!unregisteredCmp || !o || !o.registerOrphanedRecord) { return; }

				for (let unregistered of unregisteredNotes) {
					const {note, store} = unregistered;
					const id = note && note.getId();

					if (id && !seen[id]) {
						o.registerOrphanedRecord(store, note, unregisteredCmp);
						seen[id] = true;
					}
				}
			});


		return loaded;
	},

	realignNotes (cmps, overlay) {
		const unregisteredCmp = cmps.filter(c => c.unregisteredNoteContainer)[0];
		const unregisteredNotes = [];
		const seen = {};

		for (let cmp of cmps) {
			const store = cmp.userDataStore;

			overlay.registerGutterRecords(store, store.getRange(), cmp, (note) => unregisteredNotes.push({note, store}));
		}

		if (!unregisteredCmp) { return; }

		for (let unregistered of unregisteredNotes) {
			const {note, store} = unregistered;
			const id = note && note.getId();

			if (id && !seen[id]) {
				this.registerOrphanedRecord(store, note, unregisteredCmp);
				seen[id] = true;
			}
		}
	},

	loadAnnotations: function (cmp, containerId) {
		var context = this.MediaUserDataStore.getContext(cmp),
			store, me = this, parentContext = this.UserDataStore.getContext(cmp.ownerCt);

		me.MediaUserDataStore.addComponentForStore(cmp, containerId);
		return new Promise(function (fulfill, reject) {
			if (me.hasPageStore(containerId, context)) {
				store = me.getPageStore(containerId);
				fulfill(store);
			}
			else {
				store = me.__buildPageStore(containerId);
				me.addPageStore(containerId, store, context);
				me.UserDataActions.addPageStore(containerId, store, parentContext);
				cmp.bindToStore(store);

				store.on({
					'load': function (s) {
						fulfill(s);
					},
					single: true
				});

				store.load();
			}
		});
	},

	__buildPageStore: function (containerId) {
		var props = {}, object;

		if (Ext.isObject(containerId)) {
			object = containerId;
			containerId = object.containerId;
			Ext.Object.each(object, function (k, v) {
				if (k !== 'containerId') {
					props[k] = v;
				}
			});
		}

		var url = Service.getContainerUrl(containerId, Globals.USER_GENERATED_DATA),
			store = PageItem.make(url, containerId, true);

		store.doesNotParticipateWithFlattenedPage = true;
		Ext.apply(store.proxy.extraParams, {
			accept: Note.mimeType,
			filter: 'TopLevel'
		});

		Ext.apply(store, props || {});
		return store;
	},

	loadTranscript: function (transcript) {
		var me = this;

		if (!transcript) {
			return Promise.reject('No Transcript');
		}

		return new Promise(function (fulfill, reject) {
			me.loadRawTranscript(transcript)
				.then(function (c) {
					var parser = new WebvttTranscript({ input: c, ignoreLFs: true }),
						cueList = parser.parseWebVTT();

					fulfill(cueList);
				})
				.catch(function () {
					console.log('Failure to load transcripts... ', arguments);
					reject(arguments);
				});
		});
	},

	loadRawTranscript: function (transcript) {
		var base = transcript.get('basePath'),
			jsonpUrl = transcript.get('jsonpUrl'),
			url = transcript.get('url');

		function fixURL (href, basePath) {
			if (Globals.ROOT_URL_PATTERN.test(href)) {
				href = Globals.getURL(href);
			} else if (!Globals.HOST_PREFIX_PATTERN.test(href)) {
				href = Globals.getURLRooted(href, basePath);
			}

			return href;
		}

		jsonpUrl = fixURL(jsonpUrl, base);
		url = fixURL(url, base);

		if (!transcript) {
			return Promise.reject();
		}

		return new Promise(function (fulfill, reject) {
			ContentProxy.request({
				jsonpUrl: jsonpUrl,
				url: url,
				ntiid: 'webvtt',
				expectedContentType: transcript.get('contentType'),
				success: function (res, req) {
					console.log('SUCCESS Loading Transcripts: ', arguments);
					fulfill(res.responseText);
				},
				failure: function () {
					console.log('FAILURE Loading Transcripts: ', arguments);
					reject(arguments);
				}
			});
		});
	},

	loadSlidedeck: function (slidedeckId) {
		return Service.getObject(slidedeckId);
	},

	getBasePath: function (obj) {
		var me = this;
		return new Promise(function (fulfill, reject) {
			me.PathActions.getPathToObject(obj)
				.then(function (path) {
					var course = path[0], p;
					if (course) {
						p = course.getContentRoots()[0];
					}
					fulfill(p);
				})
				.catch(reject);
		});
	},

	fixSlideImagesPath: function (slides, basePath, fullPath) {
		var pageInfo = (fullPath || []).last(),
			courseBundle = (fullPath || []).first();

		Ext.each(slides || [], function (slide) {
			var image = slide.get('image');
			if (image) {
				image = (basePath || '') + image;
				slide.set('image', image);
				slide.pageInfo = pageInfo;
				slide.courseBundle = courseBundle;
			}
		});
	},

	buildSlidedeckPlaylist: function (slidedeck) {
		var videos = {},
			transcripts = {}, me = this, promises,
			slideStore;

		if (!slidedeck || !(slidedeck instanceof Slidedeck)) {
			return Promise.reject();
		}

		slideStore = new Ext.data.Store({
			proxy: 'memory',
			model: 'NextThought.model.Slide',
			data: slidedeck.get('Slides') || []
		});

		this.setSlideDocContent(slidedeck, slideStore);

		promises = Ext.Array.map(slidedeck.get('Videos'), function (slidevideo) {
			var transcript;

			return new Promise(function (fulfill) {
				Service.getObject(slidevideo.video_ntiid)
					.then(function (video) {
						var obj = video.raw || video.getData();
						video = PlaylistItem.create(obj);
						videos[slidevideo.NTIID] = video;

						return me.PathActions.getPathToObject(slidedeck)
							.then(function (path) {
								var course = path[0], basePath;
								if (course) {
									basePath = course.getContentRoots()[0];
								}

								transcript = TranscriptItem.fromVideo(video, basePath);
								transcripts[slidevideo.NTIID] = transcript;
								me.fixSlideImagesPath(slideStore.getRange(), basePath, path);
								fulfill();
							});
					});
			});
		});


		return new	Promise( function (fulfill, reject) {
			Promise.all(promises)
				.then(me.__fixSlideContainer.bind(me, slidedeck, slideStore))
				.then(function () {
					var items = me.buildSlidedeckComponents(slideStore, videos, transcripts),
						vids = [], k;

					for (k in videos) {
						if (videos.hasOwnProperty(k)) {
							vids.push(videos[k]);
						}
					}

					fulfill({videos: vids, items: items});
				});
		});
	},

	__fixSlideContainer: function (slidedeck, slideStore) {
		var me = this;

		return new Promise(function (fulfill) {
			me.__getSlidedeckContainer(slidedeck)
				.then(function (containerId) {
					slideStore.each(function (slide) {
						slide.set('ContainerId', containerId);
					});
					fulfill();
				});
		});
	},

	__getSlidedeckContainer: function (slidedeck) {
		var me = this;
		return new Promise((fulfill, reject) => {
			me.PathActions.getPathToObject(slidedeck)
				.then(path => {
					var last = path && path.last();
					if (!last) { reject(); }

					fulfill(last.getId());
				});
		});
	},

	setSlideDocContent: function (slidedeck, slideStore) {
		var me = this,
			cid;

		return new Promise(function (fulfill, reject) {
			me.__getSlidedeckContainer(slidedeck)
				.then(Service.getObject.bind(Service))
				.then(me.loadPageContent.bind(me))
				.then(me.parseSlideDocFragments.bind(me, cid, slideStore))
				.then(fulfill);
		});
	},

	loadPageContent: function (pageInfo) {
		var me = this,
			link = pageInfo.getLink('content'),
			contentPackage = pageInfo.get('ContentPackageNTIID');

		return Promise.all([
			Service.request(link),
			me.LibraryActions.findContentPackage(contentPackage)
		]).then(function (results) {
			let xml = results[0];
			// const content = results[1];

			xml = (new DOMParser()).parseFromString(xml, 'text/xml');

			if (xml.querySelector('parsererror')) {
				return Promise.resolve('');
			}
			return Promise.resolve(xml);
		});
	},

	parseSlideDocFragments: function (containerId, slideStore, doc) {
		var slideFrags = Ext.DomQuery.select('object[type="application/vnd.nextthought.slide"]', doc),
			fragsMap = {};

		Ext.each(slideFrags, function (dom) {
			var id = dom.getAttribute('data-ntiid'),
				frag = (dom.ownerDocument || document).createDocumentFragment();
			frag.appendChild(dom);
			fragsMap[id] = frag;
		});

		slideStore.each(function (slide) {
			slide.set('dom-clone', fragsMap[slide.getId()]);
		});

		return Promise.resolve();
	},

	buildSlidedeckComponents: function (slideStore, videosMap, transcriptsMap) {
		var isTitle = true, items = [];

		slideStore.each(function (slide) {
			var vid = slide.get('video-id'),
				t = transcriptsMap && transcriptsMap[vid],
				video = videosMap && videosMap[vid],
				start = slide.get('video-start'),
				end = slide.get('video-end');

			if (video && isTitle) {
				items.push({
					xtype: 'video-title-component',
					video: video
				});

				isTitle = false;
			}

			items.push({
				xtype: 'slide-component',
				slide: slide,
				layout: {
					type: 'vbox',
					align: 'stretch'
				}
			});

			if (t) {
				// NOTE: make a copy of the transcript record,
				// since many slide can have the same transcript but different start and end time.
				t = t.copy();
				t.set('desired-time-start', start);
				t.set('desired-time-end', end);

				items.push({
					xtype: 'video-transcript',
					flex: 1,
					transcript: t,
					layout: {
						type: 'vbox',
						align: 'stretch'
					}
				});
			}
		}, this);

		return items;
	}
});
