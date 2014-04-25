Ext.define('NextThought.view.form.fields.SearchAdvancedOptions', {
	extend: 'Ext.menu.Menu',
	alias: 'widget.search-advanced-menu',
	requires: [
		'NextThought.view.menus.LabeledSeparator',
		'NextThought.model.Hit'
	],

	minWidth: 200,

	defaults: {
		ui: 'nt-menuitem',
		xtype: 'menucheckitem',
		plain: true,
		listeners: {
			'beforecheckchange': function(item, checked) { return checked || item.allowUncheck !== false; }
		}
	},

	items: [
		{
			cls: 'label',
			xtype: 'menuitem',
			text: getString('NextThought.view.form.fields.SearchAdvancedOptions.label'),
			ui: 'nt',
			plain: true,
			canActivate: false,
			focusable: false,
			hideOnClick: false
		},
		{
			cls: 'type-filter everything',
			text: getString('NextThought.view.form.fields.SearchAdvancedOptions.everything'),
			checked: true,
			allowUncheck: false,
			isEverything: true
		},
		{ cls: 'type-filter books', text: getString('NextThought.view.form.fields.SearchAdvancedOptions.books'), model: 'bookcontent' },
		{ cls: 'type-filter video', text: getString('NextThought.view.form.fields.SearchAdvancedOptions.videos'), model: 'videotranscript' },
		{ cls: 'type-filter highlight', text: getString('NextThought.view.form.fields.SearchAdvancedOptions.highlights'), model: 'highlight' },
		{ cls: 'type-filter note', text: getString('NextThought.view.form.fields.SearchAdvancedOptions.notes'), model: 'note' },
		{
			cls: 'type-filter post',
			text: getString('NextThought.view.form.fields.SearchAdvancedOptions.thoughts'),
			model: ['forums.personalblogcomment', 'forums.personalblogentrypost']
		},
		{
			cls: 'type-filter forums',
			text: getString('NextThought.view.form.fields.SearchAdvancedOptions.forums'),
			model: ['forums.communityheadlinepost', 'forums.generalforumcomment']
		},
		{ cls: 'type-filter chat', text: getString('NextThought.view.form.fields.SearchAdvancedOptions.chats'), model: 'messageinfo'},
		{ xtype: 'labeledseparator', text: getString('NextThought.view.form.fields.SearchAdvancedOptions.return'), hidden: true },
    //		{ cls: 'return-type', group: 'return-type', hideOnClick: false, text: 'Exact Matches', checked: true },
		{
			cls: 'return-type',
			group: 'return-type',
			hideOnClick: false,
			text: getString('NextThought.view.form.fields.SearchAdvancedOptions.partial'),
			doPartialSearch: true,
			hidden: true
		}
	],

	initComponent: function() {
		var me = this;
		this.callParent(arguments);

		this.filterChanged = false;
		this.on('click', this.handleClick, this);
		this.on('mouseleave', function(e) {
			me.hide();
		});
		this.fireEvent('changed', this);//set the intial filter
	},

	handleClick: function(menu, item, e) {
		if (!item) {return;}

		this.filterChanged = true;

		if (item.checked) {
			if (item.isEverything) {
				Ext.each(this.query('[model]'), function(o) {
					o.setChecked(false, true);
				});
			}
			else if (item.is('[model]')) {
				this.query('[isEverything]').first().setChecked(false, true);
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
