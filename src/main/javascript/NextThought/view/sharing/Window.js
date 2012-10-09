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
				{
					xtype: 'container',
					flex: 1,
					items: [
						{xtype: 'checkbox', boxLabel: 'make sharing default', name: 'default'}
					]
				},
				{xtype: 'button', text: 'Save', action: 'save'},
				{xtype: 'button', text: 'Cancel', action: 'cancel', ui: 'secondary', handler: function(btn){
					btn.up('window').close();
				}}
			]
		}
	],


	initComponent: function(){
		this.items = Ext.clone(this.items);
		var readOnly = this.record ? !this.record.isModifiable() : false,
			title = this.titleLabel || (readOnly ? 'Item Info' : 'Share this...'),
			content = 'This item does not have text',
			u = this.record? this.record.get('Creator') : $AppConfig.username,
			info = this.items.first(),
			buttons;

		if (this.record && this.record.getBodyText) {
			content = this.record.getBodyText();
		}
		else if (this.record) {
			content = this.record.get('selectedText') || 'Content';
		}

		//if it is readonly, don't let people select more people they can't share with.
		if (readOnly){
			this.items[1].items.readOnly = true;
			buttons = this.items.last();
			buttons.items.shift();
			buttons.items.shift();
			Ext.apply(buttons.items[0],{
				text: 'Close',
				ui: 'primary'
			});
		}

		if (this.record){
			info.renderData = {
				title: title,
				content: content,
				model: this.record? this.record.getModelName() : 'No Data',
				name: 'resolving...'
			};

			UserRepository.getUser(u, function(user){
				if (!info.rendered) {
					Ext.apply(info.renderData, {
						avatarURL: user.get('avatarURL'),
						name: user.getName()
					});
				}
				else {
					info.avatar.set({src: user.get('avatarURL')});
					info.name.update(user.getName());
				}

			}, this);
		}
		else {
			//if no record, kill the parts that depend on it...
			this.items = this.items.slice(1);
		}

		this.callParent(arguments);

		//any down calls below this:
		if (this.record){
			if (this.record.get('sharedWith').length > 0) {
				this.setValue(this.record.get('sharedWith'));
			}
		}
		else if (this.value) {
			this.setValue(this.value);
		}

		this.on('close', function(){
			this.dragMaskOff();
		});
	},

	getValue: function(){
		return this.down('user-list').getValue();
	},

	setValue: function(v) {
		this.down('user-list').setValue(v);
	}
});
