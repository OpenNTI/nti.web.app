Ext.define('NextThought.view.content.TableOfContents', {
	extend: 'Ext.view.View',
	alias: 'widget.table-of-contents-flyout',

	requires: [
		'NextThought.model.TopicNode'
	],

	mixins: {
		menuBehavior: 'NextThought.mixins.MenuShowHideBehavior'
	},

	cls: 'toc-flyout nav-outline',

	floating: true,
	hidden: true,
	renderTo: Ext.getBody(),

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', cn: [
			'{{{Table of Contents}}}'
		]},
		{ cls: 'outline-list'}
	]),

	renderSelectors: {
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
	},


	setContentPackage: function(record, active, root) {
		this.bindStore(new Ext.data.Store({
			model: NextThought.model.TopicNode,
			data: Library.getToc(record)
		}));
		this.refresh();
	}
});
