export default Ext.define('NextThought.app.windows.components.Header', {
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
		this.ContextStore = NextThought.app.context.StateStore.getInstance();
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.closeEl, 'click', this.doClose.bind(this));
		this.mon(this.titleEl, 'click', 'onPathClicked');
	},

	setTitle: function(title) {
		if (!this.rendered) {
			this.on('afterrender', this.setTitle.bind(this, title));
			return;
		}

		this.titleEl.update(title);
	},


	showPathFor: function(record, leaf, length, parent) {
		//Get the root bundle, from the context StateStore
		if (!this.rendered) {
			this.on('afterrender', this.showPathFor.bind(this, record, leaf, length, parent));
			return;
		}
		var me = this,
			container = me.titleEl;

		me.record = record;

		me.NavigationActions.getBreadCrumb(record)
			.then(function(titles) {
				if (length && length >= 0) {
					titles = titles && titles.slice(0, length) || [];
				}

				if (parent) {
					titles.push({label: parent});
				}
				if (container.dom) {
					container.dom.innerHTML = '';
					container = me.pathTpl.append(container, {labels: titles, leaf: leaf}, true);
				}
			});
	},


	onPathClicked: function(e){
		var rootContext = this.ContextStore.getRootContext(),
			rootObj = rootContext.obj,
			rootId =  rootObj && rootObj.getId();

		if(this.record && (this.record.get('ContainerId') != rootId)){
			this.doNavigate(this.record);
		}
	}
});
