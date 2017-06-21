const Ext = require('extjs');

const PathActions = require('legacy/app/navigation/path/Actions');
const WindowsActions = require('legacy/app/windows/Actions');

require('./results/BlogResult');
require('./results/ChatResult');
require('./results/ForumResult');
require('./results/TranscriptResult');
require('./results/HighlightResult');
require('./results/Video');
require('./results/Note');
require('./results/Timeline');
require('./results/RelatedWorkRef');


module.exports = exports = Ext.define('NextThought.app.search.components.Results', {
	extend: 'Ext.container.Container',
	alias: 'widget.search-results',

	TYPE_TO_CLS: {
		'note': 'note',
		'ntitranscript': 'video',
		'forums-communityheadlinepost': 'topic',
		'forums-generalforumcomment': 'topic-comment',
		'messageinfo': 'chat',
		'forums-personalblogentrypost': 'thought',
		'forums-personalblogcomment': 'thought-comment',
		'contentunit': 'reading',
		'highlight': 'highlight',
		'relatedworkref': 'reading',
		'ntitimeline': 'reading',
		'ntivideo': 'video'
	},

	layout: 'none',
	cls: 'search-results',

	items: [
		{
			xtype: 'container',
			layout: 'none',
			hitContainer: true,
			cls: 'search-results-hits',
			items: []
		},
		{
			xtype: 'container',
			layout: 'none',
			actionContainer: true,
			cls: 'search-results-actions'
		}
	],

	initComponent: function () {
		this.callParent(arguments);
		this.PathActions = PathActions.create();
		this.WindowActions = WindowsActions.create();

		this.hitContainer = this.down('[hitContainer]');
		this.actionContainer = this.down('[actionContainer]');
	},

	addResults: function (items) {
		var results = items.map(this.mapHitToCmp.bind(this));

		this.hitContainer.add(results);
	},

	getMimePart: function (mime) {
		if (Ext.isEmpty(mime)) {
			return 'search-result';
		}

		mime = mime.replace('application/vnd.nextthought.', '');
		mime = mime.replace('.', '-');

		return mime;
	},

	mapHitToCmp: function (hit) {
		var type = 'search-result',
			part = this.getMimePart(hit.get('TargetMimeType')),
			cls = this.TYPE_TO_CLS[part],
			xtype = 'search-result-' + part;

		if (!Ext.isEmpty(Ext.ClassManager.getNameByAlias('widget.' + xtype))) {
			type = xtype;
		}

		return {
			xtype: type,
			hit: hit,
			typeCls: cls,
			navigateToSearchHit: this.navigateToSearchHit.bind(this),
			getPathToObject: this.PathActions.getPathToObject.bind(this.PathActions),
			pushWindow: this.WindowActions.pushWindow.bind(this.WindowActions)
		};
	},

	showEmpty: function () {
		const text = this.getResultCount() > 0 ? 'No more results found.' : 'No results found.';
		var emptyCmp = this.actionContainer.down('[emptyCmp]');

		if (!emptyCmp) {
			this.actionContainer.add({
				xtype: 'box',
				emptyCmp: true,
				autoEl: {cls: 'empty control-item', html: text}
			});
		}
	},

	showError: function () {
		var errorCmp = this.hitContainer.down('[errorCmp]');

		if (!errorCmp) {
			this.hitContainer.add({
				xtype: 'box',
				errorCmp: true,
				autoEl: {cls: 'error control-item', html: 'Error loading search results.'}
			});
		}
	},

	showLoading: function () {
		var loadingCmp = this.actionContainer.down('[loadingCmp]');

		if (!loadingCmp) {
			this.actionContainer.removeAll(true);
			this.actionContainer.add({
				xtype: 'box',
				loadingCmp: true,
				autoEl: {cls: 'loading-container control-item', cn: {cls: 'loading', html: 'Loading...'}}
			});
		}
	},

	removeLoading: function () {
		var loadingCmp = this.actionContainer.down('[loadingCmp]');

		if (loadingCmp) {
			this.actionContainer.remove(loadingCmp, true);
		}
	},

	removeResults () {
		this.hitContainer.removeAll(true);
	},

	getResultCount () {
		return this.hitContainer.items.length;
	},

	showNext: function (handler) {
		var nextCmp = this.actionContainer.down('[nextCmp]');

		if (!nextCmp) {
			nextCmp = this.actionContainer.add({
				xtype: 'box',
				nextCmp: true,
				autoEl: {cls: 'control-item load-more', html: 'Show More'},
				afterRender: function () {
					this.mon(this.el, 'click', handler);
				}
			});
		}
	},

	removeNext: function () {
		var nextCmp = this.actionContainer.down('[nextCmp]');

		if (nextCmp) {
			this.actionContainer.remove(nextCmp, true);
		}
	}
});
