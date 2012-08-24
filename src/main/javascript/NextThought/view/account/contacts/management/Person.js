Ext.define('NextThought.view.account.contacts.management.Person',{
	extend: 'Ext.container.Container',
	alias: 'widget.add-person-card',
	requires: [
		'NextThought.layout.component.TemplatedContainer',
		'NextThought.view.account.contacts.management.GroupList'
	],
	layout: 'auto',
	componentLayout: 'templated-container',
	cls: 'add-person-card',
	renderTpl: [
		'<div class="contact-card-wrapper">',
		'<div class="contact-card">',
			'<img class="nib" src="{blank}" alt="Unselect this contact">',
			'<img src="{avatarURL}">',
			'<div class="card-body">',
				'<div class="name">{name}</div>',
				'<div class="status">{status}</div>',
			'</div>',
		'</div>',
		'</div>',
		'<div id="{id}-body">',
			'{%this.renderContainer(out,values)%}',
		'</div>'
	],
	items: [
		{xtype: 'management-group-list', allowSelect: true, hidden: true}
	],

	childEls: ['body'],

	getTargetEl: function () {
		return this.body;
	},

	initComponent: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData||{},{
			blank: Ext.BLANK_IMAGE_URL,
			avatarURL: this.user.get('avatarURL'),
			name: this.user.getName(),
			status: this.user.get('status')
		});

		this.groupsList = this.down('management-group-list');
	},


	getSelected: function(){
		return {
			user: this.user.getId(),
			groups: this.groupsList.getSelected()
		};
	},


	afterRender: function(){
		this.callParent(arguments);
		this.getEl().addClsOnOver('selection-item-over');
		this.getEl().down('.contact-card').on('click', this.toggle, this);
		this.getEl().down('.nib').on('click', this.destroy, this);
	},


	toggle: function(){
		if(this.groupsList.isVisible()){
			this.collapse();
			return;
		}
		this.expand();
	},


	collapse: function(){
		this.removeCls('expanded');
		this.groupsList.hide();
	},

	expand: function(){
		this.fireEvent('beforeexpand',this);
		this.addCls('expanded');
		this.groupsList.show();
	}
});
