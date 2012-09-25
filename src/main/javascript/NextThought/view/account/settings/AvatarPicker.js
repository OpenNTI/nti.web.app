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

		var u = this.user = (this.user || $AppConfig.userObject),
			c = u.get('AvatarURLChoices'),
			data = [];

		Ext.each(c,function(url){ data.push({url:url}); });

		this.store = new Ext.data.Store({ idProperty: 'url', fields:['url'], data : data });

		this.callParent(arguments);

		this.on('select',this.onSelect, this);
	},

	afterRender: function(){
		this.callParent(arguments);
		this.selectCurrent();
		var n = this.getSelectedNodes().first();
		if(n){
			Ext.fly(n).scrollIntoView(this.el);
		}
	},


	selectCurrent: function(){
		var v = this.store.findExact('url',this.user.get('avatarURL'));
		if(v>=0){
			this.getSelectionModel().select(v);
		}
	},



	onSelect: function(view,record){
		var me = this,
			url = record.get('url'),
			el = me.el,
			u = me.user,
			old = u.get('avatarURL');

		if(url === old){
			return;
		}

		el.mask('Saving...');
		u.saveField('avatarURL',url,function good(){
			el.unmask();
		},function bad(){
			me.selectCurrent();
			el.unmask();
			alert('Oops!\nSomething went wrong.');
		});
	}

});
