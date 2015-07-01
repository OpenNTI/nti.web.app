Ext.define('NextThought.app.profiles.user.components.about.parts.EntrySet', {
	extend: 'NextThought.app.profiles.user.components.about.parts.FieldSet',

	title: '',
	errorMsg: '',

	entryTpl: new Ext.XTemplate(),

	renderTpl: Ext.DomHelper.markup([
		{tag: 'h2', cls: 'title', html: '{title}'},
		{cls: 'entries'},
		{cls: 'add edit-only', html: 'Add Entry'}
	]),


	renderSelectors:  {
		entriesEl: '.entries',
		addEl: '.add'
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.title
		});
	},


	afterRender: function() {
		this.callParent(arguments);


		this.mon(this.el, 'click', this.onClicked.bind(this));
	},


	onClicked: function(e) {
		if (e.getTarget('.add')) {
			this.addNewEntry();
			return;
		}

		if (!e.getTarget('.remove-entry')) {
			return;
		}

		var entry = e.getTarget('.entry-container');

		this.entriesEl.dom.removeChild(entry);
	},


	getEmptyEntry: function() {
		return {};
	},


	addNewEntry: function() {
		this.entryTpl.append(this.entriesEl, this.getEmptyEntry());

		this.applySchema();
	},


	clearEntries: function() {
		this.entriesEl.dom.innerHTML = '';
	},


	addEntry: function(data) {
		this.entryTpl.append(this.entriesEl, data);
	},


	isReadOnly: function() {
		return true;
	},


	applySchema: function() {
		if (!this.profileSchema) {
			return;
		}

		var dom = this.el.dom,
			readOnly = this.isReadOnly(),
			fields;

		if (readOnly) {
			fields = dom.querySelectorAll('.editable');
		} else {
			fields = dom.querySelectorAll('[data-field]');
		}

		fields = Array.prototype.slice.call(fields);

		fields.forEach(function(field) {
			if (readOnly) {
				field.classList.remove('editable');
			} else {
				field.classList.add('editable');
			}
		});


		this.appliedSchema = true;

		if (this.editMode) {
			this.setEditable();
		}
	},

	showErrorForField: function(entry, fieldName, msg) {
		var field = entry && entry.querySelector('[data-field="' + fieldName + '"]'),
			container = field && field.parentNode,
			error = container && container.querySelector('.error-msg');

		if (field) {
			field.classList.add('error');
		}

		if (error) {
			error.innerHTML = msg;
		}
	},


	validateEntry: function(entry) {},


	getErrorMsg: function() {
		var entries = this.entriesEl.dom.querySelectorAll('.entry') || [];

		if (this.isReadOnly()) {
			return '';
		}

		entries = Array.prototype.slice.call(entries);

		entries = entries.map(this.validateEntry.bind(this)).filter(function(x) { return !!x; });

		this.hasErrors = entries.length > 0;

		return entries.length ? this.errorMsg : '';
	},


	getValues: function() {
		var entries = this.entriesEl.dom.querySelectorAll('.entry') || [],
			values = [];

		if (this.isReadOnly) {
			return [];
		}

		entries = Array.prototype.slice.call(entries);

		return entries.map(this.entryToValues.bind(this));
	}
});
