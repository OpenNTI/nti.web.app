export default Ext.define('NextThought.app.profiles.community.components.sidebar.parts.About', {
	extend: 'Ext.Component',
	alias: 'widget.profile-community-about',

	cls: 'profile-about community-about',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'avatar-container'},
		{cls: 'about'}
	]),


	renderSelectors: {
		avatarEl: '.avatar-container',
		aboutEl: '.about'
	},

	updateEntity: function(entity) {
		if (!this.rendered) {
			this.on('afterrender', this.updateEntity.bind(this, entity));
			return;
		}

		this.avatarEl.update(Ext.util.Format.avatar(entity));
		this.aboutEl.update(entity.get('about'));
	}
});
