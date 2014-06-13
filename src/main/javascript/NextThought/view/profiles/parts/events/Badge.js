Ext.define('NextThought.view.profiles.parts.events.Badge', {
	extend: 'Ext.Component',
	alias: 'widget.profile-activity-badge-item',

	cls: 'badge-event',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'img', style: {backgroundImage: 'url({image})'}},
		{cls: 'wrap', cn: [
			{cls: 'name', html: '{username} earned the {badgename} badge.'},
			{cls: 'date', html: '{date}'},
			{cls: 'description', html: '{description}'}
		]}
	]),

	badgeNameTpl: Ext.DomHelper.createTemplate({tag: 'span', cls: 'link', html: '{name}'}),

	beforeRender: function() {
		this.callParent(arguments);

		var username = isMe(this.user) ? 'You' : this.user,
			badgename = this.badgeNameTpl.apply({name: this.record.get('name')});

		Ext.apply(this.renderData || {}, {
			image: this.record.get('image'),
			username: username,
			badgename: badgename,
			description: this.record.get('description'),
			date: Ext.Date.format(this.record.get('EventTime'), 'F j, Y')
		});
	},

	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		me.mon(me.el.down('.link'), 'click', function() {
			me.fireEvent('show-profile', $AppConfig.userObject, ['Achievements']);
		});
	}
});
