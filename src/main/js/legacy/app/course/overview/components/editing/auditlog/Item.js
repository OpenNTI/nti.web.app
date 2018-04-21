const Ext = require('@nti/extjs');
const {DateTime} = require('@nti/web-commons');
const {Parsing} = require('@nti/lib-commons');

const UserRepository = require('legacy/cache/UserRepository');
const Video = require('legacy/model/Video');
const VideoRoll = require('legacy/model/VideoRoll');

function getTitle (externalValues, recordable) {
	let title = '';
	if (recordable.Title) {
		title = recordable.Title;
	} else if (externalValues.label) {
		title = externalValues.label;
	} else if (recordable.MimeType === VideoRoll.mimeType) {
		title = 'Video Roll';
	}

	return title;
}

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
		update: 'updated',
		overviewgroupmoved: 'moved',
		outlinenodemove: 'moved',
		assetremovedfromitemcontainer: 'removed',
		presentationassetmoved: 'moved'
	},

	FIELDS: {
		label: 'title',
		title: 'title',
		href: 'link',
		items: 'item',
		byline: 'author',
		availablebeginning: 'Available Date',
		availableending: 'Available End Date',
		visability: 'visability',
		accentcolor: 'section color',
		targetmimetype: 'type'
	},

	beforeRender: function () {
		this.callParent(arguments);

		const me = this;
		const record = me.item;
		const attributes = record.get('attributes') || [];
		const changeType = record.get('type');
		const recordable = record.get('Recordable');
		const externalValues = record && record.get('ExternalValue') || {};
		const title = getTitle(externalValues, recordable);
		const isChild = recordable.NTIID !== this.parentRecord.getId();
		let type = changeType && (me.TYPES[changeType] || changeType);
		let msg = '';

		let fields = attributes.map(attr => {
			if(externalValues[attr]) {
				if (attr.substr(0,9) === 'Available') {
					return `${me.FIELDS[attr.toLowerCase()] || attr} to "${DateTime.format(Parsing.parseDate(externalValues[attr]), 'MMMM D LT')}"`;
				} else if (typeof externalValues[attr] !== 'object') {
					return `${me.FIELDS[attr.toLowerCase()] || attr} to "${externalValues[attr]}"`;
				}
			}

			return me.FIELDS[attr.toLowerCase()] || attr;
		});

		// Message will be: {user} created {title of item}.
		if (type === 'created' && fields.length === 0 && title !== '') {
			fields.push(`"${title}"`);
		}

		// Change the type if it's an item being added
		if(changeType === 'update' && fields.length === 1 && fields[0] === 'item') {
			if (VideoRoll.mimeType === recordable.MimeType) {
				type = 'updated';
			} else {
				type = 'added a';
			}
		}

		if ([VideoRoll.mimeType, Video.mimeType].includes(recordable.MimeType)) {
			msg = `${type} ${title}.`;
		} else if (isChild && title !== '') {
			msg = `${type} ${fields.join(', ')} ${getMsgContext(type, title)}.`;
		} else {
			msg = `${type} ${fields.join(', ')}.`;
		}

		me.renderData = Ext.apply(me.renderData || {}, {
			date: Ext.Date.format(record.get('CreatedTime'), 'F j, Y \\a\\t g:i A') || '',
			msg
		});


		me.loadUser(record.get('principal'));
	},

	loadUser: function (creator) {
		var me = this;
		UserRepository.getUser(creator, me.setUser, me);
	},

	setUser: function (user) {
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

	setAvatar: function (user) {
		if (this.rendered) {
			this.avatarEl.setHTML(Ext.DomHelper.createTemplate('{user:avatar}').apply({user: user}));
		}
	}
});

function getMsgContext (type, title) {
	let result = '';

	if (title === '') { return ''; }

	if (type === 'moved') {
		result = ' ' + title;
	} else if (type === 'added an') {
		result = ' in ' + title;
	} else if (type !== 'created') {
		result = ' for ' + title;
	}

	return result;
}
