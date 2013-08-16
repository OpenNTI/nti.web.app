Ext.define('NextThought.view.contacts.Grouping', {
	extend: 'NextThought.view.BoundPanel',
	alias: 'widget.contacts-tabs-grouping',
	requires: [
		'NextThought.layout.component.Natural',
		'NextThought.view.tool.Action',
		'NextThought.view.contacts.Card'
	],
	defaultType: 'contacts-tabs-card',

	mixins: {
		userContainer: 'NextThought.mixins.UserContainer'
	},

	ui: 'contact-grouping',
	cls: 'contact-grouping',

	layout: 'auto',
	componentLayout: 'natural',

	width: 700,
	plain: true,
	frame: false,
	border: false,
	tools: [
		{
			chat: 1,
			xtype: 'nti-tool-action',
			iconCls: 'chat',
			label: 'Group Chat'
		},
		{
			settings: 1,
			xtype: 'nti-tool-action',
			iconCls: 'settings',
			label: 'Settings'
		}
	],

	titleTpl: Ext.DomHelper.createTemplate(['{0} ', {tag: 'span', html: '{1}'}]),

	showMoreTpl: Ext.DomHelper.createTemplate({
		cls: 'show-more',
		cn: [
			{cls: 'dots', cn: [
				{},
				{},
				{}
			]},
			{html: '{count} More'}
		]
	}),

	childEls: ['body'],
	getTargetEl: function () {
		return this.body;
	},

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'grouping-header',
			cn: [
				{cls: 'tools'},
				{tag: 'span', cls: 'name'},
				{tag: 'span', cls: 'count'}
			]
		},
		{
			id: '{id}-body',
			cn: ['{%this.renderContainer(out,values)%}']
		}
	]),

	renderSelectors: {
		toolsEl: '.grouping-header .tools',
		nameEl: '.grouping-header .name',
		countEl: '.grouping-header .count'
	},


	maybeDestroy: function (store, record) {
		if (record === this.record) {
			this.destroy();
		}
	},


	initComponent: function () {
		this.storeId = this.record.storeId;
		this.mon(this.record.store, 'remove', 'maybeDestroy', this);

		this.callParent(arguments);

		this.associatedGroup = this.associatedGroup || this.record;

		this.setTitle(this.associatedGroup.getName());
		this.setupActions(this.associatedGroup, true);

		this.tools = Ext.Array.map(this.tools, function (t) {
			return Ext.widget(t);
		});

		Ext.Array.each(this.tools, function (t) {
			if (t.chat) {
				this.chatTool = t;
			}
			else if (t.settings) {
				this.settingsTool = t;
			}
		}, this);

		this.chatTool.assignExtAction(this.groupChatAction);
		//set the settings disabled if there is no menu or it doens't have any items
		this.settingsTool.setDisabled(!(this.menu && this.menu.items && this.menu.items.length > 0));
		if (this.groupChatAction.isHidden()) {
			this.chatTool.hide();
		}

		this.mon(this.settingsTool, 'click', this.showMenu, this);

		this.on('destroy', this.cleanupActions, this);

		this.on({
			scope: this,
			add: 'updateStuff',
			remove: 'updateStuff',
			buffer: 100
		});
		this.mixins.userContainer.constructor.apply(this, arguments);
	},


	afterRender: function () {
		this.callParent(arguments);
		Ext.Array.each(this.tools, function (t) {
			t.render(this.toolsEl);
		}, this);
	},


	showMenu: function (e, cmp) {
		this.menu.showBy(cmp.getEl(), 'tr-br?', [0, 0]);
	},


	setTitle: function (newTitle) {
		if (!this.rendered) {
			this.on('afterrender', Ext.bind(this.setTitle, this, [newTitle]));
			return;
		}

		var t = newTitle || this.initialConfig.title;

		this.initialConfig.title = t;
		this.nameEl.update(t);
		this.nameEl.set({'data-qtip': t});
		this.countEl.update(Ext.String.format('{0}', this.items.getCount()));
	},


	getTitle: function () {
		return this.initialConfig.title;
	},


	createUserComponent: function (i) {
		return {record: i};
	},


	getModelObject: function () {
		return this.associatedGroup;
	},


	getUserListFieldName: function () {
		return 'friends';
	},


	updateStuff: function () {
		this.setTitle();
		this.updateMore();
		this.updateChatState(this.associatedGroup);
	},


	updateMore: function () {
		if (!this.rendered) {
			this.on('afterrender', this.updateMore, this, {single: true});
			return;
		}
		if (this.moreEl) {
			this.moreEl.remove();
		}

		var c = this.items.getCount() - 14,
			layout = this.layout || {},
			el = layout.innerCt;
		if (c > 0 && (!this.el || !this.el.hasCls('show-all'))) {
			this.moreEl = this.showMoreTpl.append(el || this.getTargetEl(), {count: c}, true);
			this.moreEl.on('click', this.showAll, this);
		}
	},


	showAll: function () {
		this.el.addCls('show-all');
		this.updateMore();
	}

});
