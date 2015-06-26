Ext.define('NextThought.app.search.components.Results', {
	extend: 'Ext.container.Container',
	alias: 'widget.search-results',

	requires: [
		'NextThought.app.search.components.results.BlogResult',
		'NextThought.app.search.components.results.ChatResult',
		'NextThought.app.search.components.results.ForumResult',
		'NextThought.app.search.components.results.TranscriptResult',
		'NextThought.app.navigation.path.Actions'
	],

	TYPE_TO_LABEL: {
		'note': 'Note',
		'videotranscript': 'Video',
		'communityheadlinepost': 'Topic',
		'generalforumcomment': 'Topic Comment',
		'messageinfo': 'Chat',
		'personalblogentrypost': 'Thought',
		'personalblogcomment': 'Thought Comment',
		'bookcontent': 'Reading'
	},

	layout: 'none',
	cls: 'search-results',


	initComponent: function() {
		this.callParent(arguments);
		this.PathActions = NextThought.app.navigation.path.Actions.create();
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
			label = this.TYPE_TO_LABEL[part],
			xtype = 'search-result-' + part;

		if (!Ext.isEmpty(Ext.ClassManager.getNameByAlias('widget.' + xtype))) {
			type = xtype;
		}

		return {
			xtype: type,
			hit: hit,
			label: label,
			navigateToObject: this.navigateToObject.bind(this),
			getPathToObject: this.PathActions.getPathToObject.bind(this.PathActions)
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

		if (!erroCmp) {
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
				autoEl: {cls: 'control-item load-more', html: 'Load More'},
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
