Ext.define('NextThought.app.search.components.Results', {
	extend: 'Ext.container.Container',
	alias: 'widget.search-results',

	requires: [
		'NextThought.app.search.components.results.BlogResult',
		'NextThought.app.search.components.results.ChatResult',
		'NextThought.app.search.components.results.ForumResult',
		'NextThought.app.search.components.results.TranscriptResult'
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
			label: label
		};
	},


	showEmpty: function() {
		if (!this.emptyCmp) {
			this.emptyCmp = this.add({
				xtype: 'box',
				autoEl: {cls: 'empty control-item', html: 'No results found.'}
			});
		}
	},


	showError: function() {
		if (!this.erroCmp) {
			this.emptyCmp = this.add({
				xtype: 'box',
				autoEl: {cls: 'error control-item', html: 'Error loading search results.'}
			});
		}
	},


	showLoading: function() {
		if (!this.loadingCmp) {
			this.loadingCmp = this.add({
				xtype: 'box',
				autoEl: {cls: 'loading-container control-item', cn: {cls: 'loading', html: 'Loading...'}}
			});
		}
	},


	removeLoading: function() {
		if (this.loadingCmp) {
			this.remove(this.loadingCmp, true);
			delete this.loadingCmp;
		}
	},


	showNext: function(handler) {
		if (!this.nextCmp) {
			this.nextCmp = this.add({
				xtype: 'box',
				autoEl: {cls: 'control-item load-more', html: 'Load More'},
				afterRender: function() {
					this.mon(this.el, 'click', handler);
				}
			});
		}
	},


	removeNext: function() {
		if (this.nextCmp) {
			this.remove(this.nextCmp);
			delete this.nextCmp;
		}
	}
});
