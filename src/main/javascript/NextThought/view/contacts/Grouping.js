Ext.define('NextThought.view.contacts.Grouping',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.contacts-tabs-grouping',
	requires: [
		'NextThought.view.tool.Action',
		'NextThought.view.contacts.Card'
	],
	defaultType: 'contacts-tabs-card',

	mixins: {
		userContainer: 'NextThought.mixins.UserContainer'
	},

	ui: 'contact-grouping',
	cls: 'contact-grouping',

	width: 700,
	plain: true,
	frame: false,
	border: false,
	tools:[{
		chat: 1,
		xtype:'nti-tool-action',
		iconCls: 'chat',
		label: 'Group Chat'
	},{
		settings: 1,
		xtype:'nti-tool-action',
		iconCls: 'settings',
		label: 'Settings'
	}],

	titleTpl: Ext.DomHelper.createTemplate(['{0} ',{tag:'span',html:'{1}'}]),

	showMoreTpl: Ext.DomHelper.createTemplate({
		cls: 'show-more',
		cn: [
			{cls:'dots',cn:[{},{},{}]},
			{html: '{count} More'}
		]
	}),


	initComponent: function(){
		var chatTool;
		this.callParent(arguments);
		this.setTitle(this.title);
		this.setupActions(this.associatedGroup);

		chatTool = this.down('nti-tool-action[chat]');
		chatTool.assignExtAction(this.groupChatAction);
		if(this.groupChatAction.isHidden()){
			chatTool.hide();
		}


		this.mon(this.down('nti-tool-action[settings]'),'click',this.showMenu,this);
		this.on('destroy',this.cleanupActions,this);

		this.on('add',this.updateStuff,this,{buffer:100});
		this.on('remove',this.updateStuff,this,{buffer:100});
		this.mixins.userContainer.constructor.apply(this, arguments);
	},


	showMenu: function(e,cmp){
		this.menu.showBy(cmp.getEl(),'tr-br?',[0,0]);
	},


	setTitle: function(newTitle){
		if(!this.rendered){
			this.on('afterrender',Ext.bind(this.setTitle,this,[newTitle]));
		} else {
			this.initialConfig.title = newTitle || this.initialConfig.title;
			newTitle = this.titleTpl.apply([newTitle||this.initialConfig.title,this.items.getCount()]);
		}
		return this.callParent([newTitle]);
	},


	getTitle: function(){ return this.initialConfig.title; },


	createUserComponent: function(i){ return {record: i}; },


	getModelObject: function(){
		return this.associatedGroup;
	},


	getUserListFieldName: function(){
		return 'friends';
	},


	updateStuff:function(){
		this.setTitle();
		this.updateMore();
		this.updateChatState(this.associatedGroup);
	},


	updateMore: function(){
		if(!this.rendered){
			this.on('afterrender',this.updateMore,this,{single:true});
			return;
		}
		if(this.moreEl){
			this.moreEl.remove();
		}

		var c = this.items.getCount() - 14,
			layout = this.layout||{},
			el = layout.clearEl;
		if(c > 0 && (!this.el || !this.el.hasCls('show-all'))){
			this.moreEl = this.showMoreTpl[el?'insertBefore':'append'](el||this.getTargetEl(),{count:c},true);
			this.moreEl.on('click', this.showAll, this);
		}
	},


	showAll: function(){
		this.el.addCls('show-all');
		this.updateMore();
		this.updateLayout();
	}

});
