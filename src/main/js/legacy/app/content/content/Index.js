const Ext = require('extjs');
const { encodeForURI, decodeFromURI } = require('nti-lib-ntiids');
const {getService} = require('nti-web-client');
const {Editor} = require('nti-content');

const ContentviewerIndex = require('legacy/app/contentviewer/Index');
const PageInfo = require('legacy/model/PageInfo');
const RelatedWork = require('legacy/model/RelatedWork');
const PlaylistItem = require('legacy/model/PlaylistItem');

const ContentActions = require('../Actions');

require('legacy/util/Parsing');
require('legacy/mixins/Router');
require('legacy/common/components/ResourceNotFound');
require('legacy/app/contentviewer/StateStore');

require('legacy/overrides/ReactHarness');

module.exports = exports = Ext.define('NextThought.app.content.content.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.bundle-content',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',
	cls: 'bundle-content',

	initComponent: function () {
		this.callParent(arguments);

		this.ContentActions = ContentActions.create();

		this.initRouter();

		this.addRoute('/', this.showRoot.bind(this));
		this.addRoute('/:id', this.showContent.bind(this));
		this.addRoute('/:id/edit', this.showEditContent.bind(this));
		this.addRoute('/:id/:page', this.showPage.bind(this));
		this.addRoute('/:id/:page/edit', this.showEditContent.bind(this));

		this.addDefaultRoute('/');

		this.on({
			'activate': this.onActivate.bind(this),
			'deactivate': this.onDeactivate.bind(this),
			'beforedeactivate': this.onBeforeDeactivate.bind(this)
		});
	},

	onActivate: function () {
		if (this.reader) {
			this.reader.fireEvent('activate');
		}
	},

	onDeactivate: function () {
		if (this.reader) {
			this.reader.fireEvent('deactivate');
		}
	},

	getContext: function () {
		if (this.reader) {
			return this.reader.pageInfo || this.reader.relatedWork;
		}
	},

	getActiveItem: function () {
		return this.reader;
	},

	getLocation: function () {
		return this.reader.getLocation();
	},

	hasReader: function () {
		return this.reader && !this.reader.isDestroyed;
	},

	isShowingPage: function (ntiid) {
		var assessmentItems;

		if (!this.page) {
			return false;
		}

		if (this.page.get('NTIID') === ntiid) {
			return true;
		}

		assessmentItems = this.page.get('AssessmentItems') || [];

		return assessmentItems.reduce(function (acc, item) {
			return acc || item.getId() === ntiid;
		}, false);
	},

	onBeforeDeactivate: function () {
		if (this.reader) {
			this.reader.hide();

			this.reader.destroy();
			delete this.reader;
		}

		if (this.editor) {
			this.editor.hide();

			this.editor.destroy();
			delete this.editor;
		}

	},

	bundleChanged: function (bundle) {
		if (bundle === this.currentBundle) { return; }

		if (this.reader) {
			this.reader.destroy();
		}

		this.root = bundle.getFirstPage();
		this.currentBundle = bundle;
	},

	__loadContent: function (id, obj) {
		if (obj && obj.getId() === id) {
			return Promise.resolve(obj);
		}

		//Try getting the object first, since it would return a related work or page info
		return Service.getObject(id, null, null, null, null, this.currentBundle)
			.then(o => {
				//if we don't get a page (pageinfo or related work) request a page info
				if (!o.isPage) {
					return Service.getPageInfo(id, null, null, null, this.currentBundle)
						.catch(() => {
							return Promise.reject(o);
						});
				}

				return o;
			})
			.then(page => {
				if(!page.getContentPackage) {
					return page;
				}

				return page.getContentPackage()
					.then((contentPackage) => {
						this.currentBundle.syncContentPackage(contentPackage);

						return page;
					})
					.catch(() => page);
			});
	},


	showEditor (page, parent, pageSource) {
		if (!this.rendered) {
			this.on('afterrender', this.showEditor.bind(this, page));
			return;
		}

		const packageId = page.get ? page.get('ContentPackageNTIID') : page;
		let breadcrumb;

		this.el.mask('Loading...');

		if (this.notFound) {
			this.notFound.destroy();
		}

		if (this.editor) {
			this.editor.destroy();
		}

		if (this.reader) {
			this.reader.destroy();
		}

		if (parent) {
			breadcrumb = [{
				label: parent.label,
				handleRoute: () => {
					this.handleNavigation(parent.title, parent.route);
				}
			}];
		}

		return getService()
			.then((service) => service.getObject(this.currentBundle.getId()))
			.then((course) => {
				const contentPackage = course.getPackage(packageId);

				if (!contentPackage) {
					return this.showReader(page, parent);

				}

				const onDelete = () => {
					this.currentBundle.updateFromServer()
						.then(() => {
							if (this.onDelete) {
								this.onDelete();
							}
						});
				};

				const gotoResources = () => {
					if (this.gotoResources) {
						this.gotoResources();
					}
				};

				this.editor = this.add({
					xtype: 'react',
					component: Editor,
					cls: 'native-content-editor',
					course,
					contentPackage,
					pageSource,
					breadcrumb,
					navigateToPublished: () => {
						// determine where to go after publishing completes
						// if coming from a lesson, handleContentNavigation handles a
						// route with the lesson included.  if not coming from a lesson
						// (the resources screen instead), handles a route with just the
						// content
						if(this.handleContentNavigation) {
							this.handleContentNavigation('', encodeForURI(contentPackage.getID()));
						}
						else {
							this.pushRoute('', encodeForURI(contentPackage.getID()));
						}
					},
					pageID: page.getId ? page.getId() : '',
					onDidChange: () => {
						this.currentBundle.updateContentPackage(packageId);
					},
					onDelete: onDelete,
					gotoResources: gotoResources
				});
			})
			.always(() => {
				if(page.get) {
					this.setTitle(page.get('Title'));
				}
				else {
					// specifically for the case of creating a new reading
					// since there is no title, setting it to blank removes
					// the "Loading..." title and defaults to the lesson name
					this.setTitle('');
				}

				this.el.unmask();
			});
	},


	showReader: function (page, parent, hash, note) {
		if (!this.rendered) {
			this.on('afterrender', this.showReader.bind(this, page));
			return;
		}

		var rootRoute = this.rootRoute || '',
			pageId = page.getId(),
			pageSource = this.ContentActions.getContentPageSource(page.getId(), this.currentBundle, this.root);

		if (this.reader && !this.reader.isDestroyed) {
			//If the reader is already showing the page no need to destroy it anc create it again
			if ((this.reader.pageInfo && this.reader.pageInfo.getId() === pageId) || (this.reader.relatedWork && this.reader.relatedWork.getId() === pageId)) {
				if (hash) {
					this.reader.goToFragment(hash);
				}

				if (note) {
					this.reader.goToNote(note);
				}
				return;
			} else {
				this.reader.destroy();
			}
		}

		if (this.notFound) {
			this.notFound.destroy();
		}

		if (this.editor) {
			this.editor.destroy();
		}

		pageSource.then(function (ps) {
			ps.getRoute = function (ntiid) {
				return rootRoute + encodeForURI(ntiid);
			};
		});

		this.page = page;
		this.pageId = page.getId();

		this.reader = ContentviewerIndex.create({
			pageInfo: page instanceof PageInfo ? page : null,
			relatedWork: page instanceof RelatedWork ? page : null,
			toc: !this.currentBundle.isCourse ? this.ContentActions.getTocStore(this.currentBundle) : null,
			path: this.ContentActions.getContentPath(page.getId(), this.currentBundle, parent, this.root, rootRoute),
			rootRoute: rootRoute,
			pageSource: pageSource,
			bundle: this.currentBundle,
			handleNavigation: this.handleNavigation.bind(this),
			navigateToObject: this.navigateToObject && this.navigateToObject.bind(this),
			fragment: hash,
			note: note,
			hideHeader: this.hideHeader
		});

		this.setTitle(page.get('label'));

		this.add(this.reader);
		this.reader.fireEvent('activate');
	},

	__onFail: function (reason) {
		console.error('Failed to load page:', reason);
		this.setTitle('Not Found');

		if (this.reader) {
			this.reader.destroy();
		}

		if (this.editor) {
			this.editor.destroy();
		}

		if (!this.notFound) {
			this.notFound = this.add({
				xtype: 'notfound',
				gotoLibrary: this.pushRootRoute.bind(this, 'Library', '/')
			});
		}
	},

	showContent: function (route, subRoute) {
		var me = this,
			ntiid = route.params.id,
			obj = route.precache.pageInfo || route.precache.relatedWork;

		ntiid = decodeFromURI(ntiid);

		return this.__loadContent(ntiid, obj)
			.then(function (page) {
				me.showReader(page, route.precache.parent, route.hash, route.precache.note);

				if (me.activeMediaWindow) {
					me.activeMediaWindow.destroy();
				}
			})
			.catch(() => {
				this.__onFail();
			});
	},

	showPage: function (route, subRoute) {
		var me = this,
			root = route.params.id,
			pageId = route.params.page,
			obj = route.precache.pageInfo || route.precache.relatedWork,
			precache = route.precache;

		root = decodeFromURI(root);

		if (pageId === 'video') {
			const vid = decodeFromURI(subRoute.split('/')[1]);
			const video = precache.video || precache.precache && precache.precache.video;

			return this.__loadContent(root, obj)
				.then(page => {
					me.showReader(page, route.precache.parent, route.hash, route.precache.note);
					var p = video ? Promise.resolve(video) :
						Service.getObject(vid).then(function (v) {
							var o = v.isModel ? v.raw : v;
							return Promise.resolve(
								PlaylistItem.create(Ext.apply({ NTIID: o.ntiid }, o))
							);
						});

					p.then(v => {
						route.precache.video = v;
						me.showMediaView(route, subRoute);
					});
				})
				.catch(() => {
					this.__onFail();
				});
		}

		pageId = decodeFromURI(pageId);

		if (!this.root) {
			this.root = root;
		} else if (this.root !== root) {
			console.warn('Trying to show a reading a root that is different form what we got the root set as...');
		}

		if (me.activeMediaWindow) {
			me.activeMediaWindow.destroy();
		}

		return this.__loadContent(pageId, obj)
			.then(function (page) {
				me.showReader(page, route.precache.parent, route.hash, route.precache.note);
			});
	},


	showEditContent (route) {
		const obj = route.precache.pageInfo || route.precache.relatedWork;
		let root = route.params.id;
		let pageID = route.params.page;

		root = root && decodeFromURI(root);
		pageID = pageID && decodeFromURI(pageID);

		return this.__loadContent(root, obj)
			.then((page) => {
				this.showEditor(page, route.precache.parent, route.precache.pageSource, pageID);
			})
			.catch(err => {
				this.showEditor(root, route.precache.parent, route.precache.pageSource);
			});
	},


	showRoot: function (route, subRoute) {
		var me = this;

		return Service.getPageInfo(this.root, null, null, null, me.currentBundle)
			.then(function (pageInfo) {
				me.showReader(pageInfo, null, route.hash, route.precache.note);
			})
			.catch(this.__onFail.bind(this));
	},

	showNote: function (note) {
		this.reader.goToNote(note);
	},

	getVideoRouteForObject: function (obj) {
		var page = obj.page,
			pageId = page && page.isModel ? page.getId() : page,
			videoId = obj.get && obj.getId();

		pageId = encodeForURI(pageId);
		videoId = encodeForURI(videoId);

		return {
			route: pageId + '/video/' + videoId,
			title: obj.get && obj.get('title'),
			precache: {
				video: obj.isModel ? obj : null,
				page: page,
				basePath: obj.basePath
			}
		};
	},

	showMediaView: function (route, subRoute) {
		var me = this,
			root = route.params.id;

		if (!me.activeMediaWindow) {
			me.activeMediaWindow = me.add({
				xtype: 'media-window-view',
				currentBundle: me.currentBundle,
				autoShow: true,
				handleNavigation: me.handleNavigation.bind(me)
			});

			me.addChildRouter(me.activeMediaWindow);

			me.activeMediaWindow.fireEvent('suspend-annotation-manager', this);
			me.activeMediaWindow.on({
				'beforedestroy': function () {
					// me.getLayout().setActiveItem(me.getLessons());
				},
				'destroy': function () {
					if (me.activeMediaWindow) {
						me.activeMediaWindow.fireEvent('resume-annotation-manager', this);
					}
					delete me.activeMediaWindow;
				}
			});
		}

		// me.getLayout().setActiveItem(me.activeMediaWindow);
		me.activeMediaWindow.currentBundle = me.currentBundle;
		me.activeMediaWindow.parentLesson = root;
		return me.activeMediaWindow.handleRoute(subRoute, route.precache);
	},

	handleNavigation: function (title, route, precache) {
		this.pushRoute(title, route, precache);
	}
});
