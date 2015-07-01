Ext.define('NextThought.app.profiles.user.components.about.parts.Interests', {
	extend: 'NextThought.app.profiles.user.components.about.parts.EntrySet',
	alias: 'widget.profile-user-about-interests',

	cls: 'interests fieldset groupset',
	title: 'Interests',

	entryTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'entry interest{[values.pending ? " pending": ""]}', cn: [
			{tag: 'span', cls: 'label', html: '{label}'},
			{cls: 'remove edit-only'}
		]
	})),


	newEntryTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'new-field field editable interest', 'data-field': 'interest', 'data-placeholder': 'New Interest', contenteditable: 'true', tabindex: '0'
	})),


	renderTpl: Ext.DomHelper.markup([
		{tag: 'h2', cls: 'title', html: '{title}'},
		{cls: 'entries'}
	]),


	afterRender: function() {
		this.callParent(arguments);

		var dom = this.el.dom;

		this.onEditorKeyPress = this.onEditorKeyPress.bind(this);

		dom.addEventListener('keypress', this.onEditorKeyPress);

		this.mon(this.el, 'click', this.onClicked.bind(this));
	},


	onClicked: function(e) {
		if (!e.getTarget('.remove')) {
			return;
		}

		var dom = this.entriesEl.dom,
			interest = e.getTarget('.interest');

		if (interest) {
			dom.removeChild(interest);
		}
	},


	onEditorKeyPress: function(e) {
		var code = e.key || e.charCode;

		if (code === Ext.EventObject.ENTER) {
			this.saveNewInterest();
			e.preventDefault();
		}
	},


	getEditor: function() {
		var dom = this.entriesEl.dom;
		
		return dom && dom.querySelector('.new-field');
	},


	saveNewInterest: function() {
		var editor = this.getEditor(),
			text;

		if (!editor) { return; }

		text = editor.innerText;

		this.setUneditable();

		this.addEntry({
			pending: true,
			label: text
		});

		this.setEditable();

		editor = this.getEditor();

		editor.focus();		
	},


	applySchema: function() {},


	setUneditable: function() {
		var dom = this.entriesEl.dom,
			editor = dom && dom.querySelector('.new-field');

		if (editor) {
			dom.removeChild(editor);
		}
	},


	setEditable: function() {
		this.newEntryTpl.append(this.entriesEl);
	},


	setUser: function(user, isMe) {
		if (!this.rendered) {
			this.on('afterrender', this.setUser.bind(this, user, isMe));
			return;
		}

		var data = user.getAboutData();

		data.interests.push('Computer Hacking');
		data.interests.push('Nunchucks');
		data.interests.push('Bow Hunting');
		data.interests.push('Nunchucks');
		data.interests.push('Bow Hunting');
		data.interests.push('Interest 1');
		data.interests.push('Interest 2');
		data.interests.push('Interest 3');

		data.interests.map(function(interest) {
			return {label: interest};
		}).forEach(this.addEntry.bind(this));

		if (!data.interests.length && !isMe) {
			this.hide();
		}
	},


	entryToValues: function(entry) {
		var label = entry.querySelector('.label');

		label = label && label.innerText;

		return label;
	}
});