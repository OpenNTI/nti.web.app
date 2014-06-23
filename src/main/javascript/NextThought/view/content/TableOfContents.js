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
			'{{{NextThought.view.content.Navigation.toc}}}'
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


	onItemClick: function(record) {
		this.onSelect(record);
	},


	onSelect: function(record) {
		this.hide();
		this.fireEvent('navigation-selected', record.getId());
	},


	onShow: function() {
		this.callParent(arguments);
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
		scroll = el.getScrollingEl();
		height = scroll.getHeight();
		offset = el.getOffsetsTo(scroll)[1];

		if (offset < 0 || offset > height) {
			scroll.scrollTo('top', (scroll.getScrollTop() + offset) - (height / 2), true);
		}

		el.focus();
	},


	setContentPackage: function(record, active, root) {
		var rec;

		this.activeNTIID = active;
		this.bindStore(new Ext.data.Store({
			model: NextThought.model.TopicNode,
			data: Library.getToc(record)
		}));


		if (root) {
			rec = this.store.getById(root);
			if (rec) {
				rec.set('isRoot', true);
			} else {
				console.warn('Strange, we set a root, but did not find it.');
			}
		}

		this.refresh();
	}
});
