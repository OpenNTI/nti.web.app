Ext.define('NextThought.app.course.overview.components.editing.contentlink.Editor', {
	extend: 'Ext.Component',
	alias: 'widget.editing-contentlink-editor',

	csl: 'content-editor',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', cn: [
			{cls: 'left', cn: [
				{cls: 'thumbnail'}
			]},
			{cls: 'right', cn: [
				{cls: 'title', cn: [
					{tag: 'input', tabIndex: -1, type: 'text', placeholder: 'Title...'}
				]},
				{cls: 'author', cn: [
					{tag: 'input', tabIndex: -1, type: 'text', placeholder: 'Author...'}
				]}
			]}
		]},
		{cls: 'main', cn: [
			{cls: 'description', cn: [
				{
					cls: 'content show-placeholder scrollable',
					'data-placeholder': '{placeholderText}',
					contentEditable: true,
					unselectable: 'off',
					tabIndex: -1,
					cn: [
						{ //inner div for IE
							//default value (U+2060 -- allow the cursor in to this placeholder div, but don't take any space)
							html: '\u2060'
						}
					]
				}
			]}
		]},
		{cls: 'footer', cn: [
			{
				cls: 'right save-controls',
				cn: [
					{cls: 'action save', html: 'Save'},
					{cls: 'action cancel', html: 'Cancel'}
				]
			}
		]}
	])

});