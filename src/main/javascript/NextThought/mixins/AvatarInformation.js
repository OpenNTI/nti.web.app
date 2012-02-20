Ext.define('NextThought.mixins.AvatarInformation', {

	toolTipTpl: new Ext.XTemplate(
	   '<div class="avatar-detail-tip">',
		   '<img src="{icon}" width=64 height=64"/>',
		   '<div>',
			   '<span class="avatar-detail-tip-realname">{realname}</span> ',
			   '<span class="avatar-detail-tip-alias">{alias}</span>',
		   '</div>',
	   '</div>',
	   {
		   compile:true
	   }),

	setupAvatarDetailToolTip: function(cmp, user) {
		var data = {
				realname: user.get('realname'),
				alias: user.get('alias'),
				icon: user.get('avatarURL')
			};

		var toolTip = Ext.create('Ext.tip.ToolTip', {
			cls: 'avatar-detail-tip-container',
			target: cmp.getEl(),
			html: '',
			dismissDelay: 0
		});

		toolTip.update(this.toolTipTpl.apply(data));
	}

	
});
