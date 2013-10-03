Ext.define('NextThought.view.form.fields.UserSearchInputField', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.usersearchinput',
	requires: [
		'NextThought.view.menus.Group'
	],

	width: '100%',
	allowBlank: true,
	displayField: 'realname',
	typeAhead: false,
	hideLabel: true,
	multiSelect: false,
	enableKeyEvents: true,
	minChars: 1,
	valueField: 'Username',
	emptyText: 'Search...',
	cls: 'user-search-field',
	trigger1Cls: 'hidden',
	trigger2Cls: 'x-menu',
	pickerOffset: [0, 5],

	listConfig: {
		constrainTo: Ext.getBody(),
		loadingHeight: 140,
		loadingText: 'Searching...',
		loadingCls: 'search',
		minHeight: 0,
		maxHeight: 300,
		ui: 'nt',
		plain: true,
		shadow: false,
		frame: false,
		border: false,
		cls: 'x-menu',
		baseCls: 'x-menu',
		itemCls: 'x-menu-item contact-card',
		emptyText: '<div class="x-menu-item">No results</div>',
		itemTpl: new Ext.XTemplate(
				'<img class="nib" src="', Ext.BLANK_IMAGE_URL, '">',
				'<div style="background-image: url({[this.getIcon(values)]})" class="avatar {[this.getType(values)]}"></div>',
				'<div class="card-body {[this.getType(values)]}">',
					'<div class="name">{displayName}</div>',
					'<div class="status">{affiliation-dontshowthis}{[this.getDisplayTypeValue(values)]}</div>',
			'</div>',
		{
			getIcon: function(model) {
				var t = this.getType(model);
				return t === 'person' ? model.avatarURL : 'inherit';
			},

			getType: function(modelData) {
				return NextThought.model.UserSearch.getType(modelData);
			},

			getDisplayTypeValue: function(model) {
				var t = this.getType(model),
					map = {
						'list': 'List',
						'group': 'Group',
						'public': 'Community',
						'person': 'User'
					};
				return map[t];
			}
		}),
		xhooks: {
			initComponent: function() {
				this.callParent(arguments);
				this.itemSelector = '.contact-card';
			}
		}
	},


	initComponent: function() {
		var me = this;
		me.store = Ext.getStore('UserSearch');
		me.callParent(arguments);
		me.menu = Ext.widget('group-menu');

		me.menu.on('selected', function(record, item) {
			me.fireEvent('select', me, [record]);
		});

		//handle some basic behavior accross the board
		me.on('select', function() {
			me.setValue('', false);
			me.collapse();
			me.focus();
		});
	},


	afterRender: function() {
		this.callParent();

		var w, me = this;
		this.mon(this.inputEl, {
			'mousedown': function(e) { e.dragTracked = true; },
			'keydown': function(e) {if (e.getKey() !== e.ESC) {e.stopPropagation();}}
		});

		w = this.el.getWidth() + 'px';

		this.triggerEl.first().parent().addCls('hidden');

		Ext.defer(function() {
			me.inputEl.setStyle({width: w});
		}, 1);
	},


	reset: function() {
		this.menu.hide();
		this.collapse();
		this.setValue('', false);
	},


	destroy: function() {
		this.menu.destroy();
		delete this.menu;
		this.callParent();
	},


	getRefEl: function() {
		return this.ref || this.getEl();
	},


	onTrigger2Click: function() {
		var e = this.getRefEl();
		if (!this.menu.isVisible()) {
			this.menu.setWidth(e.getWidth());
			this.menu.showBy(e, 'tl-bl?', [0, 5]);
		}
		else {
			this.menu.hide();
		}
	}
});
