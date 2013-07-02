Ext.define( 'NextThought.view.sharing.Window', {
	extend: 'NextThought.view.Window',
	requires: [
		'NextThought.view.form.fields.UserListField',
		'NextThought.util.Annotations',
		'NextThought.view.form.fields.UserTokenField'
	],
	alias : 'widget.share-window',


	width: 450,
	modal: true,
	dialog: true,

	constructor: function(){
		this.items = [
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
				items: { xtype: 'user-sharing-list'}
			}
		];

		this.dockedItems = [
			{
				dock: 'bottom',
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
					{xtype: 'button', text: 'Cancel', action: 'cancel', ui: 'secondary', handler: function(btn,e){
						btn.up('window').close();
						e.stopEvent();
					}},
					{xtype: 'button', text: 'Save', action: 'save'}
				]
			}
		];

		this.callParent(arguments);
	},


	initComponent: function(){
		var readOnly = this.isReadOnly(),
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
			buttons = this.dockedItems.last();
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
			this.setValue( SharingUtils.sharedWithToSharedInfo(this.record.get('sharedWith') || []));
		}
		else if (this.value) {
			this.setValue( SharingUtils.sharedWithForSharingInfo(this.value));
		}

		this.on('close', function(){
			this.dragMaskOff();
		});
	},

	show: function() {
		NextThought.getApplication().fireEvent('showshare', this);
		this.callParent(arguments);
	},

	hide: function() {
		NextThought.getApplication().fireEvent('hideshare', this);
		this.callParent(arguments);
	},

	afterRender: function(){
		this.callParent(arguments);

		var me = this;
		this.mon(this.down('user-sharing-list'), {
			scope: me,
			'new-tag': function(){ Ext.defer(me.updateLayout, 1, me); },
			'sync-height': function(){ Ext.defer(me.updateLayout, 1, me); }
		});

        // Update the window's ordering so that the modal mask is
        // properly placed behind it.
        this.toBack();
	},

	isReadOnly: function(){
		var refCount;
		if(!this.record){
			return false;
		}
		if(!this.record.isModifiable()){
			return true;
		}
		refCount = this.record.get('ReferencedByCount');
		return (this.record.children && this.record.children.length > 0) || (!Ext.isEmpty(refCount) && refCount > 0);
	},

	getValue: function(){
		return this.down('user-sharing-list').getValue();
	},

	setValue: function(v) {
		this.down('user-sharing-list').setValue(v);
	}
});
