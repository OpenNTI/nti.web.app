var Ext = require('extjs');
var UserRepository = require('../../../../../../cache/UserRepository');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.auditlog.Item', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-auditlog-item',

	cls: 'auditlog-item',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'content', cn: [
			{cls: 'avatar-wrapper', cn: ['{user:avatar}']},
			{cls: 'meta', cn: [
				{tag: 'span', cls: 'username', html: '{user:displayName}'},
				{tag: 'span', cls: 'message', html: '{msg}'},
				{cls: 'date', html: '{date}'}
			]}
		]}
	]),

	renderSelectors: {
		avatarEl: '.avatar-wrapper',
		nameEl: '.username'
	},

	TYPES: {
		create: 'created',
		update: 'changed the',
		overviewgroupmoved: 'moved',
		outlinenodemove: 'moved',
		assetremovedfromitemcontainer: 'removed'
	},

	FIELDS: {
		label: 'title',
		title: 'title',
		href: 'link',
		items: 'children',
		byline: 'author',
		availablebeginning: 'Avaiable Date',
		availableending: 'Avaiable End Date',
		visability: 'visability',
		accentcolor: 'section color'
	},

	beforeRender: function() {
		this.callParent(arguments);

		var me = this,
			record = me.item,
			attributes = record.get('attributes') || [],
			changeType = record.get('type'),
			type = changeType && (me.TYPES[changeType] || changeType),
			recordable = record.get('Recordable'),
			title = recordable && recordable.Title || '',
			isChild = recordable.NTIID !== this.parentRecord.getId(),
			message;

		var fields = attributes.map(function(attr) {
			return me.FIELDS[attr.toLowerCase()] || attr;
		});

		// Message will be: {user} created {title of item}.
		if (type === 'created' && fields.length === 0 && title) {
			fields.push('"' + title + '"');
		}

		if(isChild) {
			var ifOn = ' on ' + title;

			if(type === 'created') { ifOn = ''; }
			else if(type === 'moved') { ifOn = title; }

			message = type + ' ' + fields.join(', ') + ifOn + '.';
		} else {
			message = type + ' ' + fields.join(', ') + '.';
		}

		me.renderData = Ext.apply(me.renderData || {}, {
			date: Ext.Date.format(record.get('CreatedTime'), 'F j, Y \\a\\t g:i A') || '',
			msg: message || ''
		});


		me.loadUser(record.get('principal'));
	},

	loadUser: function(creator) {
		var me = this;
		UserRepository.getUser(creator, me.setUser, me);
	},

	setUser: function(user) {
		var me = this,
			rd = Ext.apply(me.renderData || {}, {
				user: user
			});

		me.userObject = user;
		me.renderData = rd;

		if (me.rendered) {
			me.nameEl.update(user.get('displayName'));
			me.mon(me.userObject, 'avatarChanged', me.setAvatar.bind(me, me.userObject));
		} else {
			me.mon(me.userObject, 'avatarChanged', me.setAvatar.bind(me, me.userObject));
		}
	},

	setAvatar: function(user) {
		if (this.rendered) {
			this.avatarEl.setHTML(Ext.DomHelper.createTemplate('{user:avatar}').apply({user: user}));
		}
	}
});
