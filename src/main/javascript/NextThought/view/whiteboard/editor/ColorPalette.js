Ext.define('NextThought.view.whiteboard.editor.ColorPalette', {
    extend: 'Ext.picker.Color',
    alias: 'widget.color-palette',

    componentCls : 'color-palette',
    selectedCls: 'x-pressed',

    allowReselect : true,

    colors : [
		{ name: 'black',	value: '333333' },
		{ name: 'grey1',	value: '707070' },
		{ name: 'grey2',	value: 'ACACAC' },
		{ name: 'grey3',	value: 'E1E1E1' },
		{ name: 'red',		value: 'D34F39' },
		{ name: 'blue',		value: '2B89C5' },
		{ name: 'green',	value: 'A0C94C' },
		{ name: 'orange',	value: 'FA8700' },
		{ name: 'magenta',	value: 'B42789' },
		{ name: 'purple',	value: '6F3D93' },
		{ name: 'yellow',	value: 'FFF02A' },
		{ name: 'none',		value: 'NONE' }
    ],

    colorRe: /(?:^|\s)color-(.{6}|NONE)(?:\s|$)/,

    renderTpl: [
        '<tpl for="colors">',
            '<a href="#" class="color {name} color-{value}" hidefocus="on">',
                '<em class="button"><span class="whiteboard-color-icon" unselectable="on">&#160;</span></em>',
            '</a>',
        '</tpl>'
    ]
});
