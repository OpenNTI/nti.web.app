Ext.define('NextThought.app.profiles.user.components.about.parts.EntrySet', {
	extend: 'NextThought.app.profiles.user.components.about.parts.FieldSet',

	title: '',

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


	getRawValues: function() {
		var entries = this.entriesEl.dom.querySelectorAll('.entry') || [],
			values = [];

		entries = Array.prototype.slice.call(entries);

		return entries.map(this.entryToValues.bind(this));
	}
});
