Ext.define('NextThought.view.account.coderetrieval.Main',{
    extend: 'Ext.container.Container',
    alias: 'widget.coderetrieval-main-view',
    requires: [
		'NextThought.view.form.fields.SimpleTextField'
    ],

    cls: 'coderetrieval-main-view',

	items: [
		{xtype: 'container', layout: 'anchor', cls: 'input-wrapper', items:[
			{xtype: 'box', name: 'codelabel', cls: 'label', html: 'Group Code'},
			{xtype: 'simpletext', name: 'code', cls: 'input-box group-code', inputType: 'text', readOnly: true}
        ]},
        {xtype: 'container', cls: 'submit',  layout:{type: 'hbox', pack: 'end'}, items: [
			{xtype: 'button', ui: 'primary', scale: 'large', name: 'submit', text:'OK', handler: function(b){
				console.log('foo');
				console.log(b.up('window'));
                b.up('window').close();
            }}
        ]}
    ],

	updateCode: function(c){
		this.down('[name=code]').update(c);
	}
});
