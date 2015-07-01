Ext.define('NextThought.app.profiles.user.components.about.parts.About', {
	extend: 'NextThought.app.profiles.user.components.about.parts.FieldSet',
	alias: 'widget.profile-user-about-about',

	cls: 'about fieldset',

	renderTpl: Ext.DomHelper.markup([
		{tag: 'h2', cls: 'title', html: 'About'},
		{tag: 'span', cls: 'field-label edit-only', html: 'Write something about yourself.'},
		{cls: 'field about multi-line', 'data-field': 'about', tabindex: '0'},
		{tag: 'span', cls: 'field-label edit-only', html: 'Email'},
		{cls: 'field email edit-only', 'data-field': 'email', tabindex: '0'},
		{tag: 'span', cls: 'field-label edit-only', html: 'Location'},
		{cls: 'field location edit-only', 'data-field': 'location', tabindex: '0'},
		{tag: 'span', cls: 'field-label edit-only', html: 'Home Page'},
		{cls: 'field homepage edit-only', 'data-field': 'home_page', tabindex: '0'},
		{tag: 'span', cls: 'field-label edit-only', html: 'Facebook Profile'},
		{cls: 'field facebook edit-only', 'data-field': 'facebook', tabindex: '0'},
		{tag: 'span', cls: 'field-label edit-only', html: 'LinkedIn Profile'},
		{cls: 'field linked-in edit-only', 'data-field': 'linkedIn', tabindex: '0'},
		{tag: 'span', cls: 'field-label edit-only', html: 'Twitter Profile'},
		{cls: 'field twitter edit-only', 'data-field': 'twitter', tabindex: '0'},
		{tag: 'span', cls: 'field-label edit-only', html: 'Google+ Profile'},
		{cls: 'field google edit-only', 'data-field': 'googlePlus', tabindex: '0'}
	]),


	renderSelectors: {
		aboutEl: '.field.about',
		emailEl: '.field.email',
		locationEl: '.field.location',
		homepageEl: '.field.homepage',
		facebookEl: '.field.facebook',
		linkedInEl: '.field.linked-in',
		twitterEl: '.field.twitter',
		googleEl: '.field.google'
	},

	setUser: function(user, isMe) {
		if (!this.rendered) {
			this.on('afterrender', this.setUser.bind(this, user, isMe));
			return;
		}

		var data = user.getAboutData();

		data.about = 'This is a short text to fill out the about field for a user.';

		this.aboutEl.update(data.about || '');
		this.emailEl.update(data.email || '');
		this.locationEl.update(data.location || '');
		this.homepageEl.update(data.homepage || '');
		this.facebookEl.update(data.facebook || '');
		this.linkedInEl.update(data.linkedIn || '');
		this.twitterEl.update(data.twitter || '');
		this.googleEl.update(data.googlePlus || '');

		if (!isMe && !data.about) {
			this.hide();
		}
	},


	isValid: function() {
		var values = this.getValues(),
			schema = this.profileSchema.ProfileSchema;


	},


	getValues: function() {
		return {
			about: this.aboutEl.dom.innerHTML,
			email: this.emailEl.dom.innerHTML,
			location: this.locationEl.dom.innerHTML,
			homepage: this.homepageEl.dom.innerHTML,
			facebook: this.facebookEl.dom.innerHTML,
			linkedIn: this.linkedInEl.dom.innerHTML,
			twitter: this.twitterEl.dom.innerHTML,
			googlePlus: this.googleEl.dom.innerHTML
		};
	}
});
