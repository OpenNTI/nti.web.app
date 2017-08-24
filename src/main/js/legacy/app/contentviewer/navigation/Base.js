const Ext = require('extjs');
const {wait} = require('nti-commons');
const {ControlBar} = require('nti-content');
const { encodeForURI } = require('nti-lib-ntiids');
const { StickyToolbar } = require('nti-content');

const ReactHarness = require('legacy/overrides/ReactHarness');

require('legacy/common/menus/JumpTo');
require('./TableOfContents');


module.exports = exports = Ext.define('NextThought.app.contentviewer.navigation.Base', {
	extend: 'Ext.Component',
	cls: 'content-toolbar',

	toolbarTpl: Ext.DomHelper.markup([
		{cls: 'toolbar', html: '<div/>'}
	]),

	headerTpl: Ext.DomHelper.markup([
		{cls: 'control-bar-container'}
	]),

	renderTpl: Ext.DomHelper.markup([
		{cls: 'toolbar-container', html: '{toolbarContents}'},
		{cls: 'header', html: '{headerContents}'}
	]),

	renderSelectors: {
		pagingEl: '.right.controls',
		pathEl: '.path-items',
		totalEl: '.page .total',
		currentPageEl: '.page .currentPage',
		nextEl: '.right.controls .next',
		previousEl: '.right.controls .prev',
		tocEl: '.toc',
		controlBarEl: '.control-bar-container',
		toolbarCmpEl: '.toolbar'
	},

	onClassExtended: function (cls, data) {
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

		if (!data.headerTpl) {
			data.headerTpl = cls.superclass.headerTpl || false;
		} else {
			data.headerTpl = data.headerTpl.replace('{super}', cls.superclass.headerTpl || '');
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

	beforeRender: function () {
		this.callParent(arguments);

		var me = this,
			rd = {};

		me.renderData = Ext.apply(me.renderData || {}, rd);
	},


	afterRender: function () {
		this.toolbarCmp = ReactHarness.create({
			component: StickyToolbar,
			path: this.path,
			pageSource: this.pageSource,
			toc: this.toc,
			hideControls: this.hideControls,
			hideHeader: this.hideHeader,
			doNavigation: this.doNavigation,
			renderTo: this.toolbarCmpEl
		});
	},

	onPageSourceLoad: function (pageSource) {
		if (!this.rendered) {
			this.on('afterrender', this.onPageSourceLoad.bind(this, pageSource));
			return;
		}

		this.pageSource = pageSource;
		this.mon(pageSource, 'update', 'onPagerUpdate');
		this.onPagerUpdate();
	},

	setPageInfo: function (pageInfo) {
		this.activeNTIID = pageInfo.getId();

		if (this.tocComponent) {
			this.tocComponent.selectId(this.activeNTIID);
		}

		this.maybeAddControlbarForPageInfo(pageInfo);
	},


	maybeAddControlbarForPageInfo (pageInfo) {
		const contentPackageId = pageInfo.get('ContentPackageNTIID');

		if (pageInfo.get('isFakePageInfo') || !contentPackageId) { return; }

		if (!this.rendered) {
			this.on('afterrender', () => this.maybeAddControlbarForPageInfo(pageInfo));
			return;
		}

		const contentPackage = this.bundle && this.bundle.getContentPackage(contentPackageId);

		if (contentPackage && contentPackage.hasLink('edit')) {
			this.controlBar = ReactHarness.create({
				component: ControlBar,
				renderTo: this.controlBarEl,
				doEdit: () => {
					const route = this.rootRoute ? this.rootRoute : `/${encodeForURI(this.activeNTIID)}/`;

					this.doNavigation('', `${route}edit`);
				}
			});

			this.on('destroy', () => {
				if (this.controlBar) {
					this.controlBar.destroy();
				}
			});
		}

	}
});
