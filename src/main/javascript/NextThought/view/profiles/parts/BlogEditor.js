Ext.define('NextThought.view.profiles.parts.BlogEditor',{
	extend: 'Ext.Component',
	alias: 'widget.profile-blog-editor',



	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'editor',
			cn:[{
				cls: 'main',
				cn:[{
					cls: 'title',
					cn:[{tag:'input'}]
				},{
					cn:[
						{cls: 'action publish', 'data-qtip': 'Publish'},
						{cls: 'tags'}
					]
				},{
					cls: 'toolbar',
					cn: [{
						cls: 'left',
						cn: [{cls: 'action bold', 'data-qtip': 'Bold'},
							{cls:'action italic', 'data-qtip': 'Italic'},
							{cls:'action underline', 'data-qtip': 'Underline'}]
					}]
				},{
					cls: 'content',
					contentEditable: true,
					tabIndex: 1,
					unselectable: 'off',
					cn: [{ //inner div for IE
						html: '&#8203;' //default value (allow the cursor in to this placeholder div, but don't take any space)
					}]
				}]
			},{
				cls: 'footer',
				cn: [{
					cls: 'left',
					cn: [{cls: 'action whiteboard', 'data-qtip': 'Create a whiteboard'}]
				},{
					cls: 'right',
					cn: [{cls:'action save', html: 'Save'},{cls:'action cancel', html: 'Cancel'}]
				}]
			}]
		}
	]),


	renderSelectors: {
	}
});
