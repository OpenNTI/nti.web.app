Ext.define('NextThought.view.account.activity.badge.Preview', {
	extend: 'Ext.Component',
	alias: 'widget.activity-preview-badge',

	cls: 'badge-preview',
	renderTpl: Ext.DomHelper.markup([
		{cls: 'img', style: {backgroundImage: 'url({image})'}},
		{cls: 'wrap', cn: [
			{cls: 'name', html: '{name}'},
			{cls: 'description', html: '{description}'}
		]}
	]),

	beforeRender: function() {
		this.callParent(arguments);

		Ext.apply(this.renderData || {}, {
			image: this.record.get('image'),
			name: this.record.get('name'),
			description: this.record.get('description')
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		this.mon(this.el, 'click', function() {
			me.fireEvent('show-profile', $AppConfig.userObject, ['Achievements']);
		});
	}
});
