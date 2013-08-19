Ext.define('NextThought.view.contacts.oobe.Window',{
	extend: 'NextThought.view.window.Window',
	alias: 'widget.oobe-contact-window',

	requires: [
		'NextThought.layout.component.Natural'
	],

	cls: 'contacts-oobe-window',
	width: 750,
	height: 500,
	autoShow: true,
	resizable: false,
	draggable: false,
	modal: true,
	dialog: true,

	componentLayout: 'natural',
	layout: 'auto',
	items: [],

	childEls: ['body'],
	getTargetEl: function () {
		return this.body;
	},

	renderTpl: Ext.DomHelper.markup([
		{
			id: '{id}-body', cls: 'container-body', html: '{%this.renderContainer(out,values)%}'
		},
		{
			cls: 'error', cn: [
			{cls: 'label'},
			{cls: 'message'}
		]
		},
		{
			cls: 'footer', cn: [
				{tag: 'a', cls: 'button cancel', role: 'button', html: 'Cancel'},
				{tag: 'a', cls: 'button confirm', role: 'button', html: 'Save'}
			]
		}
	]),

	renderSelectors: {
		footerEl: '.footer',
		cancelEl: '.footer a.cancel',
		confirmEl: '.footer a.confirm',

		errorEl: '.error',
		errorLabelEl: '.error .label',
		errorMessageEl: '.error .message'
	},


	getDockedItems: function () {
		return [];
	},


	listeners: {
		afterRender: 'center'
	},


	initComponent: function(){
		this.callParent();
		var store = new NextThought.store.UserSearch({
			filters: [
				//filter out communities, lists, groups and yourself. Just return users.
				function (rec) {
					return rec.get('Username') !== $AppConfig.contactsGroupName;
				},
				function (rec) {
					return !rec.isCommunity;
				},
				function (rec) {
					return !isMe(rec);
				},
				function (rec) {
					return rec.get('ContainerId') === 'Users';
				}
			]
		});
		this.add({
			xtype: 'dataview',
			store: store,
			xtype: 'dataview',
			preserveScrollOnRefresh: true,
			flex: 1,

			overflowX: 'hidden',
			overflowY: 'auto',

			allowDeselect: true,
			singleSelect: false,

			cls: 'oobe-contact-results',
			overItemCls: 'over',
			itemSelector: '.item',

			tpl: Ext.DomHelper.markup({
				tag: 'tpl', 'for': '.', cn: [
					{ cls: 'item', cn: [
						{tag: 'img', src: Ext.BLANK_IMAGE_URL, style:{backgroundImage:'url({avatarURL})'}},
						{cls: 'name', html: '{displayName}'}
					]}
				]
			})
		});

		Ext.defer(store.search,1,store,['.']);
	},


	afterRender: function () {
		var me = this;
		me.callParent(arguments);
		me.mon(me.cancelEl, 'click', 'close');
		me.mon(me.confirmEl, 'click', 'onConfirm');

		this.errorEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.errorEl.hide();
	},


	hideError: function () {
		this.updateContentHeight();
		this.errorEl.hide();
	},


	showError: function (message, label) {
		var el = this.getTargetEl(),
			errorEl = this.errorEl;

		function syncHeight() {
			if(!errorEl || !errorEl.getY || !el || !el.getY){
				return;
			}
			var h = errorEl.getY() - el.getY();
			el.setHeight(h);
		}

		this.errorLabelEl.update(label || 'Error:');
		this.errorMessageEl.update(message || '');

		errorEl.show();
		Ext.defer(syncHeight, 1);
	},


	onConfirm: function(e){
		e.stopEvent();
	}
});

