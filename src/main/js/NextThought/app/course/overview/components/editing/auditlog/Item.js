Ext.define('NextThought.app.course.overview.components.editing.auditlog.Item', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-auditlog-item',

	cls: 'auditlog-item',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'content', cn: [
			{cls: 'avatar-wrapper', cn: ['{user:avatar}']},
			{tag: 'span', cls: 'username', html: '{user:displayName}'},
			{tag: 'span', cls: 'message', html: '{type} {fields}.'},
			{cls: 'date', html: '{date}'}
		]}
	]),

	renderSelectors: {
		avatarEl: '.avatar-wrapper',
		nameEl: '.username'
	},

	TYPES: {
		create: 'created',
		update: 'changed the'
	},

	FIELDS: {
		label: 'title',
		title: 'title',
		href: 'link',
		byline: 'author',
		visability: 'visability'
	},

	beforeRender: function() {
		this.callParent(arguments);

		var me = this,
			record = me.item,
			attributes = record.get('attributes'),
			type = record.get('type');

		var fields = attributes.filter(function(attr) {
			return attr !== 'MimeType' && attr !== 'targetMimeType';
		}).map(function(attr) {
			return me.FIELDS[attr.toLowerCase()] || attr;
		});

		// Message will be: {user} created {title of item}.
		if (type === 'create' && fields.length === 0) {
			var title = me.parentRecord && ( me.parentRecord.getTitle());
			fields.push('"' + title + '"');
		}

		me.renderData = Ext.apply(me.renderData || {}, {
			type: me.TYPES[type] || type,
			date: Ext.Date.format(record.get('CreatedTime'), 'F j, Y \\a\\t g:i A') || '',
			fields: fields.join(', ')
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
