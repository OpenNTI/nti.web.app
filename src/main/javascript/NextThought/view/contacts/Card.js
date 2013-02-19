Ext.define('NextThought.view.contacts.Card',{
	extend: 'Ext.Component',
	alias: 'widget.contacts-tabs-card',
	mixins: {
		profileLink: 'NextThought.mixins.ProfileLinks'
	},

	ui: 'contacts-tabs-card',
	cls: 'contact-card-container',

	renderTpl: Ext.DomHelper.markup({
		cls: 'contact-card',
		cn: [{
			cls: 'avatar', style: {backgroundImage: 'url({avatarURL});'}
		},{
			cls: 'meta',
			cn: [
				{ cls: 'name', html: '{name}', 'data-field':'name'},
				{ cls: 'add-to-contacts', html: 'ADD'},
				{ tag: 'tpl', 'if':'email', cn:[
					{ cls: 'email', html: '{email}', 'data-field':'email' }]},

				{ tag: 'tpl', 'if':'role || affiliation', cn:[
				{ cls: 'composite-line', cn: [
					{ tag: 'span', html:'{role}', 'data-field':'role'},
					{ tag: 'tpl', 'if':'role && affiliation', cn:[{tag: 'span', cls: 'separator', html:' at '}]},
					{ tag: 'span', html:'{affiliation}', 'data-field':'affiliation' }]}]},

				{ tag: 'tpl', 'if':'location', cn:[
					{ cls: 'location', html:'{location}', 'data-field':'location' }]},

//				{ tag: 'tpl', 'if':'home_page', cn:[
//					{ cls: 'home-page', 'data-field':'home_page', cn:[
//						{ tag: 'a', target: '_blank', html: '{home_page}', href: '{home_page}', 'data-field':'home_page' }]}]},

				{ cls: 'actions', cn: [
					{ cls: 'chat', html: 'Chat'}
				]}
			]
		}]
	}),


	beforeRender: function(){
		var u = this.record;
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData||{}, u.getData() );
		this.renderData.name = u.getName();
	},

	afterRender: function(){
		this.callParent(arguments);

		this.enableProfileClicks(this.el, this.el.down('.avatar'), this.el.down('.name'));
	}
});
