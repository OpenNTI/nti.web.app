const Ext = require('@nti/extjs');
const { ControlBar } = require('@nti/web-content');
const { encodeForURI } = require('@nti/lib-ntiids');
const { StickyToolbar } = require('@nti/web-content');
const { wait } = require('@nti/lib-commons');
const ReactHarness = require('internal/legacy/overrides/ReactHarness');
const SearchStateStore = require('internal/legacy/app/search/StateStore');
const BaseModel = require('internal/legacy/model/Base');

require('internal/legacy/common/menus/JumpTo');
require('./TableOfContents');

const HASH_REGEX = /#/;

const style = stylesheet`
	.fixed-header {
		/* uuugggghhhh... I hate z-index */
		z-index: 1;
		position: relative;
	}
`;

module.exports = exports = Ext.define(
	'NextThought.app.contentviewer.navigation.Base',
	{
		extend: 'Ext.Component',
		cls: 'content-toolbar',

		usePageSource: false,

		toolbarTpl: Ext.DomHelper.markup([{ cls: 'toolbar', html: '<div/>' }]),

		headerTpl: Ext.DomHelper.markup([{ cls: 'control-bar-container' }]),

		renderTpl: Ext.DomHelper.markup([
			{ cls: 'toolbar-container', html: '{toolbarContents}' },
			{ cls: 'header', html: '{headerContents}' },
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
			toolbarCmpEl: '.toolbar',
		},

		onClassExtended: function (cls, data) {
			var tpl = cls.superclass.renderTpl,
				superSelectors = Ext.clone(cls.superclass.renderSelectors);

			data.renderSelectors = Ext.applyIf(
				superSelectors,
				data.renderSelectors || {}
			);

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
				data.pagingTpl = data.pagingTpl.replace(
					'{super}',
					cls.superclass.pagingTpl || ''
				);
			}

			if (!data.pathTpl) {
				data.pathTpl = cls.superclass.pathTpl || false;
			} else {
				data.pathTpl = data.pathTpl.replace(
					'{super}',
					cls.superclass.pathTpl || ''
				);
			}

			if (!data.headerTpl) {
				data.headerTpl = cls.superclass.headerTpl || false;
			} else {
				data.headerTpl = data.headerTpl.replace(
					'{super}',
					cls.superclass.headerTpl || ''
				);
			}

			if (!data.toolbarTpl) {
				data.toolbarTpl = cls.superclass.toolbarTpl || false;
			} else {
				data.toolbarTpl = data.toolbarTpl.replace(
					'{super}',
					cls.superclass.toolbarTpl || ''
				);
			}

			if (data.toolbarTpl) {
				data.toolbarTpl = data.toolbarTpl.replace(
					'{pagingContent}',
					data.pagingTpl || ''
				);
				data.toolbarTpl = data.toolbarTpl.replace(
					'{pathContent}',
					data.pathTpl || ''
				);
			}

			data.renderTpl = data.renderTpl.replace(
				'{toolbarContents}',
				data.toolbarTpl || ''
			);
			data.renderTpl = data.renderTpl.replace(
				'{headerContents}',
				data.headerTpl || ''
			);
		},

		initComponent() {
			this.callParent(arguments);

			this.SearchStore = SearchStateStore.getInstance();
		},

		beforeRender: function () {
			this.callParent(arguments);

			var me = this,
				rd = {};

			me.renderData = Ext.apply(me.renderData || {}, rd);
		},

		afterRender: function () {
			const addToolbar = pageSource => {
				this.toolbarCmp = ReactHarness.create({
					cls: style.fixedHeader,
					component: StickyToolbar,
					path: this.path,
					pageSource: pageSource,
					rootId: this.rootId,
					currentPage: this.currentPage,
					getRouteFor: this.getRouteFor.bind(this),
					addHistory: true,
					addRouteTo: true,
					// toc: this.toc,
					showToc: this.showToc,
					contentPackage: this.contentPackage,
					hideControls: this.hideControls,
					hideHeader: this.hideHeader,
					doNavigation: this.doNavigation,
					selectTocNode: node => this.selectTocNode(node),
					renderTo: this.toolbarCmpEl,
				});
			};

			if (!this.usePageSource) {
				addToolbar();
			} else if (this.pageSource instanceof Promise) {
				this.pageSource.then(x => addToolbar(x));
			} else {
				addToolbar(this.pageSource);
			}
		},

		getRouteFor(obj = {}, context) {
			if (context === 'previous-page' || context === 'next-page') {
				return () => {
					this.doNavigation(
						obj.title,
						(this.rootRoute || '') + encodeForURI(obj.ntiid)
					);
				};
			} else if (obj.NavNTIID) {
				return () => {
					const parts = (obj && obj.NavNTIID.split('#')) || [];
					parts[0] = encodeForURI(parts[0]);

					this.doNavigation('', parts.join('#'));
				};
			} else if (obj.isContentUnitSearchHit) {
				return () => {
					const { Containers, Fragments } = obj;
					const container = Containers[0];
					const frag = Fragments && Fragments[0];

					if (frag) {
						this.SearchStore.setHitForContainer(
							container,
							BaseModel.interfaceToModel(obj),
							BaseModel.interfaceToModel(frag)
						);
					}

					this.doNavigation(
						obj.ContainerTitle,
						encodeForURI(container)
					);
				};
			}
		},

		onDestroy: function () {
			if (this.toolbarCmp) {
				this.toolbarCmp.destroy();
				delete this.toolbarCmp;
			}

			this.callParent(arguments);
		},

		showToast: function (msgOrConfig) {
			const config = Ext.isString(msgOrConfig)
				? { text: msgOrConfig }
				: msgOrConfig;

			this.toolbarCmp.setProps({ message: config });

			this.safeToCloseToast = false;

			let returnConfig = {
				el: 1, // just give it some non-empty value
			};

			if (config.minTime) {
				returnConfig.openLongEnough = wait(config.minTime);
			}

			returnConfig.close = time => {
				this.safeToCloseToast = true;

				wait(time || 0).then(() => {
					// don't close if another showToast request came in while
					// waiting to close this one
					if (this.safeToCloseToast) {
						this.toolbarCmp?.setProps({ message: null });
					}
				});
			};

			returnConfig.updateMessage = newMsgCfg => {
				this.toolbarCmp?.setProps({ message: newMsgCfg });
			};

			return returnConfig;
		},

		onPageSourceLoad: function (pageSource) {
			if (!this.rendered) {
				this.on(
					'afterrender',
					this.onPageSourceLoad.bind(this, pageSource)
				);
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

		async maybeAddControlbarForPageInfo(pageInfo) {
			const contentPackageId = pageInfo.get('ContentPackageNTIID');

			if (
				pageInfo.get('isFakePageInfo') &&
				pageInfo.backedBy?.hasLink('edit')
			) {
				this.controlBar = ReactHarness.create({
					component: ControlBar,
					renderTo: this.controlBarEl,
					type: pageInfo.backedBy?.isSurvey ? 'survey' : 'reading',
					doEdit: () => {
						const route = this.rootRoute
							? this.rootRoute
							: `/${encodeForURI(this.activeNTIID)}/`;

						this.doNavigation('', `${route}edit`);
					},
				});

				this.on('destroy', () => {
					if (this.controlBar) {
						this.controlBar.destroy();
					}
				});

				return;
			}

			if (pageInfo.get('isFakePageInfo') || !contentPackageId) {
				return;
			}

			if (!this.rendered) {
				this.on('afterrender', () =>
					this.maybeAddControlbarForPageInfo(pageInfo)
				);
				return;
			}

			const contentPackage = await this.bundle
				?.getContentPackage(contentPackageId)
				.catch(() => null);

			if (contentPackage && contentPackage.hasLink('edit')) {
				this.controlBar = ReactHarness.create({
					component: ControlBar,
					renderTo: this.controlBarEl,
					doEdit: () => {
						const route = this.rootRoute
							? this.rootRoute
							: `/${encodeForURI(this.activeNTIID)}/`;

						this.doNavigation('', `${route}edit`);
					},
				});

				this.on('destroy', () => {
					if (this.controlBar) {
						this.controlBar.destroy();
					}
				});
			}
		},

		findPageNode(node) {
			if (!node || node.tag === 'toc') {
				return node;
			}

			const href = node && node.getAttribute('href');

			if (HASH_REGEX.test(href)) {
				return this.findPageNode(node.parent);
			}

			return node;
		},

		selectTocNode(node) {
			const href = node.getAttribute('href');
			const page = this.findPageNode(node);

			let pageId = page && page.id;

			pageId = pageId && encodeForURI(pageId);

			if (node !== page && HASH_REGEX.test(href)) {
				pageId += `#${href.split('#')[1]}`;
			}

			this.doNavigation(node.title, pageId, { pageNumber: node.page });
		},
	}
);
