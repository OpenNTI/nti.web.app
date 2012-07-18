Ext.define('NextThought.view.chat.GutterEntry',{
	extend: 'Ext.Component',
	alias: 'widget.chat-gutter-entry',

	cls: 'gutter-entry',

	renderTpl: [
		'<img src="{avatarURL}" alt="{name}" class="avatar">',
		'<div class="wrapper">',
			'<div class="name">{name}</div>',
			'<div class="status">{status}</div>',
		'</div>'
	],

	renderSelectors: {
		icon: 'img.avatar',
		name: 'div.name',
		status: 'div.status'
	},



	initComponent: function(){
		this.renderData = Ext.apply(this.renderData||{}, this.user.data);

		Ext.apply(this.renderData, {
			name: this.user.getName()
			//status: 'Idle...'
		});
		this.callParent();
	}
});
