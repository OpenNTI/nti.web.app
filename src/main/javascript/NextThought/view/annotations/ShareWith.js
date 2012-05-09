Ext.define( 'NextThought.view.annotations.ShareWith', {
	extend: 'NextThought.view.Window',
	requires: [
		'NextThought.view.form.fields.ShareWithField',
		'NextThought.util.AnnotationUtils'
	],
	alias : 'widget.share',
	

	width: 450,
	height: 300,
	modal: true,
//	layout: 'vbox',

	items: [
		{
			xtype: 'component',
			renderTpl: [
				'<div class="share-with-data {model:lowercase}">',
					'<img id="{id}-avatar" src="{avatarURL}" width="48" height="48">',
					'<div class="title">{title}</div>',
					'<div class="modeltype">{model:capitalize} by <span id="{id}-name" class="username">{name}</span></div>',
					'<div>',
						'<img class="charm" src="{blank}"/>',
						'<span class="content">{content:ellipsis(150)}</span>',
					'</div>'
			],
			childEls: ['name','avatar']
		},
		{
			xtype: 'sharewith'
		},
		{
			xtype: 'container',
			layout:{ type: 'hbox', pack: 'end' },
			items: [
				{xtype: 'button', text: 'Save', action: 'save'},
				{xtype: 'button', text: 'Cancel', handler: function(btn){
					btn.up('window').close();
				}}
			]
		}
	],


	initComponent: function(){
		var readOnly = this.record ? !this.record.isModifiable() : false,
			title = this.titleLabel ? this.titleLabel : readOnly ? 'Item Info' : 'Share this...',
			content = AnnotationUtils.getBodyTextOnly(this.record) || 'This item does not have text',
			u = this.record? this.record.get('Creator') : $AppConfig.username,
			info = this.items.first();

		info.renderData = {
			title: title,
			content: content,
			model: this.record? this.record.getModelName() : 'No Data',
			name: 'resolving...'
		};

		UserRepository.prefetchUser(u, function(users){
			var info = this.items.first();
			if (!info.rendered) {
				Ext.apply(info.renderData, {
					avatarURL: users[0].get('avatarURL'),
					username: users[0].getName()
				});
			}
			else {
				info.avatar.set({src: users[0].get('avatarURL')});
				info.name.update(users[0].get('realname'));
			}

		}, this);

		this.callParent(arguments);
	}
});
