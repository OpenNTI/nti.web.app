Ext.define('NextThought.view.chat.Gutter',{
	extend: 'Ext.container.Container',
	alias: 'widget.chat-gutter',

	requires: [
		'NextThought.view.chat.GutterEntry'
	],

	width: 170,
	ui: 'chat-window',
	cls: 'gutter',
	autoScroll: true,

	defaults: {
		xtype: 'chat-gutter-entry',
		ui: 'chat-window'
	},


	hide: function(){
		if(this.isHidden()){
			return;
		}

		var ct = this.ownerCt,
			r = this.callParent(),
			width = this.width,
			w, x;

		if(ct.rendered) {
			w = ct.getWidth();
			x = ct.getPosition()[0];
			ct.setWidth(w-width);
			ct.setPosition(x+width);
		}

		if(Ext.isNumber(ct.minWidth)){
			ct.minWidth -= width;
		}

		ct.addCls('no-gutter');
		ct.doLayout();
		return r;
	},


	show: function(){
		if(!this.isHidden()){
			return;
		}

		var ct = this.ownerCt,
			r = this.callParent(),
			width = this.width,
			w, x;

		if(ct.rendered) {
			w = ct.getWidth();
			x = ct.getPosition()[0];
			ct.setWidth(w+width);
			ct.setPosition(x-width);
		}

		if(Ext.isNumber(ct.minWidth)){
			ct.minWidth += width;
		}

		ct.removeCls('no-gutter');
		ct.doLayout();
		return r;
	},


	updateList: function(users){
		var list = [];

		Ext.each(users,function(u){ if(!isMe(u)){
			list.push({ user: u }); } });

		this.hide();
		if(list.length > 1){
			this.show();
		}

		this.removeAll(true);
		this.add(list);
	}
});
