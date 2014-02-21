Ext.define('NextThought.view.forums.forum.parts.Header', {
	extend: 'Ext.Component',
	alias: 'widget.forums-forum-header',

	cls: 'topic-list-header',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'new-topic', html: 'New Discussion'},
		{cls: 'controls', cn: [
			{cls: 'position', cn: [
				{tag: 'span', cls: 'bold', html: 'Page'},
				{tag: 'span', cls: 'current bold', html: '{currentPage}'},
				'of',
				{tag: 'span', cls: 'total bold', html: '{totalPages}'}
			]},
			{cls: 'pager', cn: [
				{cls: 'prev disabled'},
				{cls: 'next disabled'}
			]}
		]}
	]),

	renderSelectors: {
		newTopicEl: '.new-topic',
		currentEl: '.controls .position .current',
		totalEl: '.controls .position .total',
		prevEl: '.controls .pager .prev',
		nextEl: '.controls .pager .next'
	},

	beforeRender: function() {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, this.record.getData());
	},


	afterRender: function() {
		var me = this, total;

		me.mon(me.newTopicEl, 'click', function() {
			me.fireEvent('new-topic', me, me.record);
		});

		me.updatePosition();
		me.mon(me.store, 'load', 'updatePosition');

		me.mon(me.prevEl, 'click', 'previousPage');
		me.mon(me.nextEl, 'click', 'nextPage');
	},


	updatePosition: function() {
		var total = Math.ceil(this.store.getTotalCount() / this.store.pageSize),
			currentPage = total ? this.store.currentPage : 0;

		this.prevEl[(currentPage > 1) ? 'removeCls' : 'addCls']('disabled');
		this.nextEl[(currentPage < total) ? 'removeCls' : 'addCls']('disabled');

		this.currentEl.update(currentPage);
		this.totalEl.update(total);
	},


	previousPage: function() {
		var current = this.store.currentPage;

		if (current - 1 > 0) {
			this.fireEvent('page-change');
			this.store.previousPage();
		}
	},


	nextPage: function() {
		var total = Math.ceil(this.store.getTotalCount() / this.store.pageSize),
			current = this.store.currentPage;

		if (current + 1 <= total) {
			this.fireEvent('page-change');
			this.store.nextPage();
		}
	}
});
