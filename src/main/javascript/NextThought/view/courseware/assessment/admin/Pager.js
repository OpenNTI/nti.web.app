Ext.define('NextThought.view.courseware.assessment.admin.Pager', {
	extend: 'Ext.Component',
	alias: 'widget.course-assessment-admin-pager',

	height: 22,

	cls: 'pager',

	renderTpl: Ext.DomHelper.markup({
		cls: 'pager-container',
		cn: [
			{tag: 'span', cls: 'prev {prevCls}', html: '&lt;'},
			{tag: 'tpl', 'for': 'pages', cn: [
				{tag: 'span', cls: 'page {cls}', 'data-index': '{#}', html: '{#}'}
			]},
			{tag: 'span', cls: 'next {nextCls}', html: '&gt;'}
		]
	}),


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.el, 'click', 'onItemClick');
	},


	bindStore: function(store) {
		this.store = store;

		this.mon(store, 'load', 'onStoreLoad');

		this.onStoreLoad();
	},


	onStoreLoad: function() {
		var s = this.store,
			pages = [], i,
			total = this.store.getTotalCount(),
			pageCount = this.store.getTotalPages(),
			current = parseInt(this.store.currentPage);

		//if there isn't a total count it probably means the store hasn't loaded yet
		//so just return
		if (!total) {
			return;
		}

		for (i = 0; i < pageCount; i++) {
			pages.push( {
				cls: (i + 1) === current ? 'active' : 'not-active'
			});
		}

		this.renderData = Ext.apply(this.renderData || {}, {
			pages: pages,
			prevCls: current > 1 ? 'enabled' : 'disabled',
			nextCls: current < pageCount ? 'enabled' : 'disabled'
		});

		if (current > pageCount) {
			this.store.loadPage(pageCount);
		}

		if (this.rendered) {
			this.renderTpl.overwrite(this.el, this.renderData);
		}
	},


	onItemClick: function(e) {
		var page = e.getTarget('.page');

		if (e.getTarget('.disabled')) { return; }

		if (page) {
			this.loadPage(page.getAttribute('data-index'));
		} else if (e.getTarget('.prev')) {
			this.loadPrev();
		} else if (e.getTarget('.next')) {
			this.loadNext();
		}
	},


	loadPage: function(page) {
		this.store.loadPage(page);
	},


	loadPrev: function() {
		var current = parseInt(this.store.currentPage);

		if (current > 1) {
			this.loadPage(current - 1);
		}
	},


	loadNext: function() {
		var current = parseInt(this.store.currentPage),
			total = this.store.getTotalPages();

		if (current < total) {
			this.loadPage(current + 1);
		}
	}
});
