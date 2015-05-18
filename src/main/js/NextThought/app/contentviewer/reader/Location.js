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
			getLocation: this.getLocation.bind(this),
			getRelated: this.getRelated.bind(this),
			setLocation: this.setLocation.bind(this),
			relatedItemHandler: this.relatedItemHandler.bind(this)
		});

		this.callParent(arguments);
	},


	setLocation: function(pageInfo, bundle) {
		var me = this,
			ntiid = pageInfo.get('NTIID');

		return ContentUtils.getLocation(ntiid, bundle)
				.then(function(locations) {
					var location = locations[0] || {};

					location.pageInfo = pageInfo;
					location.currentBundle = bundle;

					me.currentPageInfo = pageInfo;
					me.currentLocation = location;
				});
	},


	getLocation: function() {
		return this.currentLocation;
	},



	getRelated: function(givenNtiid) {
		var me = this,
			location = me.getLocation(),
			ntiid = givenNtiid || location.NTIID,
			map = {};

		return ContentUtils.getNodes(ntiid, location.currentBundle)
			.then(function(infos) {
				var info = infos[0],
					i, r,
					related = info ? info.location.getElementsByTagName('Related') : [];

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
			});
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
