Ext.define( 'NextThought.view.sharing.Window', {
	extend: 'NextThought.view.Window',
	requires: [
		'NextThought.view.form.fields.UserListField',
		'NextThought.util.Annotations'
	],
	alias : 'widget.share-window',
	

	width: 450,
	modal: true,
	dialog: true,

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
			items: { xtype: 'user-list' }
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
		this.items = Ext.clone(this.items);
		var readOnly = this.record ? !this.record.isModifiable() : false,
			title = this.titleLabel ? this.titleLabel : readOnly ? 'Item Info' : 'Share this...',
			content = this.record.getBodyText() || 'This item does not have text',
			u = this.record? this.record.get('Creator') : $AppConfig.username,
			info = this.items.first();

		//if it is readonly, don't let people select more people they can't share with.
		if (readOnly){
			this.items[1].items.readOnly = true;
			this.items.last().items[1].text = 'Close';
			delete this.items.last().items[0];
		}

		info.renderData = {
			title: title,
			content: content,
			model: this.record? this.record.getModelName() : 'No Data',
			name: 'resolving...'
		};

		UserRepository.getUser(u, function(users){
			if (!info.rendered) {
				Ext.apply(info.renderData, {
					avatarURL: users[0].get('avatarURL'),
					name: users[0].getName()
				});
			}
			else {
				info.avatar.set({src: users[0].get('avatarURL')});
				info.name.update(users[0].get('realname'));
			}

		}, this);

		this.callParent(arguments);

		//any down calls below this:
		this.down('user-list').setValue(this.record.get('sharedWith'));
	}
});
