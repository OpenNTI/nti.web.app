Ext.define('NextThought.app.contentviewer.reader.Location', {
	alias: 'reader.locationProvider',
	mixins: { observable: 'Ext.util.Observable' },
	requires: [
		'NextThought.app.library.Actions',
		'NextThought.cache.AbstractStorage',
		'NextThought.app.video.Window',
		'NextThought.util.Content'
	],

	constructor: function(config) {
		Ext.apply(this, config);

		this.mixins.observable.constructor.call(this);
		var reader = this.reader;
		reader.on('destroy', 'destroy',
			reader.relayEvents(this, [
				'location-cleared',
				'beforeNavigate',
				'beginNavigate',
				'navigate',
	            'navigateAbort',//From error (navigation started and must recover)
				'navigateCanceled',//From blocking UI (open editor) -- navigation never started.
				'navigateComplete',
				'change'
			]));

		this.up = reader.up.bind(reader);
		reader.on('afterRender', function() {
			reader.fireEvent('uses-page-stores', this); }, this);

		Ext.apply(reader, {
			clearLocation: this.clearLocation.bind(this),
			getLocation: this.getLocation.bind(this),
			getRelated: this.getRelated.bind(this),
			setLocation: this.setLocation.bind(this),
			relatedItemHandler: this.relatedItemHandler.bind(this)
		});

		this.callParent(arguments);
	},


	clearLocation: function() {
		this.currentNTIID = null;
		this.currentPageInfo = null;
		this.fireEvent('location-cleared', this.reader);
		this.reader.setSplash(true);
	},


	/**
	 *
	 * @param {String} ntiid
	 * @param {Function} [callback]
	 * @param {Boolean} [fromHistory]
	 */
	setLocation: function(ntiidOrPageInfo, callback, fromHistory, targetBundle) {
		var me = this,
			e = me.reader.getContentMaskTarget(),
			ntiid = ntiidOrPageInfo && ntiidOrPageInfo.isPageInfo ? ntiidOrPageInfo.get('NTIID') : ntiidOrPageInfo,
			rootId = ContentUtils.getLineage(ntiid),
			finish, txn;

		rootId = rootId && rootId.last();

		if (!me.fireEvent('beforeNavigate', ntiid, fromHistory) || me.currentNTIID === ntiid) {
			me.fireEvent('navigateCanceled', ntiid, me.currentNTIID === ntiid, fromHistory);
			Ext.callback(callback, null, [me.reader]);
			return;
		}

		var clearMask = Ext.Function.createDelayed(function() {if (e && e.isMasked()) {e.unmask();}}, 300);


		function finishFn(_, error) {
			if (finish.called) {
				console.warn('finish navigation called twice');
				return;
			}
			var args = Array.prototype.slice.call(arguments),
				onceReady = _ && _.onceSettled ? _.onceSettled() : wait(),
				canceled;

			finish.called = true;

			clearMask();

			try {
				onceReady.then(function() { Ext.callback(callback, null, args); });

				if (fromHistory !== true) {
					history.pushState({
						content: {location: ntiid}
					}, ContentUtils.findTitle(ntiid, 'NextThought'), me.getFragment(ntiid));
				}
				else {
					canceled = true;
					txn.abort();
				}

				if (error) {
					//PersistentStorage.updateProperty('last-location-map', rootId, rootId);
					delete me.currentNTIID;
					//Ok no bueno.  The page info request failed.  Ideally whoever
					//initiated this request handles the error  but we aren't really setup for
					//that everywhere. Need to work on error handling.
					console.error('An error occurred from setLocation', error);
					if (error.status !== undefined && Ext.Ajax.isHTTPErrorCode(error.status)) {
						//We were displaying an alert box here on 403s, but since we don't know why we
						//are being called we shouldn't do that.  I.E. unless the user triggered this action
						//an alert box will just be unexpected and they won't know what to do about it. Until
						//we move the error handling out to the caller the most friendly thing seems to
						//just log the issue and leave the splash showing.
						throw 'error occurred during navigation';
					}
					return;
				}

				//remember last ntiid for this book if it is truthy
				//if (ntiid && rootId) {
					//PersistentStorage.updateProperty('last-location-map', rootId, ntiid);
				//}
			}
			finally {
				if (!canceled) {
					txn.commit();
					onceReady.then(function() {
						var l = me.reader.getLocation(),
							s = me.reader.getScroll(),
							p = l && l.requestedPageInfo;
						l = p && p.getLinkFragment('content');
						if (l) {
							wait(500).then(s.toTarget.bind(s, l));
						}
					});
				}
			}

		}

		finish = Ext.Function.createBuffered(finishFn, null, 1);

		// I understand the intent of this, but in a case of an initial failed navigation, where we recover,
		// if we call setLocation this  will prevent us from continuing because the mask is active.
		// TODO: We should do define a better solution around this.
    //		if(e && e.isMasked()){
    //			console.warn('navigating while busy');
    //			return;
    //		}

		if (me.currentNTIID && ntiid !== me.currentNTIID && e) {
			e.mask('Loading...', 'navigation');
		}

		txn = history.beginTransaction('navigation-transaction-' + guidGenerator());

		//make this happen out of this function's flow, so that the mask shows immediately.
		setTimeout(function() {
			if (!me.fireEvent('beginNavigate', ntiid, fromHistory)) {
				finish();
				return;
			}

			try {
				me.clearPageStore();
				me.resolvePageInfo(ntiidOrPageInfo, rootId, finish, Boolean(callback), targetBundle);
			}
			catch (e) {
				txn.abort(e);
			}
		},1);
	},


	getFragment: function(ntiid) {
		var o = ParseUtils.parseNTIID(ntiid);
		return o ? o.toURLSuffix() : '';
	},


	resolvePageInfo: function(ntiidOrPageInfo, rootId, finish, hasCallback, targetBundle) {
		var me = this,
			requestedPageInfo = null,
			ntiid;

		function success(pageInfo) {
			var sync;

			pageInfo.targetBundle = targetBundle || pageInfo.targetBundle;

			//the server is suppose to be taking care of getting the correct page info
			//for the course so this shouldn't be necessary.
			if (isFeature('sync-pageinfo-and-outlinenode')) {
				sync = pageInfo.syncWithBundle(targetBundle);
			} else {
				sync = Promise.resolve();
			}

			sync
				.then(function() {
					if (ntiid === rootId && !LocationMeta.getValue(rootId)) {
						// let's cache this on the LocationMeta, if it's not there already.
						LocationMeta.createAndCacheMeta(rootId, pageInfo);
					}
					me.requestedPageInfo = requestedPageInfo || pageInfo;
					me.currentPageInfo = pageInfo;
					me.currentNTIID = pageInfo.getId();
					me.fireEvent('navigateComplete', pageInfo, finish, hasCallback);
				});
		}

		function failure(q, r) {
			console.error('resolvePageInfo Failure: ', arguments);
			// Give the navigateAbort handler a chance to see if it can resolve and navigate to the correct location.
			// it will explicitly return false, if it thinks it can handle it, otherwise, we callback.
			if (me.fireEvent('navigateAbort', r, ntiidOrPageInfo, finish) !== false) {
				Ext.callback(finish, null, [me.reader, {failure: true, req: q, error: r}]);
			}
		}

		if (ntiidOrPageInfo.isPageInfo) {
			if (ntiidOrPageInfo.isPageRoot()) {
				success(ntiidOrPageInfo);
				return;
			}

			ntiid = ntiidOrPageInfo.getPageRootID();
			requestedPageInfo = ntiidOrPageInfo;
		} else {
			ntiid = ntiidOrPageInfo;
		}

		//page info's are cached at the service layer.
		Service.getPageInfo(ntiid, success, failure, me, targetBundle);
	},


	getLocation: function() {
		return Ext.apply({
			requestedPageInfo: this.requestedPageInfo,
			pageInfo: this.currentPageInfo
		},ContentUtils.getLocation(this.currentNTIID));
	},



	getRelated: function(givenNtiid) {
		var me = this,
			ntiid = givenNtiid || me.currentNTIID,
			map = {},
			info = ContentUtils.find(ntiid),
			related = info ? info.location.getElementsByTagName('Related') : null;

		function findIcon(n) {
			return !n ? null : n.getAttribute('icon') || findIcon(n.parentNode) || '';
		}

		Ext.each(related, function(r) {
			r = r.firstChild;
			do {
				if (!r.tagName) {
					continue;
				}

				var tag = r.tagName,
					id = r.getAttribute('ntiid'),
					type = r.getAttribute('type'),
					qual = r.getAttribute('qualifier'),

					target = tag === 'page' ? ContentUtils.find(id) : null,
					location = target ? target.location : null,

					label = location ? location.getAttribute('label') : r.getAttribute('title'),
					href = (location || r).getAttribute('href');

				if (!map[id]) {
					if (!info || !info.title) {
						console.warn('skipping related item: ' + id + ' because we could not resolve the ntiid ' + ntiid + ' to a book');
						return;
					}

					map[id] = {
						id: id,
						type: type,
						label: label,
						href: href,
						qualifier: qual,
						root: info.title.get('root'),
						icon: findIcon(r)
					};
				}
				r = r.nextSibling;
			}
			while (r);

		},this);

		return map;

	},


	relatedItemHandler: function(el) {
		var m = el.relatedInfo;

		if (m.type === 'index' || m.type === 'link') {
			this.setLocation(m.id);
		}
		else if (/http...*/.test(m.href)) {
			Ext.widget('window', {
				title: m.label,
				closeAction: 'destroy',
				width: 646,
				height: 396,
				layout: 'fit',
				items: {
					xtype: 'component',
					autoEl: {
						tag: 'iframe',
						src: m.href,
						frameBorder: 0,
						marginWidth: 0,
						marginHeight: 0,
						allowfullscreen: true
					}
				}
			}).show();
		}
		else if (m.type === 'video') {
			Ext.widget('widget.video-window', {
				title: m.label,
				modal: true,
				src: [{
					src: getURL(m.root + m.href),
					type: 'video/mp4'
				}]
			}).show();

		}
		else {
			console.error('No handler for type:', m.type, m);
		}
	}
});
