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


	initComponent: function(){
		this.enableBubble('expand');
		return this.callParent(arguments);
	},


	getBubbleTarget : function() {
		return this.ownerCt;
	},


	hide: function(){
		if(this.isHidden()){
			return;
		}

		var ct = this.ownerCt,
			r,
			width = this.width,
			w, x;

		if(Ext.isNumber(ct.minWidth)){
			ct.minWidth -= width;
		}

		if(ct.rendered) {
			w = ct.getWidth();
			x = ct.getPosition()[0];
			ct.setWidth(w-width);
			ct.setPosition(x+width);
		}


		ct.addCls('no-gutter');
		ct.updateLayout();
		r = this.callParent();
		this.fireEvent('expand',ct,-width);
		return r;
	},


	show: function(){
		if(!this.isHidden()){
			return;
		}

		var ct = this.ownerCt,
			r,
			width = this.width,
			w, x;

		if(Ext.isNumber(ct.minWidth)){
			ct.minWidth += width;
		}

		if(ct.rendered) {
			w = ct.getWidth();
			x = ct.getPosition()[0];
			ct.setWidth(w+width);
			ct.setPosition(x-width);
		}


		ct.removeCls('no-gutter');
		ct.updateLayout();
		r = this.callParent();
		this.fireEvent('expand',ct,width);
		return r;
	},

	setChatState: function(state, username){
		Ext.each(this.query('chat-gutter-entry') || [], function(g){
			if( g.user.getName() === username ){ g.setStatus(state); }
		});
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
