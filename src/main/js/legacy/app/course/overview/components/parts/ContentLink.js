const Ext = require('extjs');
const AnalyticsUtil = require('legacy/util/Analytics');
const DomUtils = require('legacy/util/Dom');
const Globals = require('legacy/util/Globals');
const {getURL} = Globals;
const ParseUtils = require('legacy/util/Parsing');

require('legacy/mixins/EllipsisText');
require('legacy/common/components/cards/Card');
require('legacy/model/Note');
require('legacy/model/RelatedWork');
require('legacy/app/contentviewer/Actions');
require('legacy/util/Parsing');

function resolveIcon (config, n, root) {
	const icon = n.getAttribute('icon');
	let getIcon;

	if (config.record && config.record.resolveIcon) {
		getIcon = config.record.resolveIcon(root, config.course);
	} else if (Globals.ROOT_URL_PATTERN.test(icon)) {
		getIcon = Promise.resolve({url: getURL(icon)});
	} else {
		getIcon = Promise.resolve({url: getURL((root || '') + icon)});
	}

	return getIcon;
}


module.exports = exports = Ext.define('NextThought.app.course.overview.components.parts.ContentLink', {
	extend: 'NextThought.common.components.cards.Card',

	alias: [
		'widget.course-overview-content',
		'widget.course-overview-relatedworkref',
		'widget.course-overview-externallink'
	],

	doNotRenderIcon: true,

	// requires: ['NextThought.view.contentviewer.View'],

	renderTpl: Ext.DomHelper.markup([
		// { cls: 'thumbnail', style: { backgroundImage: 'url({thumbnail})'} },
		{ cls: 'thumbnail', cn: [
			{ cls: 'icon {extension} {iconCls}', style: 'background-image: url(\'{thumbnail}\');', cn: [
				{tag: 'label', cls: 'extension', html: '{extension}'}
			]}
		]},
		{ cls: 'meta', cn: [
			{ cls: 'title', html: '{title}' },
			{ cls: 'byline', html: '{{{NextThought.view.cards.Card.by}}}' },
			{ cls: 'description', html: '{description}' }
		]}
	]),

	renderSelectors: {
		iconEl: '.thumbnail .icon',
		extensionEl: '.thumbnail .icon .extension',
		meta: '.meta',
		titleEl: '.meta .title',
		liked: '.controls .like',
		favorites: '.controls .favorite',
		thumbnailEl: '.thumbnail'
	},

	constructor: function (config) {
		var n = config.node || {getAttribute: function (a) { return config[a];} },
			i = config.locationInfo || {
				root: config.course && config.course.getContentRoots()[0]
			},
			href = config.record && config.record.getHref ? config.record.getHref() : n.getAttribute('href'),
			ntiid = n.getAttribute('ntiid'),
			root = i && i.root;

		if (Globals.ROOT_URL_PATTERN.test(href)) {
			href = getURL(href);
		} else if (!ParseUtils.isNTIID(href) && !Globals.HOST_PREFIX_PATTERN.test(href)) {
			href = getURL((root || '') + href);
		}

		resolveIcon(config, n)
			.then((icon = {}) => {
				this.data.thumbnail = icon.url;
				this.data.extension = icon.extension;
				this.data.iconCls = icon.iconCls;


				if (this.iconEl) {
					this.iconEl.addCls([icon.extension || '', icon.iconCls || '']);
					this.iconEl.setStyle({backgroundImage: `url('${icon.url}')`});
				}

				if (this.extensionEl && icon.extension) {
					this.extensionEl.update(icon.extension);
				}
			});


		config.data = {
			'attribute-data-href': href, href: href,
			creator: n.getAttribute('byline') || n.getAttribute('creator'),
			description: n.getAttribute('desc') || n.getAttribute('description'),
			ntiid: ntiid,
			title: n.getAttribute('label'),
			targetMimeType: n.getAttribute('targetMimeType'),
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

	loadContainer: function () {
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

	appendTotal: function (total) {
		if (!this.rendered) {
			this.on('afterrender', Ext.bind(this.appendTotal, this, arguments), this, {single: true});
			return;
		}

		if (Ext.getDom(this.meta)) {
			this.commentTpl.append(this.meta, {count: total});
		}
	},

	containerLoaded: function (q, s, r) {
		var total = 0,
			json = Ext.decode(r && r.responseText, true);
		if (s && json) {
			total = json.FilteredTotalItemCount || 0;
		}

		this.appendTotal(total);
	},

	getCurrentBundle: function () {
		return this.course;
	},

	navigateToTarget: function () {
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

	onCardClicked: function (e) {
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

	setProgress: function (progress) {
		progress = progress || this.progress;

		this.progress = progress;

		if (!progress) { return; }

		var beenViewed = progress.hasBeenViewed(this.target) || progress.hasBeenViewed(this.ntiid);

		if (beenViewed) {
			this.addCls('viewed');
		}
	},

	setCommentCounts: function (commentCounts) {
		var summary = commentCounts[this.record.getId()],
			count = summary ? summary.ItemCount : 0;

		this.appendTotal(count);
	}
});
