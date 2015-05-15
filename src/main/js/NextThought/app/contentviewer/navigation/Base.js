Ext.define('NextThought.app.contentviewer.navigation.Base', {
	extend: 'Ext.Component',
	alias: 'widget.content-toolbar',

	cls: 'content-toolbar',

	pagingTpl: Ext.DomHelper.markup(
		{tag: 'tpl', 'if': 'showPaging', cn: [
			{cls: 'page', cn: [
				{tag: 'span', cls: 'currentPage', html: '{page}'},
				' of ',
				{tag: 'span', cls: 'total', html: '{total}'}
			]},
			{cls: 'up {noPrev:boolStr("disabled")}'},
			{cls: 'down {noNext:boolStr("disabled)}'}
		]}
	),


	pathTpl: Ext.DomHelper.markup([
		{cls: 'toc', cn: [
			{cls: 'icon'},
			{cls: 'label', html: '{{{NextThought.view.content.Navigation.toc}}}'}
		]},
		{tag: 'tpl', 'for': 'path', cn: [
			{
				tag: 'span',
				cls: "path part {[xindex === xcount? 'current' : xindex === 1 ? 'root' : '']}",
				'data-index': '{#}',
				html: '{.}'
			}
		]}
	]),


	toolbarTpl: Ext.DomHelper.markup([
		{cls: 'right controls', html: '{pagingContent}'},
		{cls: 'path-items', html: '{pathContent}'}
	]),


	headerTpl: '',


	renderTpl: Ext.DomHelper.markup([
		{cls: 'content-toolbar toolbar', html: '{toolbarContent}'},
		{cls: 'header', html: '{headerContents}'}
	]),

	renderSelectors: {
		pagingEl: '.right.controls',
		pathEl: '.path-items',
		totalEl: '.page .total',
		currentPageEl: '.page .currentPage',
		nextEl: '.right.controls .down',
		previousEl: '.right.controls .up',
		tocEl: '.toc'
	},


	onClassExtended: function(cls, data) {
		data.renderSelectors = Ext.applyIf(data.renderSelectors || {}, cls.superclass.renderSelectors);
		data.pagingTpl = data.pagingTpl || cls.superclass.pagingTpl || false;
		data.pathTpl = data.pathTpl || cls.superclass.pathTpl || false;
		data.toolbarTpl = data.toolbarTpl || cls.superclass.toolbarTpl || false;

		var tpl = cls.superclass.renderTpl;

		if (data.cls) {
			data.cls = [cls.superclass.cls, data.cls].join(' ');
		}

		if (!data.renderTpl) {
			data.renderTpl = tpl;
		} else {
			data.renderTpl = data.renderTpl.replace('{super}', tpl);
		}

		if (!data.pagingTpl) {
			data.pagingTpl = cls.superclass.pagingTpl || false;
		} else {
			data.pagingTpl = data.pagingTpl.replace('{super}', cls.superclass.pagingTpl || '');
		}

		if (!data.pathTpl) {
			data.pathTpl = cls.superclass.pathTpl || false;
		} else {
			data.pathTpl = data.pathTpl.replace('{super}', cls.superclass.pathTpl || '');
		}

		if (!data.toolbarTpl) {
			data.toolbarTpl = cls.superclass.toolbarTpl || false;
		} else {
			data.toolbarTpl = data.toolbarTpl.replace('{super}', cls.superclass.pathTpl || '');
		}

		if (data.toolbarTpl) {
			data.toolbarTpl = data.toolbarTpl.replace('{pagingContent}', data.pagingTpl || '');
			data.toolbarTpl = data.toolbarTpl.replace('{pathContent}', data.pathTpl || '');
		}

		data.renderTpl  = data.renderTpl.replace('{headerContents}', data.headerTpl || '');
	},


	beforeRender: function() {
		this.callParent(arguments);

		var me = this,
			rd = {};

		if (me.path && me.path instanceof Promise) {
			me.path.then(me.onPathLoad.bind(me));
			rd.path = [];
		} else if (me.path) {
			rd.path = me.path;
		}

		if (me.pageSource && me.pageSource instanceof Promise) {
			me.pageSource.then(me.onPageSourceLoad.bind(me));
		} else if (me.pageSource) {
			rd.page = me.pageSource.getPageNumber();
			rd.total = me.pageSource.getTotal();
			noNext = !me.pageSource.hasNext();
			noPrev = !me.pageSource.hasPrevious();
			showPagine = true;

			me.onPagerUpdate();

			me.mon(me.pageSource, 'update', 'onPagerUpdate');
		}

		me.renderData = Ext.apply(me.renderData || {}, rd);

		me.on({
			pathEl: {
				click: 'onPathClicked',
				mouseover: 'onPathHover'
			},
			previousEl: {click: 'onPrevious'},
			nextEl: {click: 'onNext'}
		});
	},

	afterRender: function() {
		this.callParent(arguments);

		// if (!this.toc) {
		// 	this.tocEl.hide();
		// }
	},


	onPathLoad: function(path) {},


	onPageSourceLoad: function(pageSource) {},


	__getPathFromEvent: function(e) {
		var part = e.getTarget('.part');
	},


	onPathClicked: function(e) {},


	onPathHover: function(e) {},


	onPagerUpdate: function() {
		if (!this.rendered) {
			this.on('afterrender', this.onPagerUpdate.bind(this));
			return;
		}
	},


	onPrevious: function(e) {},


	onNext: function(e) {}
});
