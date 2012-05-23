Ext.define('NextThought.view.form.fields.ShareWithField', {
	extend: 'Ext.container.Container',
	alias: 'widget.sharewith',
	mixins: {
		labelable: 'Ext.form.Labelable',
		field: 'Ext.form.field.Field'
	},
	cls: 'share-with-field',
	autoEl: 'div',
	layout: 'auto',
	ui: 'sharewith',
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
				var o = this.inputEl;
				var b = this.bodyEl;
				this.bodyEl = this.inputEl = me.getEl();
				this.callParent();
				this.inputEl = o;
				this.bodyEl = b;
			}
		}});
		me.inputField.xon({
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
		me.el.on('click',function(){
			me.inputField.focus();
		});
	},


	setReadOnly: function(readOnly){
		this.readOnly = readOnly;
		if(readOnly) {
			this.inputField.hide();
		}
		else {
			this.inputField.show();
		}

		this.items.each(function(token){ token.setReadOnly(readOnly); },this);
	},


	focus: function(){
		this.callParent(arguments);
//		this.down('usersearchinput').focus();
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
		if (m.value) {
			UserRepository.prefetchUser(m.value, function(users){
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
				return !(found=(o.getId()===id));
			},
			this
		);
		return found;
	},


	removeLastToken: function(){
		if (this.selections.length > 0) {
			var lastSelection = this.selections.last();
			this.down('[modelId='+lastSelection.getId()+']').destroy();
			this.selections = this.selections.splice(0, this.selections.length -1);
		}
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
			text = model.get('realname') || model.get('Username');

		this.insert(c.length-1,//indexOf(saerchbox)-1
			{
				xtype: 'token',
				readOnly: this.readOnly,
				model: model,
				modelId: model.getId(),
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
