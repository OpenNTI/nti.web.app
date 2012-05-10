Ext.define('NextThought.view.form.fields.ShareWithField', {
	extend: 'Ext.container.Container',
	alias: 'widget.sharewith',
	mixins: {
		labelable: 'Ext.form.Labelable',
		field: 'Ext.form.field.Field'
	},
	requires: [
		'NextThought.view.form.util.Token',
		'NextThought.view.form.fields.UserSearchInputField'
	],


	initComponent: function(){
		this.callParent(arguments);
		this.xtypes.push('field');

		this.selections = [];


		this.initField();

		this.inputField = this.add({xtype: 'usersearchinput'});
		this.inputField.on({
			scope: this,
			'select': this.select,
			'keydown': this.keyPress
		});
		this.setReadOnly(!!this.readOnly);
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
		ctrl.collapse();
		ctrl.setValue('');
		this.addSelection(selected[0]);
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


	addSelection: function(user){
		var m = this;
		if(m.containsToken(user)) {
			return;
		}

		m.selections.push(user);
		m.addToken(user);
	}

});
