Ext.define('NextThought.view.form.fields.SearchAdvancedOptions',{
	extend: 'Ext.menu.Menu',
	alias: 'widget.search-advanced-menu',
	requires: [
		'NextThought.view.menus.LabeledSeparator',
		'NextThought.model.Hit'
	],

	ui: 'nt',
	plain: true,
	showSeparator: false,
	shadow: false,
	frame: false,
	border: false,
	hideMode: 'display',
	minWidth: 200,

	defaults: {
		ui: 'nt-menuitem',
		xtype: 'menucheckitem',
		plain: true,
		listeners: {
			'beforecheckchange':function(item, checked){ return checked || item.allowUncheck!==false; }
		}
	},

	items: [
		{ cls: 'label', xtype: 'menuitem', text: 'Search for', ui: 'nt', plain: true, canActivate: false, focusable: false, hideOnClick: false},
		{ cls: 'type-filter everything', text: 'Everything', checked: true, allowUncheck: false, isEverything: true},
		{ cls: 'type-filter books', text: 'Books', model: 'bookcontent' },
		{ cls: 'type-filter highlight', text: 'Highlights', model: 'highlight' },
		{ cls: 'type-filter note', text: 'Notes', model: 'note' },
		{ cls: 'type-filter post', text: 'Thoughts', model: ['forums.personalblogcomment', 'forums.personalblogcomment']},
		{ cls: 'type-filter chat', text: 'Chats', model: 'messageinfo'},
		{ xtype: 'labeledseparator', text: 'Return', hidden: true },
//		{ cls: 'return-type', group: 'return-type', hideOnClick: false, text: 'Exact Matches', checked: true },
		{ cls: 'return-type', group: 'return-type', hideOnClick: false, text: 'Partial Matches', doPartialSearch: true, hidden: true }
	],

	initComponent: function(){
		var me = this;
		this.callParent(arguments);

		this.filterChanged = false;
		this.on('click',this.handleClick,this);
		this.on('mouseleave', function(e){
			me.hide();
		});
		this.fireEvent('changed', this);//set the intial filter
	},

	handleClick: function(menu, item, e){
		if(!item){return;}

		this.filterChanged = true;

		if(item.checked){
			if(item.isEverything){
				Ext.each(this.query('[model]'),function(o){
					o.setChecked(false,true);
				});
			}
			else if(item.is('[model]')){
				this.query('[isEverything]').first().setChecked(false,true);
			}
		}

	},

	hide: function() {
		if (this.filterChanged) {
			this.fireEvent('changed', this);
			this.filterChanged = false;
		}
		this.callParent(arguments);
	}

});
