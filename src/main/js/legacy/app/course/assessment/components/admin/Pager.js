const Ext = require('@nti/extjs');


module.exports = exports = Ext.define('NextThought.app.course.assessment.components.admin.Pager', {
	extend: 'Ext.Component',
	alias: 'widget.course-assessment-admin-pager',

	MAX_VISIBLE: 20,
	MIDDLE_RANGE: 10,

	height: 22,

	cls: 'pager',

	renderTpl: Ext.DomHelper.markup({
		cls: 'pager-container',
		cn: [
			// {tag: 'tpl', 'if': 'hasRandomAccess', cn: [
			//	{tag: 'label', cls: 'page', cn: [
			//		'Page:',
			//		{tag: 'input', type: 'text', value: '{current}'}
			//	]}
			// ]},
			{tag: 'ul', cls: 'pages', cn: [
				{tag: 'tpl', 'for': 'pages', cn: [
					{tag: 'tpl', 'if': 'isEllipse', cn: [
						{tag: 'li', cls: 'page ellipse', 'data-start': '{start}', 'data-end': '{end}', html: '{html}'}
					]},
					{tag: 'tpl', 'if': '!isEllipse', cn: [
						{tag: 'li', cls: 'page {cls}', 'data-index': '{index}', html: '{html}'}
					]}
				]}
			]}
		]
	}),


	renderSelectors: {
		pageInput: 'label input[type=text]'
	},


	afterRender: function () {
		this.callParent(arguments);

		this.mon(this.el, 'click', 'onItemClick');

		this.attachListeners();
	},


	bindStore: function (store) {
		this.store = store;

		this.mon(store, 'load', 'onStoreLoad');

		this.onStoreLoad();
	},


	getPages: function (count, current) {
		var pages = [],
			halfRange = Math.floor(this.MIDDLE_RANGE / 2);

		function addRange (start, end) {
			var i;

			for (i = start; i <= end; i++) {
				pages.push({
					html: i,
					isEllipse: false,
					index: i,
					cls: i === current ? 'active' : 'not-active'
				});
			}
		}

		function addEllipsis (start, end) {
			pages.push({
				html: '...',
				isEllipse: true,
				start: start,
				end: end
			});
		}

		// if we have less pages than the max add them all
		if (count <= this.MAX_VISIBLE) {
			addRange(1, count);
		//if the first half of the middle range is at or before the start
		} else if (current - halfRange <= 1) {
			addRange(1, this.MIDDLE_RANGE);
			addEllipsis(this.MIDDLE_RANGE + 1, count - 4);
			addRange(count - 2, count);
		//if the last half of the middle range is at or after the end
		} else if (current + halfRange >= count) {
			addRange(1, 3);
			addEllipsis(4, count - this.MIDDLE_RANGE - 1);
			addRange(count - this.MIDDLE_RANGE, count);
		} else {
			addRange(1, 3);
			addEllipsis(4, current - halfRange - 1);
			addRange(current - halfRange, current + halfRange);
			addEllipsis(current + halfRange + 1, count);
			addRange(count - 2, count);
		}

		return pages;
	},


	addNavigationPages: function (pages, pageCount, current) {
		pages.unshift({
			html: '<',
			index: 'prev',
			isEllipse: false,
			cls: current > 1 ? 'enabled' : 'disabled'
		});

		pages.push({
			html: '>',
			index: 'next',
			isEllipse: false,
			cls: current < pageCount ? 'enabled' : 'disabled'
		});
		return pages;
	},


	onStoreLoad: function () {
		var pages,
			pageCount = this.store.getTotalPages(),
			current = parseInt(this.store.getCurrentPage(), 10);

		pages = this.getPages(pageCount, current);
		pages = this.addNavigationPages(pages, pageCount, current);

		this.renderData = Ext.apply(this.renderData || {}, {
			current: current,
			pages: pages,
			hasRandomAccess: pageCount > this.MAX_VISIBLE
		});

		if (current > pageCount && pageCount > 0) {
			this.store.loadPage(pageCount);
		}

		if (this.rendered) {
			this.renderTpl.overwrite(this.el, this.renderData);
			this.attachListeners();
		}

		this.fireEvent('unmask-view');
	},


	attachListeners: function () {
		if (!this.rendered) { return; }

		var pageInput = this.el.down('label.page input[type=text]');

		Ext.destroy(this.pageInputMons);

		if (pageInput) {
			this.pageInputMons = this.mon(pageInput, {
				'keypress': 'onKeyPress',
				'destroyable': true
			});
		}
	},


	onItemClick: function (e) {
		if (e.getTarget('.disabled')) { return; }

		var page = e.getTarget('.page'),
			index = page && page.getAttribute('data-index');


		if (index === 'prev') {
			this.loadPrev();
		} else if (index === 'next') {
			this.loadNext();
		}
		else if (index === 'first') {
			this.loadFirstPage();
		}
		else if (index === 'last') {
			this.loadLastPage();
		}
		else if (index) {
			this.loadPage(index);
		}
	},


	loadPage: function (page) {
		this.fireEvent('mask-view');
		this.store.loadPage(page);
	},


	loadPrev: function () {
		var current = parseInt(this.store.getCurrentPage(), 10);

		if (current > 1) {
			this.loadPage(current - 1);
		}
	},


	loadNext: function () {
		var current = parseInt(this.store.getCurrentPage(), 10),
			total = this.store.getTotalPages();

		if (current < total) {
			this.loadPage(current + 1);
		}
	},


	loadLastPage: function () {
		var current = parseInt(this.store.getCurrentPage(), 10),
			lastPage = this.store.getTotalPages();

		if (current !== lastPage) {
			this.loadPage(lastPage);
		}
	},


	loadFirstPage: function () {
		var current = parseInt(this.store.getCurrentPage(), 10);

		if (current !== 1) {
			this.loadPage(1);
		}
	},


	getPageInputValue: function () {
		var pageInput = this.el.down('label.page input[type=text'),
			value = (pageInput && pageInput.getValue()) || 1;

		return parseInt(value, 10);
	},


	onKeyPress: function (e) {
		var keyCode = e.keyCode,
			allowed = [e.BACKSPACE, e.TAB, e.ESCAPE];

		if (keyCode === e.ENTER) {
			this.loadPage(this.getPageInputValue());
		}

		if (Ext.Array.contains(allowed, keyCode)) {
			return;
		}

		if (keyCode === 65 && e.ctrlKey) {
			return;
		}

		if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
			e.preventDefault();
		}
	}
});
