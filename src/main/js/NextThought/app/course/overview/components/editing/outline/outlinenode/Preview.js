Ext.define('NextThought.app.course.overview.components.editing.outline.outlinenode.Preview', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-outline-outlinenode-preview',

	cls: 'outline-node-preview',

	requires: [
		'NextThought.app.course.overview.components.editing.controls.Edit',
		'NextThought.app.course.overview.components.editing.controls.Publish',
		'NextThought.app.course.overview.components.editing.controls.Calendar'
	],

	toolbarTpl: Ext.DomHelper.markup([
		{cls: 'toolbar', cn: [
			{cls: 'left', cn: [
				{tag: 'tpl', 'if': 'enableCalendarControls', cn: [
					{cls: 'calendar-container'}
				]}
			]},
			{cls: 'right', cn: [
				{tag: 'tpl', 'if': 'enablePublishControls', cn: [
					{cls: 'publish-container'}
				]}
			]}
		]}
	]),

	enableCalendarControls: false,
	enablePublishControls: false,
	enableEditControls: true,


	renderTpl: Ext.DomHelper.markup([
		{cls: 'outline-node', cn: [
			'{toolbar}',
			{cls: 'title', html: '{title}'},
			{cls: 'footer', cn: [
				{tag: 'tpl', 'if': 'enableEditControls', cn: [
					{cls: 'edit-container'}
				]}
			]}
		]}
	]),


	renderSelectors: {
		titleEl: '.title'
	},


	onClassExtended: function(cls, data) {
		data.toolbarTpl = data.toolbarTpl || cls.superclass.toolbarTpl || false;

		var tpl = this.prototype.renderTpl.replace('{toolbar}', data.toolbarTpl || '');

		if (!data.renderTpl || data.renderTpl.indexOf('{super}') === -1) {
			data.renderTpl = tpl;
		}
		else {
			//Allow the subclass to redefine the template and include the super's template
			data.renderTpl = data.renderTpl.replace('{super}', tpl);
		}
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.record.getTitle(),
			enableCalendarControls: Boolean(this.enableCalendarControls),
			enablePublishControls: Boolean(this.enablePublishControls),
			enableEditControls: Boolean(this.enableEditControls)
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		if (this.enableEditControls) {
			this.addEditControls();
		}
		if (this.enablePublishControls) {
			this.addPublishControls();
		}
		if (this.enableCalendarControls) {
			this.addCalendarControls();
		}
	},


	addEditControls: function() {
		var container = this.el.down('.edit-container');

		this.editCmp = Ext.widget('overview-editing-controls-edit', {
			record: this.record,
			parentRecord: this.parentRecord,
			onDelete: this.onDelete.bind(this),
			root: this.root,
			renderTo: container,
			afterSave: this.updateTitle.bind(this)
		});

		this.on('destroy', this.editCmp.destroy.bind(this.editCmp));
	},


	updateTitle: function() {
		if (this.titleEl) {
			this.titleEl.update(this.record.getTitle());
		}
	},


	addPublishControls: function() {
		var container = this.el.down('.publish-container');

		this.publishCmp = Ext.widget('overview-editing-controls-publish', {
			record: this.record,
			parentRecord: this.parentRecord,
			contents: this.contents,
			renderTo: container
		});

		this.on('destroy', this.publishCmp.destroy.bind(this.publishCmp));
	},


	addCalendarControls: function() {
		var container = this.el.down('.calendar-container');

		if (container) {
			this.dateCmp = Ext.widget('overview-editing-controls-calendar', {
				record: this.record,
				contents: this.contents,
				renderTo: container
			});

			this.on('destroy', this.dateCmp.destroy.bind(this.dateCmp));
		}
	},


	onDelete: function() {
		if (this.afterDelete) {
			this.afterDelete();
		}
	}
});
