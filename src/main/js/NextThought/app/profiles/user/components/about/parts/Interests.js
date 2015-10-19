Ext.define('NextThought.app.profiles.user.components.about.parts.Interests', {
	extend: 'NextThought.app.profiles.user.components.about.parts.EntrySet',
	alias: 'widget.profile-user-about-interests',

	name: 'interests',

	cls: 'interests fieldset groupset',
	title: 'Interests',
	emptyText: 'Share your interests...',

	entryTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'entry interest{[values.pending ? " pending": ""]}', cn: [
			{tag: 'span', cls: 'label', html: '{label}'},
			{cls: 'remove edit-only'}
		]
	})),


	newEntryTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'new-field field editable interest entry', 'data-field': 'interest', 'data-placeholder': 'New Interest', contenteditable: 'true', tabindex: '0'
	})),


	renderTpl: Ext.DomHelper.markup([
		{tag: 'h2', cls: 'title', html: '{title}'},
		{cls: 'empty-text hidden', html: '{emptyText}'},
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
			interest.classList.add('removing');
			wait(300)
				.then(dom.removeChild.bind(dom, interest));
		}
	},


	onEditorKeyPress: function(e) {
		if (e.key === Ext.EventObject.ENTER || e.charCode === Ext.EventObject.ENTER) {
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

		text = (editor.innerText || editor.textContent);

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


	isReadOnly: function() {
		var schema = this.profileSchema.ProfileSchema;

		return !schema || schema.readonly;
	},


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

		if (!data.interests.length && isMe) {
			this.showEmptyText();
		} else {
			this.hideEmptyText();
		}

		this.clearEntries();

		data.interests.filter(function(x) {
			return !!x;
		}).map(function(interest) {
			return {label: interest};
		}).forEach(this.addEntry.bind(this));

		if (!data.interests.length && !isMe) {
			this.hide();
		} else {
			this.show();
		}
	},


	entryToValues: function(entry) {
		var label = entry.querySelector('.label');

		//if we don't have a label we are the editor
		label = (label && (label.innerText || label.textContent)) || (entry.innerText || entry.textContent);

		return label;
	},


	getErrorMsg: function() {
		return '';
	}
});
