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

	footerTpl: Ext.DomHelper.markup([
		{cls: 'footer', cn: [
			{tag: 'tpl', 'if': 'enableEditControls', cn: [
				{cls: 'edit-container'}
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
			'{footer}'
		]}
	]),


	onClassExtended: function(cls, data){
		data.toolbarTpl = data.toolbarTpl || cls.superclass.toolbarTpl || false;
		data.footerTpl = data.footerTpl || cls.superclass.footerTpl || false;

		var tpl = this.prototype.renderTpl.replace('{toolbar}', data.toolbarTpl || '');
		tpl = tpl.replace('{footer}', data.footerTpl || '');

		if (!data.renderTpl) {
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


	addEditControls: function () {
		var container = this.el.down('.edit-container');
		
		this.editCmp = Ext.widget('overview-editing-controls-edit', {
			record: this.record,
			parentRecord: this.parentRecord,
			root: this.root,
			renderTo: container
		});
	},


	addPublishControls: function(){
		var container = this.el.down('.publish-container');

		this.publishCmp = Ext.widget('overview-editing-controls-publish', {
			record: this.record,
			parentRecord: this.parentRecord,
			contents: this.contents,
			renderTo: container
		});
	},


	addCalendarControls: function(){
		var container = this.el.down('.calendar-container');

		if (container) {
			this.publishCmp = Ext.widget('overview-editing-controls-calendar', {
				record: this.record,
				contents: this.contents,
				renderTo: container
			});		
		}
	}

});
