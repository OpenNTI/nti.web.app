Ext.define('NextThought.app.contentviewer.navigation.Base', {
	extend: 'Ext.Component',

	requires: [
		'NextThought.common.menus.JumpTo',
		'NextThought.app.contentviewer.navigation.TableOfContents'
	],

	cls: 'content-toolbar',

	pagingTpl: Ext.DomHelper.markup(
		{tag: 'tpl', 'if': 'showPaging', cn: [
			{cls: 'page', cn: [
				{tag: 'span', cls: 'currentPage', html: '{page}'},
				' of ',
				{tag: 'span', cls: 'total', html: '{total}'}
			]},
			{cls: 'prev {noPrev:boolStr("disabled")}', title: '{prevTitle}'},
			{cls: 'next {noNext:boolStr("disabled")}', title: '{nextTitle}'}
		]}
	),


	pathTpl: Ext.DomHelper.markup([
		{cls: 'toc {tocCls}', cn: [
			{cls: 'icon'},
			{cls: 'label', html: '{{{NextThought.view.content.Navigation.toc}}}'}
		]},
		{cls: 'breadcrumb', cn: [
			{tag: 'tpl', 'for': 'path', cn: [
				{
					tag: 'span',
					cls: "path part{[xindex === xcount?  ' current' : xindex === 1 ? ' root' : '']}{[values.cls ? ' ' + values.cls : '']}{[values.ntiid ? ' link' : '']}",
					'data-index': '{#}',
					html: '{label}'
				}
			]}
		]}
	]),


	toolbarTpl: Ext.DomHelper.markup([
		{cls: 'right controls', html: '{pagingContent}'},
		{cls: 'path-items', html: '{pathContent}'}
	]),


	headerTpl: '',


	renderTpl: Ext.DomHelper.markup([
		{cls: 'toolbar', html: '{toolbarContents}'},
		{cls: 'header', html: '{headerContents}'}
	]),

	renderSelectors: {
		pagingEl: '.right.controls',
		pathEl: '.path-items',
		totalEl: '.page .total',
		currentPageEl: '.page .currentPage',
		nextEl: '.right.controls .next',
		previousEl: '.right.controls .prev',
		tocEl: '.toc'
	},


	onClassExtended: function(cls, data) {
		var tpl = cls.superclass.renderTpl,
			superSelectors = Ext.clone(cls.superclass.renderSelectors);

		data.renderSelectors = Ext.applyIf(superSelectors, data.renderSelectors || {});

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
			data.toolbarTpl = data.toolbarTpl.replace('{super}', cls.superclass.toolbarTpl || '');
		}

		if (data.toolbarTpl) {
			data.toolbarTpl = data.toolbarTpl.replace('{pagingContent}', data.pagingTpl || '');
			data.toolbarTpl = data.toolbarTpl.replace('{pathContent}', data.pathTpl || '');
		}

		data.renderTpl = data.renderTpl.replace('{toolbarContents}', data.toolbarTpl || '');
		data.renderTpl = data.renderTpl.replace('{headerContents}', data.headerTpl || '');
	},


	beforeRender: function() {
		this.callParent(arguments);

		var me = this,
			rd = {};

		if (me.hideHeader) {
			rd.path = [];
		} else if (me.path && me.path instanceof Promise) {
			me.path.then(me.onPathLoad.bind(me));
			rd.path = [];
		} else if (me.path) {
			rd.path = me.path;
		}

		if (!me.hideControls && !me.hideHeader && me.pageSource) {
			if (me.pageSource instanceof Promise) {
				rd.showPaging = true;
				me.pageSource.then(me.onPageSourceLoad.bind(me));
			} else {
				rd.page = me.pageSource.getPageNumber();
				rd.total = me.pageSource.getTotal();
				rd.noNext = !me.pageSource.hasNext();
				rd.noPrev = !me.pageSource.hasPrevious();
				rd.nextTitle = me.pageSource.getNextTitle();
				rd.prevTitle = me.pageSource.getPreviousTitle();
				rd.showPaging = true;

				me.onPagerUpdate();

				me.mon(me.pageSource, 'update', 'onPagerUpdate');
			}
		}

		if (!me.toc) {
			rd.tocCls = 'hidden';
		} else if (me.toc instanceof Promise) {
			me.toc.then(me.buildTocComponent.bind(me));
		} else {
			me.buildTocComponent(me.toc);
		}

		me.renderData = Ext.apply(me.renderData || {}, rd);

		me.on({
			pathEl: {
				click: 'onPathClicked',
				mouseover: 'onPathHover',
				mouseout: 'onPathOut'
			},
			previousEl: {click: 'onPrevious'},
			nextEl: {click: 'onNext'}
		});
	},


	onPathLoad: function(path) {
		if (!this.rendered) {
			this.on('afterrender', this.onPathLoad.bind(this, path));
			return;
		}

		var tpl = new Ext.XTemplate(this.pathTpl);

		this.path = path;

		//clear out the old path
		this.pathEl.dom.innerHTML = '';

		tpl.append(this.pathEl, {
			tocCls: this.toc ? '' : 'hidden',
			path: path
		});
	},


	onPageSourceLoad: function(pageSource) {
		if (!this.rendered) {
			this.on('afterrender', this.onPageSourceLoad.bind(this, pageSource));
			return;
		}

		this.pageSource = pageSource;
		this.mon(pageSource, 'update', 'onPagerUpdate');
		this.onPagerUpdate();
	},


	__getPathFromEvent: function(e) {
		var part = e.getTarget('.part');
	},


	__getPathPart: function(part) {
		var index = part && part.getAttribute('data-index');

		index = parseInt(index, 10);
		return this.path[index - 1];
	},


	onPathClicked: function(e) {
		var part = e.getTarget('.part'), path;

		if (e.getTarget('.toc')) {
			this.onShowToc();
			return;
		}

		if (e.getTarget('.locked') || !part) { return; }

		path = this.__getPathPart(part);

		if (path) {
			this.doNavigation(path.title || '', path.route, path.precache || {});
		}
	},


	onPathHover: function(e) {
		var part = e.getTarget('.part'), path;

		if (e.getTarget('.locked') || !part) { return; }

		path = this.__getPathPart(part);

		if (path && path.siblings && path.siblings.length) {
			this.startShowingPathMenu(part, path);
		}
	},


	startShowingPathMenu: function(el, path) {
		var items = path.siblings,
			rect = el.getBoundingClientRect();

		items = items.map(function(item) {
			return {
				text: item.label,
				title: item.title,
				route: item.route,
				precache: item.precache,
				cls: item.cls
			};
		});

		if (this.pathMenu) {
			this.pathMenu.destroy();
		}

		this.pathMenu = Ext.widget('jump-menu', {
			ownerCmp: this,
			items: items,
			handleClick: this.switchPath.bind(this),
			maxHeight: Ext.Element.getViewportHeight() - (rect.top + rect.height + 40),
			defaults: {
				ui: 'nt-menuitems',
				xtype: 'menuitem',
				plain: true
			}
		});

		this.pathMenu.startShow(el, 'tl-bl', [-10, -20]);
	},


	onPathOut: function(e) {
		if (this.pathMenu && (!Ext.is.iPad || !this.pathMenu.isVisible())) {
			this.pathMenu.stopShow();
		}
	},


	switchPath: function(menu, item) {
		this.doNavigation(item.title || '', item.route, item.precache || {});
	},


	onPagerUpdate: function() {
		if (!this.rendered) {
			this.on('afterrender', this.onPagerUpdate.bind(this));
			return;
		}

		var ps = this.pageSource;

		this.currentPageEl.update(ps.getPageNumber());
		this.totalEl.update(ps.getTotal());

		this.nextEl[ps.hasNext() ? 'removeCls' : 'addCls']('disabled');
		this.previousEl[ps.hasPrevious() ? 'removeCls' : 'addCls']('disabled');

		this.nextEl.dom.setAttribute('title', ps.getNextTitle());
		this.previousEl.dom.setAttribute('title', ps.getPreviousTitle());
	},


	onPrevious: function(e) {
		if (e.getTarget('.disabled')) {
			return;
		}

		var previous = this.pageSource.getPrevious(),
			title = this.pageSource.getPreviousTitle();

		this.doNavigation(title, previous);
	},


	onNext: function(e) {
		if (e.getTarget('.disabled')) {
			return;
		}

		var next = this.pageSource.getNext(),
			title = this.pageSource.getNextTitle();

		this.doNavigation(title, next);
	},


	showToast: function(msgOrConfig) {
		if (!this.rendered) {
			this.on('afterrender', this.showToast.bind(this, msgOrConfig));
			return;
		}

		var me = this, toast,
			config = Ext.isString(msgOrConfig) ? { text: msgOrConfig} : msgOrConfig,
			content = config.content || {html: config.text},
			currentPath = this.pathEl.down('.path.current'),//the last item in the bread crumb
			currentPathLeft = currentPath && currentPath.getX(),
			pathLeft = this.pathEl.getX(),
			left = currentPathLeft && pathLeft ? currentPathLeft - pathLeft : 0;

		config.cls = config.cls ? 'header-toast ' + config.cls : 'header-toast';

		toast = Ext.widget('box', {
			cls: config.cls,
			autoEl: content,
			renderTo: this.pathEl,
			style: {
				left: left + 12 + 'px;'
			}
		});

		if (config.minTime) {
			toast.waitToClose = wait(config.minTime);
		}

		me.pathEl.addCls('show-toast');

		return {
			el: toast,
			//fulfills after the minimum time the toast has to be open passes
			openLongEnough: toast.waitToClose,
			close: function(time) {
				this.closing = true;
				wait(time || 0)
					.then(function() {
						//if the path el is still around
						if (me.pathEl) {
							me.pathEl.removeCls('show-toast');
						}

						//wait to give the animations a chance to finish before we
						//remove the toast from the dom
						wait(500).then(toast.destroy.bind(toast));
					});
			}
		};
	},


	setPageInfo: function(pageInfo) {
		this.activeNTIID = pageInfo.getId();

		if (this.tocComponent) {
			this.tocComponent.selectId(this.activeNTIID);
		}
	},


	buildTocComponent: function(store) {
		this.tocComponent = Ext.widget({
			xtype: 'table-of-contents-flyout',
			store: store,
			doNavigation: this.doNavigation.bind(this)
		});

		if (this.activeNTIID) {
			this.tocComponent.selectId(this.activeNTIID);
		}

		if (this.hasTocOpen) {
			this.onShowToc();
		}
	},


	onShowToc: function() {
		if (!this.tocComponent) {
			this.hasTocOpen = true;
			return;
		}

		this.tocComponent.showBy(this.el, 'tl-tl', [0, 0]);
	}
});
