Ext.define('NextThought.view.library.Branding',{
	extend: 'Ext.Component',
	alias: 'widget.library-branding-box',

	ui: 'branding',
	cls: 'branding',

	renderTpl: Ext.DomHelper.markup([
		{cls:'logo', 'data-qtip':'{logo-alt-text}'},
		{cls:'box',cn:[
			{ cls: 'flourish1' },
			{ cls: 'flourish2' },
			{ cls:'title', html:'{title}' },
			{ cls:'message', html:'{message}', cn:{ cls:'ellipsis', cn:[{},{},{}] }}
		]}
	]),


	beforeRender: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData||{},{
			'logo-alt-text': getString('library:branding logo-alt-text'),
			'title': getString('library:branding message-title'),
			'message': getString('library:branding message')
		});
	}
});
