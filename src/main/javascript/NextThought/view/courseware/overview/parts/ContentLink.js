Ext.define('NextThought.view.courseware.overview.parts.ContentLink', {
	extend: 'NextThought.view.cards.Card',
	alias: [
		'widget.course-overview-content',
		'widget.course-overview-relatedworkref',
		'widget.course-overview-externallink'
	],

	requires: ['NextThought.view.contentviewer.View'],

	constructor: function(config) {
		var n = config.node || {getAttribute: function(a) { return config[a];} },
			i = config.locationInfo,
			href = n.getAttribute('href'),
			ntiid = n.getAttribute('ntiid');

		if (Globals.ROOT_URL_PATTERN.test(href)) {
			href = getURL(href);
		} else if (!ParseUtils.isNTIID(href) && !Globals.HOST_PREFIX_PATTERN.test(href)) {
			href = getURL(i.root + href);
		}

		config.data = {
			'attribute-data-href': href, href: href,
			creator: n.getAttribute('creator'),
			description: Ext.String.ellipsis(n.getAttribute('desc'), 200, true),
			thumbnail: getURL(i.root + n.getAttribute('icon')),
			ntiid: ntiid,
			title: n.getAttribute('label'),
			notTarget: !NextThought.view.cards.Card.prototype.shouldOpenInApp.call(this, ntiid, href),
			asDomSpec: DomUtils.asDomSpec
		};

		this.callParent([config]);
	},


	commentTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'comment', cn: [
			{ html: '{count:plural("Comment")}'}
		]
	})),


	afterRender: function() {
		this.callParent(arguments);
		this.loadContainer();
    //		console.log('Loading:',ntiid);
	},


	loadContainer: function() {
		var ntiid = this.data.href,
			req;

		if (!ParseUtils.isNTIID(ntiid)) {
			ntiid = this.data.ntiid;
			if (!ntiid) {
				return;
			}
		}

		req = {
			url: Service.getContainerUrl(ntiid, Globals.USER_GENERATED_DATA),
			scope: this,
			method: 'GET',
			params: {
				accept: NextThought.model.Note.mimeType,
				batchStart: 0,
				batchSize: 1,
				filter: 'TopLevel'
			},
			callback: this.containerLoaded
		};

		Ext.Ajax.request(req);
	},


	appendTotal: function(total) {
		if (!this.rendered) {
			this.on('afterrender', Ext.bind(this.appendTotal, this, arguments), this, {single: true});
			return;
		}

		if (Ext.getDom(this.meta)) {
			this.commentTpl.append(this.meta, {count: total});
		}
	},


	containerLoaded: function(q, s, r) {
		var total = 0,
			json = Ext.decode(r && r.responseText, true);
		if (s && json) {
			total = json.FilteredTotalItemCount || 0;
		}

		this.appendTotal(total);
	},


	getCurrentBundle: function() {
		var container = this.up('content-view-container');

		return container && container.currentBundle;
	},


	navigateToTarget: function() {
		var container = this.up('content-view-container'),
			reader = Ext.widget('content-viewer', {
				contentId: this.target,
				width: 1024,
				height: '90%'
			});

		reader.showBy(container.el, 'tl-tl');
		// debugger;
		// if (ParseUtils.isNTIID(this.target)) {
		// 	return this.fireEvent('set-location-rooted', this.target, null, null, this.getCurrentBundle());
		// }

		// return this.callParent(arguments);
	},


	onCardClicked: function(e) {
		var bundle = this.getCurrentBundle();

		if (e && e.getTarget('.comment')) {
			e.stopEvent();
			this.bypassEvent = false;
		}

		if (this.bypassEvent) {
			AnalyticsUtil.getResourceTimer(this.ntiid, {
				type: 'resource-viewed',
				course: bundle && bundle.getId()
			});

			this.setProgress();
		}

		return this.callParent(arguments);
	},


	setProgress: function(progress) {
		progress = progress || this.progress;

		this.progress = progress;

		if (!progress) { return; }

		var beenViewed = progress.hasBeenViewed(this.target) || progress.hasBeenViewed(this.ntiid);

		if (beenViewed) {
			this.addCls('viewed');
		}
	}
});
