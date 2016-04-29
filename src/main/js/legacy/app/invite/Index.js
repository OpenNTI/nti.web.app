const Ext = require('extjs');
const Form = require('legacy/common/form/Form');

module.exports = exports = Ext.define('NextThought.app.invite.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.invite-form',

	cls: 'invite-form',
	layout: 'none',
	items: [],
	schema: [
		{type: 'group', name: 'single-invite', inputs: [
			{type: 'text', required: true, cls: 'name', name: 'name', placeholder: 'Enter their full name'},
			{type: 'text', required: true, cls: 'email', name: 'email', placeholder: 'Enter their email'}
		]},
		{type: 'file', required: true, cls: 'bulk', name: 'bulk', displayName: 'Upload CVS File'}
	],

	initComponent () {
		this.callParent(arguments);

		this.inviteUrl = this.record.getLink('SendCourseInvitations');

		this.form = this.add({
			xtype: 'common-form',
			schema: this.schema,
			//onSuccess: this.onSuccess,
			onError: this.onError
		});
	},

	onError (error) {
		console.error(error);
	},

	onSave () {
		return this.form.submitTo(this.inviteUrl);
	}
});
