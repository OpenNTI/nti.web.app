Ext.define('NextThought.app.course.overview.components.editing.outlinenode.Preview', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-outlinenode-preview',

	requires: [
		'NextThought.app.windows.Actions',
		'NextThought.app.course.overview.components.editing.outlinenode.Window'
	],

	windowName: 'edit-outlinenode',

	cls: 'outline-node-preview',


	controlTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'tpl', 'if': 'tip', cn: [
			{cls: 'button {cls}', 'data-action': '{action}', 'data-qtip': '{tip}', html: '{label}'}
		]},
		{tag: 'tpl', 'if': '!tip', cn: [
			{cls: 'button {cls}', 'data-action': '{action}', html: '{label}'}
		]}
	])),


	renderTpl: Ext.DomHelper.markup([
		{cls: 'controls'},
		{cls: 'outline-node', cn: [
			{cls: 'title', html: '{title}'}
		]}
	]),


	renderSelectors: {
		controlsEl: '.controls'
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.WindowActions = NextThought.app.windows.Actions.create();

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.outlineNode.getTitle()
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.controlsEl, 'click', this.onControlClick.bind(this));

		if (this.outlineNode.getLink('edit')) {
			this.addControlButton({
				cls: 'edit',
				action: 'editNode',
				label: 'Edit'
			});
		}
	},


	addControlButton: function(data) {
		data.tip = data.tip || '';

		this.controlTpl.append(this.controlsEl, data);
	},


	onControlClick: function(e) {
		var button = e.getTarget('[data-action]'),
			action = button && button.getAttribute('data-action');

		if (action && this[action]) {
			this[action]();
		}
	},


	editNode: function() {
		this.WindowActions.showWindow(this.windowName, null, null, null, {outlineNode: this.outlineNode});
	}
});
