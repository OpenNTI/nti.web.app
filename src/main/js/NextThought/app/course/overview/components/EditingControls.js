Ext.define('NextThought.app.course.overview.components.EditingControls', {
	extend: 'Ext.Component',
	alias: 'widget.course-overview-editing-controls',

	cls: 'editing-controls',

	buttonTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'tpl', 'if': 'tip', cn: [
			{cls: 'button {cls}', 'data-action': '{action}', 'data-qtip': '{tip}', html: '{label}'}
		]},
		{tag: 'tpl', 'if': '!tip', cn: [
			{cls: 'button {cls}', 'data-action': '{action}', html: '{label}'}
		]}
	])),

	renderTpl: Ext.DomHelper.markup([
		{cls: 'buttons'}
	]),


	renderSelectors: {
		buttonsEl: '.buttons'
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.buttonsEl, 'click', this.onButtonClicked.bind(this));
	},


	onButtonClicked: function(e) {
		var button = e.getTarget('.button'),
			action = button.getAttribute('data-action');

		if (action && this[action]) {
			this[action](this);
		}
	},


	addButton: function(data) {
		data.tip = data.tip || '';

		this.buttonTpl.append(this.buttonsEl, data);
	},


	clearButtons: function() {
		if (this.buttonsEl) {
			this.buttonsEl.dom.innerHTML = '';
		}
	},


	showNotEditing: function() {
		this.clearButtons();

		this.addButton({
			cls: 'edit',
			action: 'doEdit',
			label: 'Edit'
		});
	},


	showEditing: function() {
		this.clearButtons();

		this.addButton({
			cls: 'edit',
			action: 'stopEdit',
			label: 'Stop Editing'
		});
	},


	doEdit: function() {
		if (this.openEditing) {
			this.openEditing();
		}
	},


	stopEdit: function() {
		if (this.closeEditing) {
			this.closeEditing();
		}
	}
});
