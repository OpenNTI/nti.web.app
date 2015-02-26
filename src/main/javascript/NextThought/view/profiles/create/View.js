Ext.define('NextThought.view.profiles.create.View', {
	extend: 'Ext.Component',
	alias: 'widget.profile-create-view',

	requires: [
		'NextThought.view.profiles.About'
	],


	mixins: {
		EditingUser: 'NextThought.view.profiles.mixins.EditUserMixin'
	},

	layout: 'auto',

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'fold',
			cn: [
				{ cls: 'field locked', cn: [
					{ tag: 'input', type: 'text', 'data-field': 'username', value: '{name}', disabled: 'true', 'placeholder': '{{{NextThought.view.profiles.About.name}}}' },
					{ cls: 'error-msg', 'data-prop': 'username'}
				]},

				{ cls: 'field', cn: [
					{ tag: 'input', type: 'text', 'data-field': 'location', value: '{location}', 'placeholder': '{{{NextThought.view.profiles.About.location}}}' },
					{ cls: 'error-msg', 'data-prop': 'location'}
				]},

				{ cls: 'field', cn: [
					{ tag: 'input', type: 'text', 'data-field': 'affiliation', value: '{affiliation}', 'placeholder': '{{{NextThought.view.profiles.About.affiliation}}}' },
					{ cls: 'error-msg', 'data-prop': 'affiliation'}
				]},

				{ cls: 'field', cn: [
					{ tag: 'input', type: 'text', 'data-field': 'role', value: '{role}', 'placeholder': '{{{NextThought.view.profiles.About.role}}}' },
					{ cls: 'error-msg', 'data-prop': 'role'}
				]},

				{ cls: 'field', cn: [
					{ tag: 'textarea', type: 'text', 'data-field': 'about', html: '{about}', 'placeholder': '{{{NextThought.view.profiles.About.write}}}' },
					{ cls: 'error-msg', 'data-prop': 'about'}
				]}
			]
		},
		{ cls: 'error-msg' }
	]),

	initComponent: function() {
		this.callParent(arguments);

		this.on({
			'save-edits': 'onSaveEdits',
			'cancel-edits': 'onCancelEdits'
		});
	},


	beforeRender: function() {
		this.callParent(arguments);
		var user = this.user;
		if (!user) {return;}
		this.renderData = Ext.applyIf(this.renderData || {}, {
			name: user.getName(),
			location: user.get('location'),
			affiliation: user.get('affiliation'),
			role: user.get('role'),
			about: user.get('about')
		});
	},


	getEditableFields: function() {
		return this.el && this.el.query('input[data-field]:not([disabled=true]),textarea[data-field]');
	},


	getValueForField: function(field) {
		var text = field && field.value;

		return Ext.isEmpty(text) ? null : text;
	}
});
