var Ext = require('extjs');
var CSSUtils = require('../../../util/CSS');
var ParseUtils = require('../../../util/Parsing');
var MixinsMenuShowHideBehavior = require('../../../mixins/MenuShowHideBehavior');
var ModelTopicNode = require('../../../model/TopicNode');


module.exports = exports = Ext.define('NextThought.app.contentviewer.navigation.TableOfContents', {
	extend: 'Ext.view.View',
	alias: 'widget.table-of-contents-flyout',

	mixins: {
		menuBehavior: 'NextThought.mixins.MenuShowHideBehavior'
	},

	cls: 'toc-flyout nav-outline',
	floating: true,
	hidden: true,
	renderTo: Ext.getBody(),

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', cn: [
			{ cls: 'button', html: 'Close' },//'{{{NextThought.view.content.Navigation.toc.close|Close}}}' },
			{
				tag: 'form', cls: 'search filter', onsubmit: 'return false',
				cn: [
					{ tag: 'input', placeholder: '{{{NextThought.view.Navigation.search}}}', required: true },
					{ tag: 'button', type: 'reset', cls: 'clear' }
				]
			}
		]},
		{ cls: 'outline-list'}
	]),

	renderSelectors: {
		closeEl: '.header .button',
		formEl: 'form.search',
		clearEl: '.search button',
		filterEl: '.search input',
		frameBodyEl: '.outline-list'
	},

	getTargetEl: function() {
		return this.frameBodyEl;
	},

	overItemCls: 'over',
	itemSelector: '.outline-row',

	tpl: new Ext.XTemplate(Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [
		{ cls: 'outline-row {type}', cn: [
			{cls: 'label', html: '{label}'}
		]}
	]})),

	initComponent: function() {
		this.callParent(arguments);
		this.mixins.menuBehavior.constructor.call(this);
		this.cssRule = CSSUtils.getRule('table-of-content-styles', '#' + this.id);
		CSSUtils.set(this.cssRule, {
			position: 'fixed',
			height: 'auto',
			bottom: '0'
		}, true);


		this.on({
			closeEl: {click: 'hide'},
			clearEl: {click: 'onFilter', buffer: 1},
			filterEl: {
				keypress: 'onFilter',
				keydown: 'onFilter'
			}
		});
	},

	doFilter: Ext.Function.createBuffered(
			function() {
				if (this.isDestroyed) {return;}

				var v = this.filterEl.getValue();
				if (this.filterValue === v) {return;}

				this.filterValue = v;
				if (!v) {
					this.store.removeFilter('search');
				} else {
					this.store.filter({
						id: 'search',
						matchingIds: {},
						fn: function(r) {
							//if we alread know its matching don't check again
							if (this.matchingIds[r.get('NTIID')]) { return true; }

							var matches = r.matches(v);

							this.matchingIds = Ext.apply(this.matchingIds || {}, matches);

							return Object.keys(matches).length;
						}
					});
				}
				this.showSelection();
			},
			100),

	onFilter: function(e) {
		if (e) {
			try {
				e.stopPropagation();
			} catch (er) {
				console.warn('Filter event was not probably not stopped.');
				console.dir(er);
			}
			if (e.getKey() === e.ESC) {
				Ext.getDom(this.formEl).reset();
			}
		}

		this.doFilter();
	},

	onItemClick: function(record) {
		this.onSelect(record);
	},

	HASH_REGEX: /#/,

	__findPageNode: function(node) {
		if (!node || node.tagName === 'toc') {
			return node;
		}

		var href = node && node.getAttribute('href');

		if (this.HASH_REGEX.test(href)) {
			return this.__findPageNode(node.parentNode);
		}

		return node;
	},

	onSelect: function(record) {
		var node = record.get('tocNode'),
			pageNode = this.__findPageNode(node),
			href = node.getAttribute('href'),
			id = pageNode && pageNode.getAttribute('ntiid');

		id = ParseUtils.encodeForURI(id);

		if (node !== pageNode && this.HASH_REGEX.test(href)) {
			id += '#' + href.split('#')[1];
		}

		this.doNavigation(pageNode.getAttribute('label'), id);
	},

	onShow: function() {
		this.callParent(arguments);
		this.showSelection();
		this.stopShowHideTimers();
	},

	selectId: function(id) {
		this.activeNTIID = id;
	},

	showSelection: function() {
		var rec = this.store.getById(this.activeNTIID);
		if (rec) {
			this.getSelectionModel().select(rec, false, true);
			wait(100).then(this.scrollSelectionIntoView.bind(this));
		}
	},

	scrollSelectionIntoView: function() {
		var el, scroll, offset, height,
			sel = this.getSelectionModel().getSelection()[0];
		if (!sel) {return;}

		el = Ext.get(this.getNode(sel));
		if (el) {
			scroll = el.getScrollingEl();
			height = scroll.getHeight();
			offset = el.getOffsetsTo(scroll)[1];

			if (offset < 0 || offset > height) {
				scroll.scrollTo('top', (scroll.getScrollTop() + offset) - (height / 2), true);
			}
		}
		this.filterEl.focus();
	}
});
