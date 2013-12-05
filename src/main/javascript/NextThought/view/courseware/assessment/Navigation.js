Ext.define('NextThought.view.courseware.assessment.Navigation', {
	extend: 'Ext.view.View',
	alias: 'widget.course-assessment-navigation',

	ui: 'course-assessment',
	cls: 'nav-outline scrollable',
	preserveScrollOnRefresh: true,

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', html: '{title}'},
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

	getTargetEl: function() { return this.frameBodyEl; },
	overItemCls: 'over',
	itemSelector: '.outline-row',
	tpl: new Ext.XTemplate(
			Ext.DomHelper.markup(
					{ tag: 'tpl', 'for': '.', cn: [
						{ cls: 'outline-row', 'data-qtip': '{label:htmlEncode}', cn: [
							{ tag: 'tpl', 'if': 'count', cn: { cls: 'count', html: '{count}' } },
							{ cls: 'label', html: '{label:htmlEncode}'}
						]}
					]}), {
				//template functions
			}),


	store: new Ext.data.Store({
		fields: [
			{name: 'id', type: 'string'},
			{name: 'label', type: 'string'},
			{name: 'count', type: 'int', defaultValue: 0},
			{name: 'type', type: 'string', defaultValue: 'view'},//or filter
			{name: 'mapping', type: 'string'}
		],
		data: [
			//{id: 'activity', label: 'Activity & Notifications', mapping: '', count: 6},
			//{id: 'assignments', label: 'Assignments', mapping: '' },
			//{id: 'grades', label: 'Grades and Performance', mapping: '' }
		]
	}),


	initComponent: function() {
		this.callParent(arguments);
		this.on('select', 'selectionChanged');
	},


	setTitle: function(title) {
		this.title = title;
		if (this.titleEl) {
			this.titleEl.update(title);
		}
		else {
			this.renderData = Ext.apply(this.renderData || {}, {
				title: title
			});
		}
	},


	addView: function(view) {
		var id = view.xtype.split(/[-_\/\\\. ]/).last();
		this.store.add({mapping: view.xtype, label: view.title, id: id});
		//If a view wants to define sub-views or filters...
		//if (view.getSubViewItems) {
		//}
	},


	selectionChanged: function(sel, rec) {
		var d = (rec && rec.getData()) || {};

		this.fireEvent('show-view', d.mapping, d.type, d.id);
	},


	updateSelection: function(active, fromUser) {
		var view = active.xtype || active,
			i = this.store.findBy(function(r) {
				return r.get('type') === 'view' && r.get('mapping') === view;
			});

		this.getSelectionModel().select(i, false, fromUser !== true);
	},


	removeNavigationItem: function(relatedComponent) {}
});
