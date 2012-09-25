//styled in _avatar-picker.scss
Ext.define('NextThought.view.account.settings.AvatarPicker',{
	extend: 'Ext.view.View',

	alias: 'widget.avatar-picker',

	requires: [
		'Ext.data.Store'
	],

	cls: 'avatar-picker',
	singleSelect: true,
	allowDeselect: false,
	autoScroll: true,
	overItemCls: 'over',
	itemSelector: 'div.item-wrap',

	maxHeight: 140,

	tpl: Ext.DomHelper.markup(
		{tag:'tpl', 'for':'.', cn: [
			{cls:'item-wrap', cn:[{
				cls:'item',
				tag: 'img',
				src: '{url}'
			}]
		}]
	}),


	initComponent: function(){

		var u = $AppConfig.userObject,
			c = u.get('AvatarURLChoices'),
			data = [];

		Ext.each(c,function(url){ data.push({url:url}); });

		this.store = new Ext.data.Store({ idProperty: 'url', fields:['url'], data : data });
		this.callParent(arguments);
	},

	afterRender: function(){
		this.callParent(arguments);
		var v = this.store.findExact('url',$AppConfig.userObject.get('avatarURL'));
		if(v>=0){
			this.getSelectionModel().select(v);
		}
	}

});
