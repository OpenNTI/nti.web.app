Ext.define('NextThought.view.content.View', {
	extend: 'NextThought.view.Base',
	alias: 'widget.content-view-container',
	requires: [
		'NextThought.view.reader.Panel',
		'NextThought.view.courseware.View',
		'NextThought.view.courseware.assessment.Container',
		'NextThought.view.courseware.assessment.View',
		'NextThought.view.courseware.dashboard.View',
		'NextThought.view.courseware.forum.View',
		'NextThought.view.courseware.info.View',
		'NextThought.view.courseware.overview.parts.ContentLink'
	],

	layout: {
		type: 'card',
		deferredRender: true
	},
	defaultType: 'box',
	activeItem: 'course-book',

	items: [
		{
			id: 'course-book',
			xtype: 'container',
			layout: { type: 'card', deferredRender: true },
			activeItem: 'main-reader-view',
			items: [
				{ xtype: 'course', id: 'course-nav' },
				{ xtype: 'reader', id: 'main-reader-view' }
			],
			listeners: {
				'beforedeactivate': function() {
					var active = this.layout && this.layout.activeItem;
					if (active) {
						return active.fireEventArgs('beforedeactivate', arguments);
					}
					return true;
				}
			}
		},{
			title: 'Dashboard',
			id: 'course-dashboard',
			xtype: 'course-dashboard'
		},{
			title: 'Discussion',
			id: 'course-forum',
			xtype: 'course-forum'
		},{
			title: 'Assignments',
			id: 'course-assessment',
			xtype: 'course-assessment-container'
		},{
			title: 'Course Info',
			id: 'course-info',
			xtype: 'course-info'
		}
	],


	tabSpecs: [
		{label: 'Dashboard', viewId: 'course-dashboard'},
		{label: 'Lessons', viewId: 'course-book?'},
		{label: 'Assignments', viewId: 'course-assessment?'},
		{label: 'Discussions', viewId: 'course-forum'},
		{label: 'Course Info', viewId: 'course-info'}
	],


	initComponent: function() {
		this.callParent(arguments);
		this.reader = this.down('reader-content');
		this.courseBook = this.down('#course-book');
		this.courseDash = this.down('course-dashboard');
		this.courseForum = this.down('course-forum');
		this.courseProgress = this.down('course-assessment');
		this.courseNav = this.down('course');
		this.courseInfo = this.down('course-info');

		this.removeCls('make-white');

		this.mon(this.reader, {
			'navigateComplete': 'onNavigateComplete',
			'beforeNavigate': 'onBeforeNavigate',
			'navigateAbort': 'onNavigationAborted',
			'navigateCanceled': 'onNavigationCanceled',
			'request-visibility': 'requestReaderVisibility',
			'location-cleared': 'onLocationCleared'
		});

		this.mon(this.courseForum, {
			scope: this,
			'set-active-state': 'updateForumState'
		});

		this.on({
			'switch-to-reader': 'showContentReader',
			'beforeactivate': 'onBeforeActivation',
			'beforedeactivate': 'onBeforeDeActivation',
			'deactivate': 'onDeactivated',
			'activate': 'onActivated',
			'main-tab-clicked': 'onTabClicked'
		});

		this.fireEvent('get-course-hooks', this);
	},


	updateForumState: function(type, ntiid) {
		var state = {};
		(state.discussion = {})[type] = ntiid;
		this.pushState(state);
	},


	onTabClicked: function(tabSpec) {
		var active = this.layout.getActiveItem(),
			targetView = /^([^\?]+)(\?)?$/.exec(tabSpec.viewId) || [tabSpec.viewId],
			vId = targetView[1],
			needsChanging = vId !== active.id,
			//only reset the view if we are already there and the spec flagged that it can be reset.
			reset = !!targetView[2] && !needsChanging;

		if (Ext.isEmpty(vId)) {
			return false;
		}

		if (needsChanging) {
			this.setActiveTab(vId);
			this.pushState({activeTab: vId});
		} else if (reset) {

			//should build in some smarts about allowing this to toggle through if the views are 'ready'
			active = active.layout.setActiveItem(0);
			if (active) {
				//hack 2 for demo
				try {
					active = active.down('course-outline').getSelectionModel().getSelection()[0];
					if (active) {
						this.fireEvent('set-location', active.getId());
					}
				}
				catch (e) {
					console.error('error', e);
				}
			}
		}

		return true;
	},


	pushState: function(s) {
		history.pushState({active: 'content', content: s}, this.title, this.getFragment());
	},


	updateState: function(s) {
		history.replaceState({active: 'content', content: s}, this.title, this.getFragment());
	},


	/**
	 * @param {Boolean|String[]} enable
	 */
	enableTabs: function(enable) {
		this.tabs = enable;
		this.updateTabs();
	},


	updateTabs: function() {
		if (this.isVisible(true)) {
			this.fireEvent('update-tabs', this);
		}
	},


	getTabs: function() {
		var tabs = this.tabSpecs,
			tabSet = Ext.isArray(this.tabs) ? this.tabs : [],
			active = this.layout.getActiveItem().id;

		if (this.tabs) {

			if (!isFeature('assignments')) {
				tabs = tabs.filter(function(i) {return i.viewId !== 'course-assessment';});
			}

			if (!this.courseForum.hasBoard) {
				tabs = tabs.filter(function(i) {return i.viewId !== 'course-forum';});
			}

			if (!this.courseInfo.hasInfo) {
				tabs = tabs.filter(function(i) {return i.viewId !== 'course-info';});
			}

			if (Ext.isArray(this.tabs)) {
				tabs = tabs.filter(function(i) { return Ext.Array.contains(tabSet, i.viewId); });
			}
		}

		Ext.each(tabs, function(t) {
			t.selected = (t.viewId.replace(/\?$/, '') === active);
		});

		return this.tabs ? tabs : [];
	},


	onBeforeActivation: function() {
		if (this.reader.activating) {
			this.reader.activating();
		}

		//Make sure we still have the content we are trying to get to in the library
		//If not maybe it's a purchasable we can show
		//TODO: find a way to let the dataserver fail this action so we go through the
		//normal 403 handling.  One idea could be to force a PageInfo fetch here?  That's
		//tricky because its async
		var location = this.reader.getLocation(),
			contentNtiid = location && location.ContentNTIID,
			title = Library.getTitle(contentNtiid);

		if (contentNtiid && !title && location) {
			//we are being asked to switch to something which we no longer
			//have in the library.  We may have recently have lost access to it.
			//Maybe its a purchasable we can prompt them with
			this.fireEvent('unauthorized-navigation', this, location.NTIID);
			return false;
		}
		return true;
	},


	onDeactivated: function() {
		var CQ = Ext.ComponentQuery, active,
			needsClosing = []
					.concat(CQ.query('slidedeck-view'))
					.concat(CQ.query('note-window'));

		Ext.Array.map(needsClosing, function(c) {c.destroy();});

		active = this.getLayout().getActiveItem();
		if (active) {
			active.fireEvent('deactivate', this);
		}
	},


	// Add a way to explicitly select a card node rather
	// than going through the originalNTIIDRequested Hack
	openCardNode: function(ntiid) {
		var card, i;

		Ext.each(this.query('content-card'), function(crd) {
			i = crd.data && crd.data.ntiid;
			if (i === ntiid) {
				card = crd;
			}
			return !card;
		});

		if (card && card.navigateToTarget) {
			card.navigateToTarget();
		}

	},


	onNavigationAborted: function(resp, ntiid, finish) {
		function fin(cid, locationInfo) {
			if (!cid) {
				me.courseBook.layout.setActiveItem('main-reader-view');
				me.reader.setSplash();
				me.reader.relayout();
				me.down('content-toolbar').hide();
				me.down('content-page-widgets').hide();
			}
			else {
				if (locationInfo.location && locationInfo.location.tagName === 'content:related') {
					// NOTE: For content related item, we have enough info to actually show it, otherwise,
					// we will navigation to the parent container.
					Service.getPageInfo(cid, function(pi) {
						if (!Ext.isEmpty(pi)) {
							pi = Ext.isArray(pi) ? pi[0] : pi;

							me.reader.setLocation(pi, function(s) {
								function fn() {
									if (!courseNav) { return; }
									Ext.defer(me.openCardNode, 1, me, [locationInfo.NTIID]);
									Ext.callback(finish);
								}
								//
								var courseNav = me.courseNav;
								if (!courseNav.rendered) {
									courseNav.on('afterrender', fn);
									return;
								}
								fn();
							});
							return;
						}

						//We know the we are trying to navigate to a content card but we couldn't resolve its pageInfo?,
						// callback and return.
						Ext.callback(finish);
					});

					// Return false, since we can handle this.
					return false;
				}
				me.fireEvent('navigation-selected', cid);
			}
			return true;
		}

		var me = this;
		if (this.fireEvent('navigation-failed', this, ntiid, resp) !== false) {
			if (resp && resp.status === 404) {
				return ContentUtils.findRelatedContentObject(ntiid, fin, me);
			}
			fin();
		}
	},


	onBeforeDeActivation: function() {
		// NOTE: we should probably fire this event for all the children of this view,
		// since one could have the editor active (in which case we would want to display appropriate warning).
		// For now, it seems like the reader should be notified and we will add others if we find it necessary.
		var result = this.reader.fireEvent('beforedeactivate', this),
			active;

		if (result) {
			active = this.getLayout().getActiveItem();
			if (active) {
				result = active.fireEvent('beforedeactivate', this);
			}
		}
		return result;
	},


	onActivated: function() {
		var active = this.getLayout().getActiveItem();
		if (active) {
			active.fireEvent('activate', this);
		}
	},


	onBeforeNavigate: function(ntiid, fromHistory) {
		if (!fromHistory) {
			if (this.activate(true) === false) {
				return false;
			}
		}
		if (this.reader.iframeReady) {
			return true;
		}

		this.reader.ntiidOnFrameReady = ntiid;
		return false;
	},


	requestReaderVisibility: function() {
		var locationInfo = this.reader.getLocation(),
			pageInfo = locationInfo && locationInfo.pageInfo;

		if (!pageInfo) {
			console.warn('not showing the reader because we dont have a pageinfo');
			return;
		}

		if (!this.reader.isVisible(true)) {
			console.warn('showing the content reader because it isnt visible but needs to be');
			this.showContentReader();
		}

	},


	onLocationCleared: function() {
		delete this.reader.ntiidOnFrameReady;
		this.courseBook.getLayout().setActiveItem('main-reader-view');
	},


	onNavigationCanceled: function(ntiid, alreadyThere, fromHistory) {
		if (!alreadyThere || fromHistory) { return; }

		var tab = Ext.isArray(this.tabs) ? 'course-info' : 'course-book';

		this.setActiveTab(tab);
		this.pushState({activeTab: tab});
	},


	onNavigateComplete: function(pageInfo) {
		if (!pageInfo || !pageInfo.isModel) {return;}

		this.down('content-toolbar').show();


		//TEMP:
		var sc = Ext.bind(this._setCourse, this);
		if (this.isPartOfCourse(pageInfo)) {
			this.getCourseInstance(pageInfo).then(sc, function(reason) {
				console.error('Could not set course from pageInfo: ', reason);
			});
		} else {
			this._setCourse(null);
		}

		//TEMP:
		if (pageInfo.isPartOfCourseNav()) {
			this.showCourseNavigation();
		}
		else {
			this.showContentReader();
		}

		this.locationTitle = pageInfo.getTitle('NextThought');
		this.updateTitle();
	},


	_setCourse: function(instance, tab) {
		if (this.currentCourse === instance) {
			return;
		}


		//Temporary stop gap
		var info = instance && instance.__getLocationInfo(),
			catalogEntry = instance && instance.getCourseCatalogEntry(),
			preview = catalogEntry && catalogEntry.get('Preview'),
			background = info && info.toc && getURL(info.toc.querySelector('toc').getAttribute('background'), info.root);

		this.currentCourse = instance;
		//this.reader.clearLocation();

		this.setBackground(background);
		this.enableTabs(preview ? [] : !!instance);


		Ext.each([
			this.courseNav,
			this.courseDash,
			this.courseForum,
			this.courseProgress,
			this.courseInfo
		], function(e) {
			if (e.courseChanged) {
				e.courseChanged(instance);
			}
		});

		this.updateTabs();
		if (instance) {
			this.showCourseNavigation();
		} else {
			this.showContentReader();
		}

		tab = preview ? 'course-info' : tab || 'course-book';

		//force this to blank out if it was unset
		this.updateState({
			course: instance && instance.getId(),
			activeTab: tab
		});

		this.setActiveTab(tab);
	},


	onCourseSelected: function(instance) {
		//Because courses still use location, it needs to be cleared before setting the new one
		this.reader.clearLocation();
		this._setCourse(instance);
		this.showCourseNavigation();

		var e = instance.getCourseCatalogEntry(),
			ntiid = e.get('ContentPackageNTIID');
		this.setTitle(e.get('Title'));
		this.pushState({
			//dirty, i know... TODO: track last content course was at, and restore that.
			location: PersistentStorage.getProperty('last-location-map', ntiid, ntiid),
			course: instance.getId()
		});
	},


	showCourseNavigation: function() {
		this.courseBook.getLayout().setActiveItem('course-nav');
		//this.setActiveTab('course-book');
	},


	showCourseNavigationAt: function(pageInfo) {
		var c = this.courseNav.navigation,
			id = pageInfo.getId();
		this.showCourseNavigation();
		//Temp HACK:
		c.maybeChangeSelection(id);
		this.pushState({
			location: id
		});
	},


	showContentReader: function() {
		this.courseBook.layout.setActiveItem('main-reader-view');
		//this.setActiveTab('course-book');
	},


	setBackground: function(src) {
		this.backgroundUrl = src;
		if (this.isActive()) {
			this.updateBackground();
		}
	},


	getTitlePrefix: function() {
		var prefix = this.getLayout().getActiveItem().title || '',
			inst = this.currentCourse,
			courseTitle = (inst && inst.asUIData().title);

		if (!Ext.isEmpty(prefix)) {
			prefix += ' - ';
		} else if (!Ext.isEmpty(courseTitle)) {
			prefix = courseTitle + ' - ';
		}
		return prefix;
	},


	setActiveTab: function(tab) {
		if (this.rendered) {
			this.layout.setActiveItem(tab || 'course-book');
			this.updateTitle();
		} else {
			this.on('afterrender', function() {
				this.layout.setActiveItem(tab);
				this.updateTitle();
			}, this);
		}
	},


	updateTitle: function() {
		var tab = this.layout.getActiveItem(),
			inst = this.currentCourse,
			courseTitle = (inst && inst.asUIData().title),
			pageTitle = this.locationTitle,
			subTitle = tab && (Ext.isEmpty(tab.title) ? pageTitle : courseTitle);

		this.setTitle((this.getTitlePrefix() + subTitle) || 'NextThought');
	},


	restore: function(state) {
		var promise = new Promise(),
			st = state.content,
			course = st.course,
			ntiid = st.location,
			tab = st.activeTab,
			disc = st.discussion || {},
			topic = disc.topic,
			forum = disc.forum,
			me = this;

		tab = (tab === 'null') ? null : tab;

		function setupCourseUI(instance) {
			try {
				if (instance) {
					me._setCourse(instance, tab);
					me.courseForum.restoreState(forum, topic);
				}

				if (ntiid) {
					me.reader.setLocation(ntiid, null, true);
					//Temp HACK:
					me.courseNav.navigation.maybeChangeSelection(ntiid);
				} else {
					me.reader.clearLocation();
				}

				//if we have an instance this gets called in _setCourse so there is no need to do it here
				if (!instance) { me.setActiveTab(tab); }
			}
			catch (e) {
				console.error(e.stack || e.message || e);
			}
			finally {
				promise.fulfill();
			}
		}

		function noCourse() {
			console.warn('Dropping state for course that is not accessible.');
			promise.fulfill();
			if (state.active === me.id) {
				me.fireEvent('go-to-library');
			}
		}

		CourseWareUtils.resolveCourse(course).then(setupCourseUI, noCourse);

		return promise;
	},





	activate: function() {
		var res = this.callParent(arguments);
		if (res) {
			this.reader.relayout();
		}
		return res;
	},


	getFragment: function() {
		var o,
			ai = this.layout.getActiveItem(),
			ntiid;

		if (ai.id === 'course-book') {
			ai = ai.layout.getActiveItem();
			if (ai === this.reader) {
				ntiid = this.reader.getLocation().NTIID;
			} else if (ai === this.courseNav) {
				ntiid = ai.navigation.getSelectionModel().getSelection()[0];
				ntiid = ntiid && ntiid.getId();
			}

			o = ParseUtils.parseNTIID(ntiid);
		}
		return o ? o.toURLSuffix() : location.pathname;
	}
});
