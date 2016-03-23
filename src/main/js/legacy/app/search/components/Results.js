var Ext = require('extjs');
var ResultsBlogResult = require('./results/BlogResult');
var ResultsChatResult = require('./results/ChatResult');
var ResultsForumResult = require('./results/ForumResult');
var ResultsTranscriptResult = require('./results/TranscriptResult');
var ResultsHighlightResult = require('./results/HighlightResult');
var ResultsVideo = require('./results/Video');
var ResultsNote = require('./results/Note');
var PathActions = require('../../navigation/path/Actions');
var WindowsActions = require('../../windows/Actions');


module.exports = exports = Ext.define('NextThought.app.search.components.Results', {
	extend: 'Ext.container.Container',
	alias: 'widget.search-results',

	TYPE_TO_CLS: {
		'note': 'note',
		'videotranscript': 'video',
		'forums-communityheadlinepost': 'topic',
		'forums-generalforumcomment': 'topic-comment',
		'messageinfo': 'chat',
		'forum-personalblogentrypost': 'thought',
		'forum-personalblogcomment': 'thought-comment',
		'bookcontent': 'reading',
		'highlight': 'highlight'
	},

	layout: 'none',
	cls: 'search-results',

	initComponent: function() {
		this.callParent(arguments);
		this.PathActions = NextThought.app.navigation.path.Actions.create();
		this.WindowActions = NextThought.app.windows.Actions.create();
	},

	addResults: function(items) {
		var results = items.map(this.mapHitToCmp.bind(this));

		this.add(results);
	},

	getMimePart: function(mime) {
		if (Ext.isEmpty(mime)) {
			return 'search-result';
		}

		mime = mime.replace('application/vnd.nextthought.', '');
		mime = mime.replace('.', '-');

		return mime;
	},

	mapHitToCmp: function(hit) {
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

	showEmpty: function() {
		var emptyCmp = this.down('[emptyCmp]');

		if (!emptyCmp) {
			this.add({
				xtype: 'box',
				emptyCmp: true,
				autoEl: {cls: 'empty control-item', html: 'No results found.'}
			});
		}
	},

	showError: function() {
		var errorCmp = this.down('[errorCmp]');

		if (!errorCmp) {
			this.add({
				xtype: 'box',
				errorCmp: true,
				autoEl: {cls: 'error control-item', html: 'Error loading search results.'}
			});
		}
	},

	showLoading: function() {
		var loadingCmp = this.down('[loadingCmp]');

		if (!loadingCmp) {
			this.add({
				xtype: 'box',
				loadingCmp: true,
				autoEl: {cls: 'loading-container control-item', cn: {cls: 'loading', html: 'Loading...'}}
			});
		}
	},

	removeLoading: function() {
		var loadingCmp = this.down('[loadingCmp]');

		if (loadingCmp) {
			this.remove(loadingCmp, true);
		}
	},

	showNext: function(handler) {
		var nextCmp = this.down('[nextCmp]');

		if (!nextCmp) {
			nextCmp = this.add({
				xtype: 'box',
				nextCmp: true,
				autoEl: {cls: 'control-item load-more', html: 'Show More'},
				afterRender: function() {
					this.mon(this.el, 'click', handler);
				}
			});
		}
	},

	removeNext: function() {
		var nextCmp = this.down('[nextCmp]');

		if (nextCmp) {
			this.remove(nextCmp, true);
		}
	}
});
