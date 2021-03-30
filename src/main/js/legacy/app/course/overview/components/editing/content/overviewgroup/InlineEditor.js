const Ext = require('@nti/extjs');
const { Input } = require('@nti/web-commons');
const { Color } = require('@nti/lib-commons');
const OverviewGroup = require('internal/legacy/model/courses/overview/Group');
const ReactHarness = require('internal/legacy/overrides/ReactHarness');

const EditingActions = require('../../Actions');

const styles = stylesheet`
	.editor {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.input:global(.title) {
		flex: 1 1 auto;
		margin-bottom: 0;
	}

	.color {
		flex: 0 0 auto;
		display: inline-block;
		margin-left: 0.5rem;
	}

	.color > :global(.x-component) {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	[data-color-picker-panel].flyout {
		max-width: 380px;
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
			{ cls: `color-input ${styles.color}`, tag: 'span' },
		]),

		renderSelectors: {
			inputEl: '.title',
			colorInputContainerEl: '.color-input',
		},

		escapeForInput(value) {
			return value?.replace(/"/g, '&quot;');
		},

		beforeRender() {
			this.callParent(arguments);

			var colors = OverviewGroup.COLOR_CHOICES,
				title = this.escapeForInput(this.record?.get('title')) || '',
				accent = this.record?.get('accentColor');

			this.renderData = Ext.apply(this.renderData || {}, {
				currentColor: accent || colors[0],
				advanced: Service.canDoAdvancedEditing(),
				title,
				maxLength: EditingActions.MAX_TITLE_LENGTH,
			});
		},

		afterRender() {
			this.callParent(arguments);

			const colors = OverviewGroup.COLOR_CHOICES;
			const accent = this.record?.get('accentColor');
			const [{ color: defaultColor }] = colors;

			this.colorInput = ReactHarness.create({
				component: Input.Color.Flyout,
				className: styles.flyout,
				renderTo: this.colorInputContainerEl,
				value: !accent ? defaultColor : Color.fromHex(accent),
				onChange: newColor => {
					this.colorInput.setProps({ value: newColor });
					this.onInputChange();
				},
				arrow: true,
				swatches: colors,
				verticalAlign: Input.Color.Flyout.ALIGNMENTS.BOTTOM,
				horizontalAlign: Input.Color.Flyout.ALIGNMENTS.LEFT_OR_RIGHT,
			});

			this.onInputChange();
		},

		getSelectedColor() {
			const recordColor = this.record?.get('accentColor');

			if (this.colorInput) {
				const value = this.colorInput.getProps().value.hex.toString();
				return value?.replace('#', '');
			}

			return recordColor;
		},

		getTitle() {
			return this.inputEl?.getValue();
		},

		isEmpty() {
			const values = this.getValue();

			return !values.title && !values.accentColor;
		},

		onInputChange() {
			this.onChange?.(this.getValue());
		},

		getErrors() {
			const values = this.getValue();
			const errors = {};

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

		showErrorOn(name) {
			if (name === 'title') {
				this.inputEl.addCls('error');
			}
		},

		removeErrorOn(name) {
			this.inputEl.removeCls('error');
		},

		getErrorsFor(name) {
			const errors = this.getErrors();

			return errors?.[name];
		},

		getValue() {
			return {
				MimeType: OverviewGroup.mimeType,
				title: this.getTitle(),
				accentColor: this.getSelectedColor(),
			};
		},
	}
);
