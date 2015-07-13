Ext.define('NextThought.app.windows.components.Header', {
	extend: 'Ext.Component',
	alias: 'widget.window-header',


	requires: [
		'NextThought.app.navigation.path.Actions'
	],

	pathTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'tpl', 'for': 'labels', cn: [
			{tag: 'span', html: '{label}'}
		]},
		{tag: 'tpl', 'if': 'leaf', cn: [
			{tag: 'span', cls: 'leaf' , html: '{leaf}'}
		]}
	])),

	cls: 'window-header',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'title'},
		{cls: 'close'}
	]),


	renderSelectors: {
		titleEl: '.title',
		closeEl: '.close'
	},

	initComponent: function() {
		this.callParent(arguments);

		this.NavigationActions = NextThought.app.navigation.path.Actions.create();
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.closeEl, 'click', this.doClose.bind(this));
	},

	setTitle: function(title) {
		if (!this.rendered) {
			this.on('afterrender', this.setTitle.bind(this, title));
			return;
		}

		this.titleEl.update(title);
	},


	showPathFor: function(record, leaf, length) {
		//Get the root bundle, from the context StateStore
		if (!this.rendered) {
			this.on('afterrender', this.showPathFor.bind(this, record, leaf, length));
			return;
		}
		var me = this,
			container = me.titleEl;

		me.NavigationActions.getBreadCrumb(record)
			.then(function(titles) {
				if (length) {
					titles = titles.slice(0, length);
				}

				container.dom.innerHTML = '';
				container = me.pathTpl.append(container, {labels: titles, leaf: leaf}, true);
			});
	}
});
