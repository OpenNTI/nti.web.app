/**
 * This controller is intended to provide instrumentation to the reader.  The messy singletons will need to be migrated
 * into this controller and deprecated.
 */
Ext.define('NextThought.controller.Reader', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.app.domain.Annotation',
		'NextThought.cache.AbstractStorage'
	],

	models: [
		'PageInfo',
		'courses.navigation.Node'
	],


	stores: [
	],


	views: [
		'cards.Card',
		'content.Navigation',
		'content.Pager',
		'content.PageWidgets',
		'content.Reader',
		'content.Toolbar'
	],


	refs: [
		{ref: 'mainNav', selector: 'main-navigation'},
		{ref: 'switcher', selector: 'most-recent-content-switcher'},
		{ref: 'contentView', selector: 'content-view-container'},
		{ref: 'contentNavigation', selector: 'content-view-container content-toolbar content-navigation'},
		{ref: 'contentPager', selector: 'content-view-container content-toolbar content-pager'},
		{ref: 'contentPageWidgets', selector: 'content-view-container content-page-widgets'},
		{ref: 'contentReader', selector: 'content-view-container reader-content'}
	],


	IGNORE_ROOTING: new RegExp(RegExp.escape('tag:nextthought.com,2011-10:Alibra-'), 'i'),


	init: function() {
		this.listen({
			annotation: {
				'note': {
					'annouce-private-note': 'onPrivateNoteAnnouned'
				}
			},
			controller: {
				'*': {
					'content-dropped': 'maybeClearLocation',
					'set-location': 'setLocation',
					'set-last-location-or-root': 'setLastLocation',
					'bookmark-loaded': 'onBookmark'
				}
			},
			store: {
				'*': {
					'bookmark-loaded': 'onBookmark'
				}
			},
			component: {
				'*': {
					'set-location': 'setLocation',
					'set-location-rooted': 'setLocationRooted',
					'set-last-location-or-root': 'setLastLocation',
					'suspend-annotation-manager': 'suspendManager',
					'resume-annotation-manager': 'resumeManager'
				},
				'reader-content': {
					'beforeNavigate': 'beforeSetLocation',
					'navigateCanceled': 'resetNavigationMenuBar',
					'set-content': 'updateControls',
					'page-previous': 'goPagePrevious',
					'page-next': 'goPageNext'
				},
				'content-card': {
					'show-target': 'showCardTarget'
				},

				'note-window': {
					'before-new-note-viewer': 'maybeSwitchContentSubTabs'
				}
			}
		});
	},


	onPrivateNoteAnnouned: function(annotation, y) {
		var reader = annotation && annotation.ownerCmp,
			notepad = reader && reader.notepadRef;

		if (notepad) {
			console.debug('Private Note Annoucement:', arguments);
			notepad.addOrUpdate(annotation, y);
		}
	},


	resumeManager: function() {
		var reader = this.getContentReader();
		reader.getAnnotations().getManager().resume();
	},


	suspendManager: function() {
		var reader = this.getContentReader();
		reader.getAnnotations().getManager().suspend();
	},


	beforeSetLocation: function() {
		var canNav = true,
		//todo: lets not use query!
			n = Ext.ComponentQuery.query('note-window') || [];

		try {
			Ext.each(n, function(note) {
				note.closeOrDie();
			});
		}
		catch (e) {
			canNav = false;
		}

		return canNav;
	},


	resetNavigationMenuBar: function(ntiidCancled, isCurrent, fromHistory) {
		if (!isCurrent && !fromHistory) {
			console.debug('reset?', arguments);
			this.getMainNav().updateCurrent(true);
		}
	},


	maybeClearLocation: function(rec) {
		var r = this.getContentReader(),
			loc = r.getLocation(),
			ntiid = loc && loc.ContentNTIID,
			c = ntiid && CourseWareUtils.courseForNtiid(ntiid);

		this.getSwitcher().drop(rec);

		if (!rec || !ntiid || (c && c.getId() === rec.getId())) {
			//TODO: this should start a session transaction that ends with a "state replacement" so there is no "back"
			r.clearLocation();
			r.currentRoot = null;
			this.getMainNav().updateCurrent(true);
			this.getSwitcher().track(loc && loc.title, true);
		}
	},


	getRootForLocation: function(id) {
		var info = ContentUtils.getLocation(id),
			node, n;
		if (!info || this.IGNORE_ROOTING.test(id)) {
			//not enough info... no root.
			return null;
		}

		function getActualPath(n) {
			var results = [];
			while (n && n.parentNode) {
				results.push(n.nodeName + '[' + n.getAttribute('ntiid') + ']');
				n = n.parentNode;
			}

			return results.reverse().join('\n\t-> ');
		}

		n = node = info.location;
		while (node && node.parentNode) {
			if (node.parentNode === node.ownerDocument.firstChild) {break;}
			node = node.parentNode;
			if (/\.blocker/i.test(node.getAttribute && node.getAttribute('ntiid'))) {
				console.error(
						'\n\n\n\nBLOCKER NODE DETECTED IN HIERARCHY!!\n\nDerived Path:\n',
						ContentUtils.getLineage(id).reverse().join('\n\t-> '),
						'\n\nActual Path:\n',
						getActualPath(n),
						'\n\n\n\n');
			}
		}

		return (node && node.getAttribute && node.getAttribute('ntiid')) || null;
	},


	/**
	 * This is the random-access mothod to navigate to any content.
	 *
	 * @param {String} ntiid
	 * @param {Function} [callback] Function that will be called back on success.
	 * @param {Boolean} [silent] Presently not used.
	 * @return {Boolean} Always returns true. :/
	 */
	setLocation: function(ntiid, callback, silent, bundle) {
		var me = this,
			r = me.getContentReader(),
			v = me.getContentView(),
			id = !Ext.isString(ntiid) ? ntiid.getId() : ntiid;

		if (!r) {
			console.error('No reader, not setting location');
			return;
		}

		//If we have a root set, update it, if not, leave it alone.
		if (r.currentRoot) {
			r.currentRoot = me.getRootForLocation(id);
		}

		function go(pi) {
			pi.targetBundle = bundle;
			if (me.fireEvent('show-view', 'content') === false) {
				return false;
			}

			if (pi && pi.isPartOfCourseNav()) {
				r.clearLocation();
				v.showCourseNavigationAt(pi);
				Ext.callback(callback, null, [ntiid, r]);
				return true;
			}

			v.showContentReader();

			if (!r.ntiidOnFrameReady) {
				r.setLocation(pi, callback, null, bundle);
			}
			else {
				r.ntiidOnFrameReady = [pi, callback];
			}
		}

		function fail(req, resp) {
			var location = ContentUtils.getLocation(id),
				data, href;
			if (resp && (resp.status === 404 || resp.status === 406) && location) {

				data = DomUtils.parseDomObject(location.location);
				href = data['attribute-href'];
				data['attribute-data-href'] = getURL(data['attribute-href'], location.root);
				data.title = data['attribute-label'];
				data.ntiid = data['attribute-ntiid'];
				data.thumbnail = getURL(data['attribute-icon'], location.root);
				data.description = data['attribute-desc'];
				data.notTarget = !NextThought.view.cards.Card.prototype.shouldOpenInApp.call(this, id, href);


				me.showCardTarget(r, data, false, callback);
			} else if (resp) {
				r.fireEvent('navigation-failed', r, id, resp);
				console.error(resp.responseText);
			}
		}

		Service.getPageInfo(id, go, fail, this);

		return true;
	},


	setLocationRooted: function(ntiid, callback, silent, bundle) {
		var reader = this.getContentReader(),
			oldRoot = reader.currentRoot,
			root = ntiid;

		if (this.IGNORE_ROOTING.test(root)) {
			root = null;
		}

		reader.currentRoot = root;

		function call(a, er) {
			if (er && er.status !== undefined && Ext.Ajax.isHTTPErrorCode(er.status)) {
				reader.currentRoot = oldRoot;
			} else {
				reader.currentRoot = root;//make sure it sicks
			}

			Ext.callback(callback, null, [ntiid, a, er]);
		}

		this.setLocation(ntiid, call, silent === true, bundle);
		reader.currentRoot = root; //setLocation is async, and in its init can set this to a less restrictive root.
	},


	/**
	 * This is (and should) only be called by navigating to a BOOK.
	 * {@see NextThought.model.ContentPackage#fireNavigationEvent()}
	 *
	 * @param {String} ntiid
	 * @param {Function} [callback]
	 * @param {Boolean} [silent]
	 */
	setLastLocation: function(ntiid, callback, silent, bundle) {
		PersistentStorage.remove('last-location-map');//neuter last-location-map
		var reader = this.getContentReader(),
			lastNtiid = PersistentStorage.getProperty('last-location-map', ntiid, ntiid);

		if (!ParseUtils.isNTIID(lastNtiid)) {
			lastNtiid = ntiid;
		}

		function call(a, errorDetails) {
			reader.currentRoot = null;//just in case
			var error = (errorDetails || {}).error;
			if (error && error.status !== undefined && Ext.Ajax.isHTTPErrorCode(error.status)) {
				PersistentStorage.removeProperty('last-location-map', ntiid);
			}

			Ext.callback(callback, null, [ntiid, a, error]);
		}

		reader.currentRoot = null;
		//this.getContentView()._setBundle(null);
		this.setLocation(lastNtiid, call, silent === true, bundle);
	},


	goPagePrevious: function() {
		this.getContentPager().goPrev();
	},


	goPageNext: function() {
		this.getContentPager().goNext();
	},


	showCardTarget: function(card, data, silent, callback, bundle) {
		var reader = card.up('reader-content') || ReaderPanel.get(),//for now, lets just get the default reader.
			ntiid = data.ntiid,
			postfix = data.notTarget ? '' : '-target',
			DH = Ext.DomHelper,
			s = encodeURIComponent('Pages(' + ntiid + ')'),
			u = encodeURIComponent($AppConfig.username),
		//Hack...
			pi = this.getPageInfoModel().create({
				ID: ntiid,
				NTIID: ntiid,
				content: DH.markup([
					{tag: 'head', cn: [
						{tag: 'title', html: data.title},
						{tag: 'meta', name: 'icon', content: data.thumbnail}
					]},
					{tag: 'body', cn: {
						cls: 'page-contents no-padding',
						cn: Ext.applyIf({
							tag: 'object',
							cls: 'nticard' + postfix,
							type: 'application/vnd.nextthought.nticard' + postfix,
							'data-ntiid': ntiid,
							html: DH.markup([
								{tag: 'img', src: data.thumbnail},
								{tag: 'span', cls: 'description', html: data.description}
							])
						}, data.asDomSpec())
					}}
				]),
				Links: [
					{
						Class: 'Link',
						href: '/dataserver2/users/' + u + '/' + s + '/UserGeneratedData',
						rel: 'UserGeneratedData'
					}
				]
			});

		pi.contentOrig = reader.getLocation().NTIID;
		pi.hideControls = true;
		pi.targetBundle = bundle;

		reader.setLocation(pi, callback, !!silent, bundle);
	},


	onBookmark: function(rec) {
		try {
			this.getContentPageWidgets().onBookmark(rec);
		}
		catch (e) {
			console.error(e.stack || e.message);
		}
	},


	updateControls: function(reader, doc, assesments, pageInfo) {
		var fn = (pageInfo && pageInfo.hideControls) ? 'hideControls' : 'showControls',
			containerId = pageInfo.get('ContentPackageNTIID'),
			targetBundle = pageInfo.targetBundle,
			pg = this.getContentPager(),
			pw = this.getContentPageWidgets(),
			mn = this.getMainNav(),
			nav = this.getContentNavigation(),
			origin = pageInfo && pageInfo.contentOrig,
			l = pageInfo && pageInfo.getLocationInfo(),
			t = pageInfo && pageInfo.get('NTIID'),
		//TEMP:
			trackFn = Ext.bind(mn.updateCurrent, mn, [false], 0);

		pg[fn]();
		pw[fn]();

		pw.clearBookmark();
		pg.updateState(t, reader.currentRoot, pageInfo.targetBundle);

		if (targetBundle && targetBundle.containsPackage(containerId)) {
			Promise.resolve(targetBundle)
				.then(trackFn);
		} else {
			//Do not track content packages if they are marked as bundles/courses...track the bundle instead.
			ContentManagementUtils.findBundle(pageInfo)
			//if we don't find it in bundles... look up the course instance...
				.fail(function() {
					return CourseWareUtils.getCourseInstance(pageInfo);
				}.bind(this))
			//Found a bundle or course instance...
				.then(trackFn)
			//Did not find a bundle or course...
				.fail(function() {
					trackFn(l && l.title);
				});
		}

		//If there is no origin, we treat this as normal. (Read the location from the location provder) The origin is
		// to direct the navbar to use the origins' id instead of the current one (because we know th current one will
		// not resolve from our library... its a card)
		nav.updateLocation(t || origin, reader.currentRoot, pageInfo.targetBundle);
	},


	maybeSwitchContentSubTabs: function(viwer, ownerCmp) {
		var view = this.getContentView(),
			subView;
		if (ownerCmp !== this.getContentReader()) {
			//this event doen't concern us.
			return true;
		}

		if (this.fireEvent('show-view', 'content', true) === false) {
			return false;
		}

		subView = view.down('course-book');
		view.setActiveTab(subView);
	}

});
