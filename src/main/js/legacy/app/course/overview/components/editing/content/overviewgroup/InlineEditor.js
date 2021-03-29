const Ext = require('@nti/extjs');
const {Input} = require('@nti/web-commons');
const {Color} = require('@nti/lib-commons');
const OverviewGroup = require('internal/legacy/model/courses/overview/Group');
const ReactHarness = require('internal/legacy/overrides/ReactHarness');

const EditingActions = require('../../Actions');

const styles = stylesheet`
	.editor {
		display: flex;
		flex-direction: row-reverse;
		align-items: center;
	}

	.input:global(.title) {
		flex: 1 1 auto;
		margin-bottom: 0;
	}

	.color {
		flex: 0 0 auto;
		display: inline-block;
		margin-right: 0.5rem;
	}

	.color > :global(.x-component) {
		display: flex;
		justify-content: center;
		align-items: center;
	}
`;

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.content.overviewgroup.InlineEditor',
	{
		extend: 'Ext.Component',
		alias: 'widget.overview-editing-overviewgroup-inlineeditor',

		statics: {
			creationText: 'Create a section',
		},

		cls: `overviewgroup-editor inline ${styles.editor}`,

		renderTpl: Ext.DomHelper.markup([
			{
				tag: 'input',
				cls: `title ${styles.input}`,
				placeholder: 'Section name',
				type: 'text',
				value: '{title}',
				maxlength: '{maxLength}',
			},
			{ cls: `color-input ${styles.color}`, tag: 'span'},
		]),

		renderSelectors: {
			inputEl: '.title',
			colorInputContainerEl: '.color-input',
		},

		escapeForInput: function (value) {
			return value && value.replace(/"/g, '&quot;');
		},

		beforeRender: function () {
			this.callParent(arguments);

			var colors = OverviewGroup.COLOR_CHOICES,
				title = this.record
					? this.escapeForInput(this.record.get('title'))
					: '',
				accent = this.record ? this.record.get('accentColor') : '';

			this.renderData = Ext.apply(this.renderData || {}, {
				currentColor: accent || colors[0],
				advanced: Service.canDoAdvancedEditing(),
				title: title,
				maxLength: EditingActions.MAX_TITLE_LENGTH,
			});
		},

		afterRender: function () {
			this.callParent(arguments);

			var colors = OverviewGroup.COLOR_CHOICES,
				accent = this.record ? this.record.get('accentColor') : '';

			this.colorInput = ReactHarness.create({
				component: Input.Color.Flyout,
				renderTo: this.colorInputContainerEl,
				value: accent === '' ? colors[0].color : Color.fromHex(accent),
				onChange: (newColor) => {
    				this.colorInput.setProps({value: newColor});
					this.onInputChange();
				},
				arrow: true,
				swatches: colors,
				veriticalAlign: Input.Color.Flyout.ALIGNMENTS.BOTTOM,
				horizontalAlign: Input.Color.Flyout.ALIGNMENTS.LEFT
			});

			this.onInputChange();
		},

		getSelectedColor: function () {
			var recordColor = this.record && this.record.get('accentColor'),
				value;

			if (this.colorInput ) {
				value = this.colorInput.getProps().value.hex.toString();
				value = value?.replace('#', '');
			} else if (recordColor) {
				value = recordColor;
			}

			return value;
		},

		getTitle: function () {
			return this.inputEl && this.inputEl.getValue();
		},

		isEmpty: function () {
			var values = this.getValue();

			return !values.title && !values.accentColor;
		},

		onInputChange: function () {
			if (this.onChange) {
				this.onChange(this.getValue());
			}
		},

		getErrors: function () {
			var values = this.getValue(),
				errors = {};

			if (!values.title || !values.title.trim().length) {
				errors.title = {
					missing: true,
				};
			}

			if (!values.accentColor) {
				errors.color = {
					missing: true,
				};
			}
			return errors;
		},

		showErrorOn: function (name) {
			if (name === 'title') {
				this.inputEl.addCls('error');
			}
		},

		removeErrorOn: function (name) {
			this.inputEl.removeCls('error');
		},

		getErrorsFor: function (name) {
			var errors = this.getErrors();

			return errors[name];
		},

		getValue: function () {
			return {
				MimeType: OverviewGroup.mimeType,
				title: this.getTitle(),
				accentColor: this.getSelectedColor(),
			};
		},
	}
);
