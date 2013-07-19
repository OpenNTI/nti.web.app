Ext.define('NextThought.view.menus.navigation.Collection',{
	extend: 'Ext.view.View',
	//disabling invoking this directly. Only use this through subclasses
	//alias: 'widget.navigation-collection',

	ui: 'navigation-collection',

	trackOver: true,
	overItemCls: 'selected',
	itemSelector: '.stratum.item',
	tpl: Ext.DomHelper.markup([
		{ cls: 'stratum collection-name', cn: [
			/*{ cls: 'settings' },*/
			'{name}',
			{cls:'count',html: '&nbsp;'}
		]},

		{ tag: 'tpl', 'for':'items', cn:['{menuitem}']}//,

//		{ cls: 'stratum drawer documents', cn:['Course Documents',{cls:'count',html: '&nbsp;'}] },
//		{ cls: 'stratum drawer dashboard', cn:['Dashboard',{cls:'count',html: '&nbsp;'}] }
	]),


	menuItemTpl: Ext.DomHelper.markup({
		cls: 'stratum item', 'data-qtip': '{title}', cn:[
			{ tag:'img', src: Ext.BLANK_IMAGE_URL, cls:'bookcover', style: {
				backgroundImage: 'url({icon})'
			}},
			{ cls: 'wrap', cn:[
				{ cls: 'title', html: '{title}' },
				{ cls: 'author', html: '{author}' },
				{tag:'tpl', 'if':'sample', cn:{
					cls:'sample', html:'Sample'
				}}
			]}
		]
	}),


	onClassExtended: function(cls, data) {
		data.menuItemTpl = data.menuItemTpl || cls.superclass.menuItemTpl || false;

		//merge in subclass's templates
		var tpl = this.prototype.tpl
				.replace('{menuitem}',data.menuItemTpl||'');

		if(!data.tpl){
			data.tpl = tpl;
		}
		//Allow the subclass to redefine the template and include the super's template
		else {
			data.tpl = data.tpl.replace('{super}',tpl);
		}
	},


	collectData: function(){
		var data = {items: this.callParent(arguments)};
		data.name = this.name;
		return data;
	},


	afterRender: function(){
		this.callParent(arguments);
		this.on('select','handleSelect',this);
	},


	handleSelect: function(selModel, record){
		selModel.deselect(record);

		Ext.menu.Manager.hideAll();
		this.up('menu').hide();
	}
});
