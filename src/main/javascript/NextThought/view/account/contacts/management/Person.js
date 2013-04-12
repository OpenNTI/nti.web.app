Ext.define('NextThought.view.account.contacts.management.Person',{
	extend: 'Ext.container.Container',
	alias: 'widget.person-card',
	requires: [
		'NextThought.view.account.contacts.management.GroupList'
	],
	mixins: {
		enableProfiles: 'NextThought.mixins.ProfileLinks'
	},
	layout: 'auto',
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
	},{id: '{id}-body', cls:'person-card-body', html: '{%this.renderContainer(out,values)%}'}]),


	childEls: ['body'],

	getTargetEl: function () {
		return this.body;
	},

	renderSelectors: {
		avatar: '.contact-card img',
		name: '.contact-card .name'
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

		if(!this.hideGroups){
			this.groupsList = this.add({xtype: 'management-group-list', allowSelect: true});
			this.groupsList.block(this.user.get('Username'));
			if(this.isContact){
				this.groupsList.setUser(this.user);
			}
		}
//		else if(this.isContact){
			//show nib
//		}
	},


	afterRender: function(){
		this.callParent(arguments);
		if(this.user){
			this.enableProfileClicks(this.avatar,this.name);
		}
	},

	getSelected: function(){
		var l = this.groupsList;
		return {
			user: this.user.getId(),
			groups: l? l.getSelected() : []
		};
	}
});
