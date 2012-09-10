Ext.define('NextThought.view.account.contacts.management.Person',{
	extend: 'Ext.container.Container',
	alias: 'widget.person-card',
	requires: [
		'NextThought.layout.component.TemplatedContainer',
		'NextThought.view.account.contacts.management.GroupList'
	],
	layout: 'auto',
	componentLayout: 'templated-container',
	cls: 'person-card',

	renderTpl: Ext.DomHelper.markup([{
		cls:'card-wrap',
		cn:[{
			cls:'contact-card',
			cn: [
				{tag: 'img', src: '{avatarURL}'},
				{
					cls: 'text-wrap',
					cn: [
						{cls: 'name', html: '{name}'},
						{cls: 'affiliation', html: '{affiliation-dontshowthis}'}
					]
				}
			]
		}]
	},{id: '{id}-body', html: '{%this.renderContainer(out,values)%}'}]),

	items: [
		{xtype: 'management-group-list', allowSelect: true}
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
			affiliation: this.user.get('affiliation')
		});

		this.addEvents({'groups-changed':true});
		this.enableBubble(['groups-changed']);

		this.groupsList = this.down('management-group-list');
		this.groupsList.block(this.user.get('Username'));
	},


	getSelected: function(){
		return {
			user: this.user.getId(),
			groups: this.groupsList.getSelected()
		};
	}
});
