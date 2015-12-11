Ext.define('NextThought.app.course.overview.components.parts.ContentLink', {
	extend: 'NextThought.common.components.cards.Card',

	requires: [
		'NextThought.model.Note',
		'NextThought.model.RelatedWork',
		'NextThought.app.contentviewer.Actions',
		'NextThought.util.Parsing'
	],

	alias: [
		'widget.course-overview-content',
		'widget.course-overview-relatedworkref',
		'widget.course-overview-externallink'
	],

	// requires: ['NextThought.view.contentviewer.View'],

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'thumbnail', style: { backgroundImage: 'url({thumbnail})'} },
		{ cls: 'meta', cn: [
			{ cls: 'title', html: '{title}' },
			{ cls: 'byline', html: '{{{NextThought.view.cards.Card.by}}}' },
			{ cls: 'description', html: '{description}' }
		]}
	]),


	constructor: function(config) {
		var n = config.node || {getAttribute: function(a) { return config[a];} },
			i = config.locationInfo,
			href = n.getAttribute('href'),
			icon = n.getAttribute('icon'),
			ntiid = n.getAttribute('ntiid'),
			root = i && i.root;

		if (Globals.ROOT_URL_PATTERN.test(href)) {
			href = getURL(href);
		} else if (!ParseUtils.isNTIID(href) && !Globals.HOST_PREFIX_PATTERN.test(href)) {
			href = getURL(i.root + href);
		}

		if (Globals.ROOT_URL_PATTERN.test(icon)) {
			icon = getURL(icon);
		} else {
			icon = getURL((root || '') + icon);
		}

		config.data = {
			'attribute-data-href': href, href: href,
			creator: n.getAttribute('byline') || n.getAttribute('creator'),
			description: Ext.String.ellipsis(n.getAttribute('desc') || n.getAttribute('description'), 200, true),
			thumbnail: icon,
			ntiid: ntiid,
			title: n.getAttribute('label'),
			notTarget: !Globals.shouldOpenInApp(ntiid, href),
			asDomSpec: DomUtils.asDomSpec
		};

		this.ContentActions = NextThought.app.contentviewer.Actions.create();

		this.callParent([config]);

		this.WindowActions = NextThought.app.windows.Actions.create();
		this.WindowStore = NextThought.app.windows.StateStore.getInstance();
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
		return this.course;
	},


	navigateToTarget: function() {
		if (!this.navigate) {
			console.error('No navigate set on content link');
			return;
		}

		var config;

		if (ParseUtils.isNTIID(this.target)) {
			config = NextThought.model.PageInfo.fromOutlineNode(this.data);
		} else {
			config = NextThought.model.RelatedWork.fromOutlineNode(this.data);
		}

		this.navigate.call(null, config);
	},


	onCardClicked: function(e) {
		if (e && e.getTarget('.comment')) {
			e.stopEvent();
			this.bypassEvent = false;
		}

		if (this.bypassEvent) {
			AnalyticsUtil.getResourceTimer(this.ntiid, {
				type: 'resource-viewed'
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
