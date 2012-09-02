Ext.define('NextThought.view.form.fields.UserListField', {
	extend: 'Ext.container.Container',
	alias: 'widget.user-list',
	mixins: {
		labelable: 'Ext.form.Labelable',
		field: 'Ext.form.field.Field'
	},
	cls: 'user-list-field',
	autoEl: 'div',
	layout: 'auto',
	ui: 'user-list',
	requires: [
		'NextThought.view.form.util.Token',
		'NextThought.view.form.fields.UserSearchInputField'
	],


	initComponent: function(){
		var me = this;
		me.callParent(arguments);
		me.xtypes.push('field');

		me.selections = [];


		me.initField();

		me.inputField = me.add({xtype: 'usersearchinput', xhooks: {
			alignPicker: function(){
				var o = this.inputEl,
					b = this.bodyEl;
				this.bodyEl = this.inputEl = me.getEl();
				this.callParent();
				this.inputEl = o;
				this.bodyEl = b;
			}
		}});
		me.mon(me.inputField,{
			scope: me,
			'select': me.select,
			'keydown': me.keyPress
		});

		me.setReadOnly(!!me.readOnly);
	},


	afterRender: function(){
		var me = this;
		me.callParent();
		me.inputField.ref = me.el;
		me.mon(me.el,'click',function(){ me.inputField.focus(); });
	},


	setReadOnly: function(readOnly){
		this.readOnly = readOnly;
		this.inputField[readOnly?'hide':'show']();
		this.items.each(function(token){ token.setReadOnly(readOnly); },this);
	},


	focus: function(){
		this.callParent(arguments);
//		this.down('usersearchinput').focus();
	},


	setValue: function(value){
		var me = this, i=(value?value.length:0)-1;
		me.value = value;
		//trim empty's...
		for(i;i>=0;i--){if(!value[i]){value.splice(i,1);}}
		this.clearTokens();
		me.checkChange();
		me.initValue();
		return me;
	},


	initValue: function(){
		var m = this;
		if (m.value && m.value.length > 0) {
			UserRepository.getUser(m.value, function(users){
				Ext.each(users, function(u){
					m.addSelection(u);
				});
			});
		}
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


	select: function(ctrl, selected) {
		this.addSelection(selected);
	},


	keyPress: function(field, event) {
		if (event.keyCode===event.BACKSPACE && !field.getValue()){
			this.removeLastToken();
		}
	},


	containsToken: function(model){
		var id = model.getId(), found = false;
		Ext.each(
			this.selections,
			function(o){
				found=(o.getId()===id);
				return !found;
			},
			this
		);
		return found;
	},


	removeLastToken: function(){
		if (this.selections.length > 0) {
			var lastSelection = this.selections.last();
			this.down('[modelId='+IdCache.getIdentifier(lastSelection.getId())+']').destroy();
			this.selections = this.selections.splice(0, this.selections.length -1);
		}
	},


	clearTokens: function(){
		Ext.each(this.query('token'), function(t){
			this.removeToken(t, t.model);
		}, this);
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
		var c = this.items,
			text = model.getName();

		this.insert(c.length-1,//indexOf(saerchbox)-1
			{
				xtype: 'token',
				readOnly: this.readOnly,
				model: model,
				modelId: IdCache.getIdentifier(model.getId()),
				text: text,
				listeners: {
					scope: this,
					click: this.removeToken
				}
			});
	},


	addSelection: function(users){
		var m = this;

		if(!Ext.isArray(users)){
			users = [users];
		}

		Ext.each(users,function(user){
			if(m.containsToken(user)) { return; }
			m.selections.push(user);
			m.addToken(user);
		});
	}

});
