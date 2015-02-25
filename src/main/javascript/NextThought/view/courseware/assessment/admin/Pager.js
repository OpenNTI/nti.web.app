Ext.define('NextThought.view.courseware.assessment.admin.Pager', {
	extend: 'Ext.Component',
	alias: 'widget.course-assessment-admin-pager',

	height: 22,

	cls: 'pager',

	renderTpl: Ext.DomHelper.markup({
		cls: 'pager-container',
		cn: [
			{tag: 'span', cls: 'prev', html: '&lt;'},
			{tag: 'tpl', 'for': 'pages', cn: [
				{tag: 'span', cls: 'page', 'data-index': '{#}', html: '{#}'}
			]},
			{tag: 'span', cls: 'next', html: '&gt;'}
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
			pages = [], pageCount, i,
			total = this.store.getTotalCount(),
			pageSize = this.store.pageSize,
			current = this.store.currentPage;

		//if there isn't a total count it probably means the store hasn't loaded yet
		//so just return
		if (!total) {
			return;
		}

		pageCount = Math.ceil(total / pageSize);

		for (i = 0; i < pageCount; i++) {
			pages.push( (i + 1) === current);
		}

		this.renderData = Ext.apply(this.renderData || {}, {
			pages: pages
		});

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
		debugger;
		this.store.loadPrevPage();
	},


	loadNext: function() {
		debugger;
		this.store.loadNextPage();
	}
});
