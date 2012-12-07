Ext.define('NextThought.view.account.codecreation.Main',{
    extend: 'Ext.container.Container',
    alias: 'widget.codecreation-main-view',
    requires: [
		'NextThought.view.form.fields.SimpleTextField'
    ],

    cls: 'codecreation-main-view',

	items: [
		{xtype: 'container', layout: 'anchor', cls: 'input-wrapper', items:[
			{xtype: 'box', name: 'namelabel', cls: 'label',  html: 'Group Name'},
            {xtype: 'simpletext', name: 'groupname', cls: 'input-box group-name', inputType: 'text', placeholder:'Choose a name for your group...',
			 allowBlank: false}
        ]},
		{xtype: 'container', layout: 'anchor', cls: 'input-wrapper', items:[
			{xtype: 'box', name: 'codelabel', cls: 'label', hidden: true, html: 'Group Code'},
            //{xtype: 'box', name: 'code', cls: 'group-code', hidden: true},
			{xtype: 'simpletext', name: 'code', cls: 'input-box group-code', inputType: 'text', readOnly: true, hidden: true}
        ]},
		{xtype: 'box', hidden: true, name:'error', autoEl: {cls: 'error-box', tag:'div',
            cn:[
                {cls: 'error-desc'}
            ]}
        },
        {xtype: 'container', cls: 'submit',  layout:{type: 'hbox', pack: 'end'}, items: [
            {xtype: 'button', ui: 'secondary', scale: 'large', name: 'cancel', text:'Cancel', handler: function(b){
                b.up('window').close();
            }},
			{xtype: 'button',  ui: 'primary', scale: 'large', name: 'submit', text: 'Create', disabled: true, minWidth: 96}
        ]}
    ],

	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.down('[name=groupname]'), 'changed', this.changed, this);
		this.mon(this.down('[name=submit]'), 'click', this.clearError, this);
	},

	changed: function(val, t){
		var empty = Ext.isEmpty(val),
			btn = this.query('[name=submit]',this)[0];
		btn.setDisabled(empty);
		if(Ext.isEmpty(val)){
			t.addClass('empty');
		}
		else{
			t.removeCls('empty');
		}
	},

	setGroupCode: function(c){
		var code = this.query('[name=code]')[0];
		code.update(c || null);
		code.setVisible(!!c);
		code.el.selectable();
		this.query('[name=codelabel]')[0].setVisible(!!c);
		this.query('[name=groupname]')[0].disable(true);
		this.query('[name=submit]')[0].setText('OK');
		this.query('[name=cancel]')[0].setVisible(false);
	},

	getGroupName: function(){
		var name = this.down('[name=groupname]').getValue();
		return name ? name.trim() : name;
	},

	showError: function(errorText){
		var box = this.down('[name=error]');

		errorText = errorText || 'An unknown error occurred. Please try again.';

        //make main error field show up
        box.el.down('.error-desc').update(errorText);
        box.show();
	},


	clearError: function(){
		var box = this.down('[name=error]');
		box.hide();
	}

});
