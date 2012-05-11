Ext.define( 'NextThought.view.annotations.ShareWith', {
	extend: 'NextThought.view.Window',
	requires: [
		'NextThought.view.form.fields.ShareWithField',
		'NextThought.util.Annotations'
	],
	alias : 'widget.share',
	

	width: 450,
	modal: true,

	items: [
		{
			xtype: 'component',
			renderTpl: [
				'<div class="{model:lowercase}">',
				'<div class="share-with-data">',
					'<div class="title"><img id="{id}-avatar" src="{avatarURL}"> {title}</div>',
					'<div class="description">{model:capitalize} by <span id="{id}-name" class="username">{name}</span></div>',
					'<div class="snippet">{content:ellipsis(150)}</div>',
				'</div>',
				'</div>'
			],
			childEls: ['name','avatar']
		},
		{
			xtype: 'container',
			autoEl: {tag: 'div', cls: 'field' },
			items: { xtype: 'sharewith' }
		},
		{
			xtype: 'container',
			cls: 'buttons',
			layout:{ type: 'hbox', pack: 'end' },
			defaults: {ui: 'primary', scale: 'medium'},
			items: [
				{xtype: 'button', text: 'Save', action: 'save'},
				{xtype: 'button', text: 'Cancel', ui: 'secondary', handler: function(btn){
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

		//any down calls below this:
		this.down('sharewith').setValue(this.record.get('sharedWith'));
	}
});
