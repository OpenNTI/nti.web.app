var Ext = require('extjs');
var FieldsSimpleTextField = require('../../../../common/form/fields/SimpleTextField');


module.exports = exports = Ext.define('NextThought.app.contacts.components.coderetrieval.Main', {
	extend: 'Ext.container.Container',
	alias: 'widget.coderetrieval-main-view',
	cls: 'coderetrieval-main-view',

	items: [
		{xtype: 'container', layout: 'anchor', cls: 'input-wrapper', items: [
			{xtype: 'box', name: 'codelabel', cls: 'label', html: getString('NextThought.view.account.coderetrieval.Main.code-label')},
			{xtype: 'simpletext', name: 'code', cls: 'input-box group-code', inputType: 'text', readOnly: true}
		]},
		{xtype: 'container', cls: 'submit', layout: {type: 'hbox', pack: 'end'}, items: [
			{xtype: 'button', ui: 'primary', scale: 'large', name: 'submit', text: getString('NextThought.view.account.coderetrieval.Main.ok'), handler: function(b) {
				console.log('foo');
				console.log(b.up('window'));
				b.up('window').close();
			}}
		]}
	],

	updateCode: function(c) {
		var code = this.down('[name=code]');
		code.update(c);
		code.el.selectable();
	}
});
