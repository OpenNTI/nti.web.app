Ext.define('NextThought.view.courseware.reports.Navigation', {
	extend: 'Ext.view.View',
	alias: 'widget.course-reports-navigation',

	ui: 'course-assessment',
	cls: 'nav-outline scrollable',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', html: 'Reports'},
		{ cls: 'outline-list'}
	]),

	renderSelectors: {
		titleEl: '.header',
		frameBodyEl: '.outline-list'
	},

	selModel: {
		allowDeselect: false,
		toggleOnClick: false,
		deselectOnContainerClick: false
	},

	overItemCls: 'over',
	itemSelector: '.outline-row',

	tpl: new Ext.XTemplate(
		Ext.DomHelper.markup(
			{ tag: 'tpl', 'for': '.', cn: [
				{ cls: 'outline-row', 'data-qtip': '{label:htmlEncode}', cn: [
					{ cls: 'label', html: '{label:htmlEncode}'}
				]}
			]}
		)
	),

	initComponent: function() {
		this.callParent(arguments);
		this.on('select', 'selectionChanged');
	},

	store: new Ext.data.Store({
		fields: [
			{name: 'label', type: 'string'},
			{name: 'id', type: 'string'}
		]
	}),


	addItem: function(view) {
		this.store.add({label: view.title, id: view.id});
	},


	selectItem: function(id) {
		var record = this.store.findRecord('id', id);

		if (!record) {
			console.error('No record for id', id);
			return;
		}

		this.getSelectionModel().select(record);
	},


	selectionChanged: function(sel, rec) {
		var id = rec && rec.get('id');

		this.fireEvent('show-view', id);
	},

	clear: function() {
		this.store.removeAll();
	}
});
