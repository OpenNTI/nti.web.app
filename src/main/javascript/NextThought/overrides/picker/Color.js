Ext.define('NextThought.overrides.picker.Color',{
	override: 'Ext.picker.Color',

	colorRe: /(?:^|\s)color-([^ ]*)(?:\s|$)/,

	renderTpl: [
		'<tpl for="colors">',
			'<a href="#" class="color-',
				'<tpl if="values==\'None\'">NONE</tpl>',
				'<tpl if="values!=\'None\'">{.}</tpl>',
				'" hidefocus="on" title="{.}">',
				'<em><span style="background:#{.}" unselectable="on">&#160;</span></em>',
			'</a>',
		'</tpl>'
	]
}, function(){
	this.prototype.colors.push('None');
});
