const Ext = require('extjs');
const {toCSSClassName} = require('nti-lib-dom');
const cx = require('classnames');

const NTIFormat = require('legacy/util/Format');
const UserSearch = require('legacy/model/UserSearch');


module.exports = exports = Ext.define('NextThought.app.sharing.components.ShareSearchList', {
	extend: 'Ext.view.View',
	alias: ['widget.share-search'],
	cls: 'share-search',
	allowBlank: true,
	displayField: 'displayName',
	valueField: 'Username',
	singleSelect: true,
	loadingHeight: 40,

	plain: true,
	ui: 'nt',
	baseCls: 'x-menu',
	itemCls: 'x-menu-item contact-card',
	itemSelector: '.contact-card',
	emptyText: '<div class="x-menu-item no-results">No results found.</div>',

	tpl: new Ext.XTemplate(Ext.DomHelper.markup({
		tag: 'tpl', 'for': '.', cn: [
			{ tag: 'tpl', 'if': 'isLabel', cn: [
				{cls: 'x-menu-item contact-card label', html: '{realname}'}
			]},
			{ tag: 'tpl', 'if': '!isLabel', cn: [
				{
					cls: '{[this.getItemClass(values)]}',
					cn: [
						'{[this.getAvatar(values)]}',
						{cls: 'avatar icon {[this.getType(values)]}', style: '{[this.getIcon(values)]}'},
						{cls: 'card-body {[this.getType(values)]}', cn: [
							{cls: '{[this.getNameClass(values)]}', html: '{[this.getDisplayName(values)]}'},
							{cls: 'status', html: '{[this.getDisplayTypeValue(values)]}'}
						]}
					]
				}
			]}
		]}
	), {
		getAvatar (model) {
			var a = NTIFormat.avatar(model);
			return a;
		},

		getNameClass (model) {
			return cx('name', toCSSClassName(this.getDisplayName(model)));
		},

		isUser (model) {
			var t = this.getType(model);
			return t === 'person';
		},

		getIcon (/*model*/) {
			// var t = this.getType(model);
			return '';
		},

		getItemClass (model) {
			return cx(
				'x-menu-item',
				'contact-card',
				this.getType(model),
				{
					'marked': model.isMarked
				}
			);
		},

		getType (modelData) {
			return UserSearch.getType(modelData);
		},

		getDisplayName (modelData) {
			return modelData.friendlyName || modelData.displayName;
		},

		getDisplayTypeValue (model) {
			var t = this.getType(model),
				map = {
					'list': 'List',
					'group': 'Group',
					'public': 'Community',
					'person': 'User'
				};

			if (model.friendlyName) {
				return model.displayName;
			}

			return map[t];
		}
	}),


	constructor: function (cfg) {
		var ownerCls = cfg.ownerCls || '';

		this.loadMask = {
			msg: 'Searching...',
			maskCls: 'share-search-mask ' + ownerCls,
			cls: 'share-search-mask ' + ownerCls,
			msgCls: 'share-search-mask ' + ownerCls,
			renderTo: cfg.loadMaskContainer
		};

		this.callParent([cfg]);

		this.on('itemclick', this.onRecordClick.bind(this));
	},


	onRecordClick: function (view, record) {
		if (!record.get('isLabel')) {
			this.selectItem(record);
		}
	},

	destroy: function () {
		this.callParent(arguments);
		//console.warn('destroying list view...', arguments);
	},


	setUpMaskListeners: function (store) {
		Ext.destroy(this.maskListeners);

		if (!this.rendered) {
			this.on('afterrender', this.setUpMaskListeners.bind(this, store));
			return;
		}

		if (!store) {
			return;
		}

		Ext.destroy(this.maskListeners);

		this.maskListeners = this.mon(store, {
			destroyable: true,
			beforeload: this.loadMask.show.bind(this.loadMask),
			load: this.loadMask.hide.bind(this.loadMask)
		});

		if (store.loading) {
			this.loadMask.show();
		} else {
			this.loadMask.hide();
		}
	},


	addSelected: function () {
		var node = this.el.dom.querySelector('.x-item-selected'),
			selected = node && this.getRecord(node);

		if (!selected.get('isLabel')) {
			this.selectItem(selected);
		}
	},


	selectNext: function () {
		var node = this.el.dom.querySelector('.x-item-selected'),
			selected = node && this.getRecord(node),
			index = selected && this.store.indexOf(selected) || -1,
			next;

		if (index < 0 || index === this.store.getCount() - 1) {
			next = 0;
		}else{
			next = index + 1;
		}

		while (this.store.getAt(next).get('isLabel')) { //is label
			next += 1;
			if(next > this.store.getCount() - 1) {
				next = 0;
			}
		}

		if (!this.store.getAt(next).get('isLabel')) { //is not label
			this.getNodeByRecord(this.store.getAt(next)).classList.add('x-item-selected');
			if(node) {
				node.classList.remove('x-item-selected');
			}
		}
	},

	selectPrev: function () {
		var node = this.el.dom.querySelector('.x-item-selected'),
			selected = node && this.getRecord(node),
			index = selected && this.store.indexOf(selected) || -1,
			prev;

		if (index < 0) {
			prev = this.store.getCount() - 1;
		}else{
			prev = index - 1;
		}

		while (this.store.getAt(prev).get('isLabel')) { //is label
			prev -= 1;
			if(prev < 0) {
				prev = this.store.getCount() - 1;
			}
		}

		if (!this.store.getAt(prev).get('isLabel')) { //is not label
			this.getNodeByRecord(this.store.getAt(prev)).classList.add('x-item-selected');
			if(node) {
				node.classList.remove('x-item-selected');
			}
		}
	},

	unselectItem: function () {
		var selected = this.getSelectionModel().selected,
			index = this.store && this.store.indexOf(selected.items[0]) || -1;

		if(index > -1) {
			this.getSelectionModel().deselect(index);
		}
	},

	bindStore: function (store) {
		this.callParent(arguments);

		this.setUpMaskListeners(store);
	}
});
