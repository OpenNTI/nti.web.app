Ext.define('NextThought.view.form.fields.ShareWithField', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.sharewith',
	mixins: {
		labelable: 'Ext.form.Labelable',
		field: 'Ext.form.field.Field'
	},
	requires: [
		'NextThought.view.form.fields.UserSearchInputField',
		'NextThought.view.form.util.Token'
	],

	layout: 'anchor',
	defaults: {anchor: '100%'},
	emptyText: 'Share with...',
	items: [
		{//contain the tokens
			xtype: 'container',
			cls: 'share-with-selected-tokens',
			layout: 'auto',
			border: false,
			margin: '0 0 10px 0'
		},{
			xtype: 'usersearchinput'
//			emptyText: this.emptyText,
//			allowBlank: true,
//			multiSelect: false,
//			enableKeyEvents: true
		}
	],

	initComponent: function(){
		this.callParent(arguments);
		this.xtypes.push('field');
		this.selections = [];
		this.inputField = this.down('usersearchinput');

		this.setReadOnly(!!this.readOnly);

		this.initField();
		this.inputField.on({
			scope: this,
			'select': this.select,
			'focus': this.doFocus,
			'blur': this.doBlur
		});
	},



	setReadOnly: function(readOnly){
		this.readOnly = readOnly;
//		if(readOnly) {
//			this.inputField.hide();
//		}
//		else {
//			this.inputField.show();
//		}

		this.items.get(0).items.each(function(token){
			token.setReadOnly(readOnly);
		}, this);
	},



	focus: function(){
		this.callParent(arguments);
		this.down('usersearchinput').focus();
	},

	setValue: function(value){
		var me = this;
		me.value = value;
		me.checkChange();
		me.initValue();
		return me;
	},

	initValue: function(){
		var m = this;
		UserRepository.prefetchUser(m.value, function(users){
			Ext.each(users, function(u){
				m.addSelection(u);
			});
		});
	},

	isValid: function() {
		return this.allowBlank || this.selections.length>0;
	},

	getValue: function(){
		var m = this, r = [];
		Ext.each(m.selections, function(u){
			r.push(u.get('Username'));
		});
		return r;
	},

	doBlur: function(/*ctrl*/) {},

	doFocus: function(/*ctrl*/) {},

	select: function(ctrl, selected) {
		ctrl.collapse();
		ctrl.setValue('');
		this.addSelection(selected[0]);
	},

	containsToken: function(model){
		var id = model.getId(), found = false;
		Ext.each(
			this.selections,
			function(o){
				return !(found=(o.getId()===id));
			},
			this
		);
		return found;
	},

	removeToken: function(token, model){
		token.destroy();

		var id = model.getId(),
			s = [];

		Ext.each(this.selections, function(o){
			if(o.getId()===id) {
				return;
			}

			s.push(o);
		});

		this.selections = s;
		this.doComponentLayout();
	},

	addToken: function(model){
		var c = this.items.get(0),
			text = model.get('realname') || model.get('Username');

		c.add({ xtype: 'token', readOnly: this.readOnly, model: model, text: text,
				listeners: {scope: this, click: this.removeToken}});
	},

	addSelection: function(user){
		var m = this;
		if(m.containsToken(user)) {
			return;
		}

		m.selections.push(user);
		m.addToken(user);
	}
});
