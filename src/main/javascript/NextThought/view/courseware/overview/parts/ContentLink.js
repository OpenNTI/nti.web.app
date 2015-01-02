Ext.define('NextThought.view.courseware.overview.parts.ContentLink', {
	extend: 'NextThought.view.cards.Card',
	alias: [
		'widget.course-overview-content',
		'widget.course-overview-relatedworkref',
		'widget.course-overview-externallink'
	],

	constructor: function(config) {
		var n = config.node || {getAttribute: function(a) { return config[a];} },
			i = config.locationInfo,
			href = n.getAttribute('href'),
			ntiid = n.getAttribute('ntiid');

		if (!ParseUtils.isNTIID(href) && !Globals.HOST_PREFIX_PATTERN.test(href)) {
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


	navigateToTarget: function() {
		var container = this.up('content-view-container'),
			currentBundle = container && container.currentBundle;

		if (ParseUtils.isNTIID(this.target)) {
			return this.fireEvent('set-location-rooted', this.target, null, null, currentBundle);
		}

		return this.callParent(arguments);
	},


	onCardClicked: function(e) {
		if (e && e.getTarget('.comment')) {
			e.stopEvent();
			this.bypassEvent = false;
		}
		return this.callParent(arguments);
	},


	setProgress: function(progress) {
		var progressItem = progress && progress[this.target],
			hasBeenViewed = AnalyticsUtil.hasBeenViewed(this.target);

		if (progressItem) {
			hasBeenViewed = hasBeenViewed || progressItem.AbsoluteProgress > 0;
		}

		if (hasBeenViewed) {
			this.addCls('viewed');
		}
	}
});
