Ext.define('NextThought.app.profiles.user.components.about.parts.About', {
	extend: 'NextThought.app.profiles.user.components.about.parts.FieldSet',
	alias: 'widget.profile-user-about-about',

	requires: ['NextThought.app.account.Actions'],

	cls: 'about fieldset',
	name: 'about',

	renderTpl: Ext.DomHelper.markup([
		{tag: 'h2', cls: 'title', html: 'About'},
		{cls: 'field-container', cn: [
			{tag: 'span', cls: 'field-label edit-only', html: 'Write something about yourself.'},
			{cls: 'error-msg'},
			{cls: 'field about multi-line', 'data-field': 'about', tabindex: '0'}
		]},
		{cls: 'field-container', cn: [
			{tag: 'span', cls: 'field-label edit-only', html: 'Name'},
			{cls: 'error-msg'},
			{cls: 'field realname edit-only', 'data-field': 'realname', tabindex: '0'}
		]},
		{cls: 'field-container', cn: [
			{tag: 'span', cls: 'field-label edit-only', html: 'Display Name'},
			{cls: 'error-msg'},
			{cls: 'field alias edit-only', 'data-field': 'alias', tabindex: '0'}
		]},
		{cls: 'field-container', cn: [
			{tag: 'span', cls: 'field-label edit-only', html: 'Email'},
			{cls: 'error-msg'},
			{cls: 'field email edit-only', 'data-field': 'email', tabindex: '0'}
		]},
		{cls: 'field-container', cn: [
			{tag: 'span', cls: 'field-label edit-only', html: 'Location'},
			{cls: 'error-msg'},
			{cls: 'field location edit-only', 'data-field': 'location', tabindex: '0'}
		]},
		{cls: 'field-container', cn: [
			{tag: 'span', cls: 'field-label edit-only', html: 'Home Page'},
			{cls: 'error-msg'},
			{cls: 'field homepage edit-only', 'data-field': 'home_page', tabindex: '0'}
		]},
		{cls: 'field-container', cn: [
			{tag: 'span', cls: 'field-label edit-only', html: 'Facebook Profile'},
			{cls: 'error-msg'},
			{cls: 'field facebook edit-only', 'data-field': 'facebook', tabindex: '0'}
		]},
		{cls: 'field-container', cn: [
			{tag: 'span', cls: 'field-label edit-only', html: 'LinkedIn Profile'},
			{cls: 'error-msg'},
			{cls: 'field linked-in edit-only', 'data-field': 'linkedIn', tabindex: '0'}
		]},
		{cls: 'field-container', cn: [
			{tag: 'span', cls: 'field-label edit-only', html: 'Twitter Profile'},
			{cls: 'error-msg'},
			{cls: 'field twitter edit-only', 'data-field': 'twitter', tabindex: '0'}
		]},
		{cls: 'field-container', cn: [
			{tag: 'span', cls: 'field-label edit-only', html: 'Google+ Profile'},
			{cls: 'error-msg'},
			{cls: 'field google edit-only', 'data-field': 'googlePlus', tabindex: '0'}
		]}
	]),


	renderSelectors: {
		aboutEl: '.field.about',
		nameEl: '.field.alias',
		realnameEl: '.field.realname',
		emailEl: '.field.email',
		locationEl: '.field.location',
		homepageEl: '.field.homepage',
		facebookEl: '.field.facebook',
		linkedInEl: '.field.linked-in',
		twitterEl: '.field.twitter',
		googleEl: '.field.google'
	},


	initComponent: function() {
		this.callParent(arguments);

		this.AccountActions = NextThought.app.account.Actions.create();
	},


	afterRender: function() {
		this.callParent(arguments);

		this.aliasMonitor = this.mon(this.nameEl, {
			destroyable: true,
			'click': this.requestAliasChange.bind(this)
		});
	},


	setUser: function(user, isMe) {
		if (!this.rendered) {
			this.on('afterrender', this.setUser.bind(this, user, isMe));
			return;
		}

		this.isMe = isMe;

		var data = user.getAboutData();

		this.nameEl.update(data.displayName || '');
		this.realnameEl.update(data.realname || '');
		this.aboutEl.update(data.about || '');
		this.emailEl.update(data.email || '');
		this.locationEl.update(data.location || '');
		this.homepageEl.update(data.home_page || '');
		this.facebookEl.update(data.facebook || '');
		this.linkedInEl.update(data.linkedIn || '');
		this.twitterEl.update(data.twitter || '');
		this.googleEl.update(data.googlePlus || '');

		if (!isMe && !data.about) {
			this.hide();
		} else {
			this.show();
		}
	},


	setEditable: function() {
		this.callParent(arguments);
		this.updateRequestAlias();
	},


	setUneditable: function() {
		this.callParent(arguments);
		this.updateRequestAlias();
	},
	
	setSchema: function() {
		this.callParent(arguments);
		this.updateRequestAlias();
	},
	
	updateRequestAlias: function(){
		if (!this.nameEl.hasCls('editable') && isFeature('request-alias-change') && this.isMe) {
			this.nameEl.addCls('request');
		}
		else{
			this.nameEl.removeCls('request');
		}
	},

	requestAliasChange: function(e) {
		if (e.getTarget('.request')) {
			this.AccountActions.requestAliasChange();
		}
	},



	getErrorMsg: function() {
		var me = this,
			valid = true,
			schema = this.profileSchema && this.profileSchema.ProfileSchema,
			values = me.getValues(),
			fields = Object.keys(values) || [];

		if (!schema) {
			console.error('No schema to validate profile');
			return 'Unable to edit profile at this time.';
		}

		fields.forEach(function(field) {
			var fieldSchema = schema[field],
				value = values[field];

			//for now just check if they are required
			if (fieldSchema.required && !value) {
				me.showErrorForField(field, 'Required');
				valid = false;
			}
		});

		this.hasErrors = !valid;

		return valid ? '' : 'Missing Required About Fields';
	},


	getValues: function() {
		var me = this,
			values = {},
			schema = me.profileSchema && me.profileSchema.ProfileSchema,
			keys = [
				{
					name: 'about',
					selector: 'aboutEl'
				},
				{
					name: 'alias',
					selector: 'nameEl'
				},
				{
					name: 'realname',
					selector: 'realnameEl'
				},
				{
					name: 'email',
					selector: 'emailEl'
				},
				{
					name: 'location',
					selector: 'locationEl'
				},
				{
					name: 'home_page',
					selector: 'homepageEl'
				},
				{
					name: 'facebook',
					selector: 'facebookEl'
				},
				{
					name: 'linkedIn',
					selector: 'linkedInEl'
				},
				{
					name: 'twitter',
					selector: 'twitterEl'
				},
				{
					name: 'googlePlus',
					selector: 'googleEl'
				}
			];

		if (!schema) {
			return {};
		}

		keys.forEach(function(key) {
			var fieldSchema = schema[key.name];

			if (fieldSchema && !fieldSchema.readonly) {
				values[key.name] = me[key.selector] && me[key.selector].dom.innerHTML;
			}
		});

		return values;
	}
});
