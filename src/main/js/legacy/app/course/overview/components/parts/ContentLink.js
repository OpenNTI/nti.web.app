const Ext = require('@nti/extjs');
const ContentviewerActions = require('internal/legacy/app/contentviewer/Actions');
const WindowsActions = require('internal/legacy/app/windows/Actions');
const WindowsStateStore = require('internal/legacy/app/windows/StateStore');
const Note = require('internal/legacy/model/Note');
const RelatedWork = require('internal/legacy/model/RelatedWork');
const PageInfo = require('internal/legacy/model/PageInfo');
const AnalyticsUtil = require('internal/legacy/util/Analytics');
const DomUtils = require('internal/legacy/util/Dom');
const Globals = require('internal/legacy/util/Globals');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);

require('internal/legacy/mixins/EllipsisText');
require('internal/legacy/common/components/cards/Card');
require('internal/legacy/util/Parsing');

function resolveIcon(config, n, root) {
	const icon = n.getAttribute('icon');
	let getIcon;

	if (config.record && config.record.resolveIcon) {
		getIcon = config.record.resolveIcon(root, config.course);
	} else if (Globals.ROOT_URL_PATTERN.test(icon)) {
		getIcon = Promise.resolve({ url: Globals.getURL(icon) });
	} else {
		getIcon = Promise.resolve({ url: Globals.getURL((root || '') + icon) });
	}

	return getIcon;
}

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.parts.ContentLink',
	{
		extend: 'NextThought.common.components.cards.Card',

		alias: [
			'widget.course-overview-content',
			'widget.course-overview-relatedworkref',
			'widget.course-overview-externallink',
		],

		doNotRenderIcon: true,

		// requires: ['NextThought.view.contentviewer.View'],

		renderTpl: Ext.DomHelper.markup([
			// { cls: 'thumbnail', style: { backgroundImage: 'url({thumbnail})'} },
			{
				cls: 'thumbnail',
				cn: [
					{
						cls: 'icon {extension} {iconCls}',
						style: "background-image: url('{thumbnail}');",
						cn: [
							{
								tag: 'label',
								cls: 'extension',
								html: '{extension}',
							},
						],
					},
				],
			},
			{
				cls: 'meta',
				cn: [
					{ cls: 'title', html: '{title:htmlEncode}' },
					{
						cls: 'byline',
						html: '{{{NextThought.view.cards.Card.by}}}',
					},
					{ cls: 'description', html: '{description:htmlEncode}' },
				],
			},
		]),

		renderSelectors: {
			iconEl: '.thumbnail .icon',
			extensionEl: '.thumbnail .icon .extension',
			meta: '.meta',
			titleEl: '.meta .title',
			liked: '.controls .like',
			favorites: '.controls .favorite',
			thumbnailEl: '.thumbnail',
		},

		constructor: function (config) {
			var n = config.node || {
					getAttribute: function (a) {
						return config[a];
					},
				},
				i = config.locationInfo || {
					root:
						config.course &&
						config.course.getContentRoots() &&
						config.course.getContentRoots()[0],
				},
				href =
					config.record && config.record.getHref
						? config.record.getHref()
						: n.getAttribute('href'),
				ntiid = n.getAttribute('ntiid'),
				root = i && i.root;

			if (Globals.ROOT_URL_PATTERN.test(href)) {
				href = Globals.getURL(href);
			} else if (
				!lazy.ParseUtils.isNTIID(href) &&
				!Globals.HOST_PREFIX_PATTERN.test(href)
			) {
				href = Globals.getURL((root || '') + href);
			}

			resolveIcon(config, n, root).then((icon = {}) => {
				this.data.thumbnail = icon.url;
				this.data.extension = icon.extension;
				this.data.iconCls = icon.iconCls;

				if (this.iconEl) {
					this.iconEl.addCls([
						icon.extension || '',
						icon.iconCls || '',
					]);
					this.iconEl.setStyle({
						backgroundImage: `url('${icon.url}')`,
					});
				}

				if (this.extensionEl && icon.extension) {
					this.extensionEl.update(icon.extension);
				}
			});

			config.data = {
				'attribute-data-href': href,
				href: href,
				creator: n.getAttribute('byline') || n.getAttribute('creator'),
				description:
					n.getAttribute('desc') || n.getAttribute('description'),
				ntiid: ntiid,
				title: n.getAttribute('label'),
				targetMimeType: n.getAttribute('targetMimeType'),
				notTarget: !Globals.shouldOpenInApp(ntiid, href),
				asDomSpec: DomUtils.asDomSpec,
			};

			this.ContentActions = ContentviewerActions.create();

			this.callParent([config]);

			this.WindowActions = WindowsActions.create();
			this.WindowStore = WindowsStateStore.getInstance();
		},

		commentTpl: new Ext.XTemplate(
			Ext.DomHelper.markup({
				cls: 'comment',
				cn: [{ html: '{count:plural("Comment")}' }],
			})
		),

		loadContainer: function () {
			var ntiid = this.data.href,
				req;

			if (!lazy.ParseUtils.isNTIID(ntiid)) {
				ntiid = this.data.ntiid;
				if (!ntiid) {
					return;
				}
			}

			req = {
				url: Service.getContainerUrl(
					ntiid,
					Globals.USER_GENERATED_DATA
				),
				scope: this,
				method: 'GET',
				params: {
					accept: Note.mimeType,
					batchStart: 0,
					batchSize: 1,
					filter: 'TopLevel',
				},
				callback: this.containerLoaded,
			};

			Ext.Ajax.request(req);
		},

		appendTotal: function (total) {
			if (!this.rendered) {
				this.on(
					'afterrender',
					Ext.bind(this.appendTotal, this, arguments),
					this,
					{ single: true }
				);
				return;
			}

			if (Ext.getDom(this.meta)) {
				this.commentTpl.append(this.meta, { count: total });
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

			if (lazy.ParseUtils.isNTIID(this.target)) {
				config = PageInfo.fromOutlineNode(this.data);
			} else {
				config = RelatedWork.fromOutlineNode(this.data);
			}

			this.navigate.call(null, config);
		},

		onCardClicked: function (e) {
			if (e && e.getTarget('.comment')) {
				e.stopEvent();
				this.bypassEvent = false;
			}

			if (this.bypassEvent) {
				AnalyticsUtil.startEvent(this.ntiid, 'ResourceView'); //??? where is the close?

				this.setProgress();
			}

			return this.callParent(arguments);
		},

		setProgress: function (progress) {
			progress = progress || this.progress;

			this.progress = progress;

			if (!progress) {
				return;
			}

			var beenViewed =
				progress.hasBeenViewed(this.target) ||
				progress.hasBeenViewed(this.ntiid);

			if (beenViewed) {
				this.addCls('viewed');
			}
		},

		setCommentCounts: function (commentCounts) {
			var summary =
					commentCounts[this.record.getId()] ||
					commentCounts[this.record.get('target-NTIID')],
				count = summary ? summary.ItemCount : 0;

			this.appendTotal(count);
		},
	}
);
