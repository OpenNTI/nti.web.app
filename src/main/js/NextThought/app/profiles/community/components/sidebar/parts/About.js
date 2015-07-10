Ext.define('NextThought.app.profiles.community.components.sidebar.parts.About', {
	extend: 'Ext.Component',
	alias: 'widget.profile-community-about',

	cls: 'profile-about community-about',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'avatar-container'},
		{cls: 'about'},
		{cls: 'see-membership', html: 'See Members'}
	]),


	renderSelectors: {
		avatarEl: '.avatar-container',
		aboutEl: '.about',
		seeMembersEl: '.see-membership'
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.seeMembersEl, 'click', this.onSeeMembers.bind(this));
	},


	updateEntity: function(entity) {
		if (!this.rendered) {
			this.on('afterrender', this.updateEntity.bind(this, entity));
			return;
		}

		this.avatarEl.update(Ext.util.Format.avatar(entity));
		this.aboutEl.update(entity.get('about'));
	},


	onSeeMembers: function() {
		if (this.gotoMembership) {
			this.gotoMembership();
		}
	}
});
