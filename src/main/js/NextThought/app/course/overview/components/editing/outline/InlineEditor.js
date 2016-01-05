Ext.define('NextThought.app.course.overview.components.editing.outline.InlineEditor', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-inline-editor',

	inheritableStatics: {
		getTypes: function() {}
	},

	cls: 'inline-editor',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'field', cn: [
			{tag: 'input', name: 'title', value: '{defaultValue}', autocomplete: '{autocomplete}'}
		]}
	]),


	renderSelectors: {
		inputEl: '.field input[name=title]'
	},


	beforeRender: function() {
		this.callParent(arguments);

		var type = this.self.getTypes();

		this.mimeType = type && type.mimeType;

		this.renderData = Ext.apply(this.renderData || {}, {
			defaultValue: this.getSuggestedNodeTitle(),
			autocomplete: this.autocomplete || 'off'
		});
	},


	getSuggestedNodeTitle: function() {
		var childrenCount = (this.parentRecord.get('Items') || []).length, childType;

		if (this.parentRecord) {
			if (this.parentRecord._depth === 0) {
				childType = 'Unit';
			} else if (this.parentRecord._depth === 1) {
				childType = 'Lesson';
			}

			if (childType) {
				return childType + ' ' + (childrenCount + 1);
			}
		}

		return '';
	},


	afterRender: function() {
		this.callParent(arguments);
		var me = this;

		this.mon(this.inputEl, {
			'keyup': this.onKeyup.bind(this)
		});

		wait()
			.then(function() {
				me.inputEl.dom.select();
			});
	},


	onKeyup: function(e) {
		var record;

		if (e.getKey() === e.ENTER) {
			if (this.onSave) {
				this.onSave(e);
			}
		}

		if (e.getKey() === e.ESC) {
			if (this.onCancel) {
				this.onCancel(e);
			}
		}

		if (this.inputEl.dom.value !== null && this.inputEl.dom.value.length > 0) {
			this.clearError();
		}
	},


	getValue: function() {
		return {
			MimeType: this.mimeType,
			ContentNTIID: null,
			title: this.inputEl.getValue()
		};
	},


	setSuggestTitle: function() {
		this.inputEl.dom.value = this.getSuggestedNodeTitle();
		this.inputEl.dom.select();
	},


	isValid: function() {
		var value = this.getValue();

		if (!value.MimeType) {
			console.warn('No mimeType');
			return false;
		}

		if (!value.title) {
			return false;
		}

		return true;
	},


	showError: function() {
		this.inputEl.addCls('error');
	},


	clearError: function() {
		if (this.inputEl.hasCls('error')) {
			this.inputEl.removeCls('error');
		}
	}
});
