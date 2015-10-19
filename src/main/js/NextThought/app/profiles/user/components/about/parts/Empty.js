Ext.define('NextThought.app.profiles.user.components.about.parts.Empty', {
	extend: 'Ext.Component',
	alias: 'widget.profile-user-empty',

	cls: 'empty-profile',

	renderTpl: Ext.DomHelper.markup({
		html: 'This user has not yet filled out their profile.'
	})
});
