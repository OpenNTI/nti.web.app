Ext.define('NextThought.app.profiles.community.components.Header', {
	extend: 'NextThought.app.profiles.components.Header',
	alias: 'widget.profile-community-header',

	cls: 'profile-header community-header',


	renderTpl: Ext.DomHelper.markup([
		{cls: 'title'},
		{cls: 'buttons'}
	]),


	renderSelectors: {
		titleEl: '.title',
		buttonsEl: '.buttons'
	},


	updateEntity: function(community) {
		if (!this.rendered) {
			this.on('afterrender', this.updateEntity.bind(this, community));
			return;
		}

		this.titleEl.update(community.getName());

		this.clearButtons();

		if (community.getLink('join')) {
			this.addButton({
				cls: 'join',
				action: 'onJoin',
				label: 'Join Community'
			});
		} else if (community.getLink('leave')) {
			this.addButton({
				cls: 'leave',
				action: 'onLeave',
				label: 'Leave Community'
			});
		}
	},


	onJoin: function() {
		this.joinCommunity();
	},


	onLeave: function() {
		this.leaveCommunity();
	}
});
