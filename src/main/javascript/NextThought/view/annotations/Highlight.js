Ext.define('NextThought.view.annotations.Highlight', {
	extend:'NextThought.view.annotations.Annotation',
	alias: 'widget.highlight',
	requires:[
		'NextThought.util.Anchors'
	],

	constructor: function(config){
		this.callParent(arguments);
		return this;
	},


	getRange: function(){
		if(!this.range){
			this.range = Anchors.toDomRange(this.getRecordField('applicableRange'),this.doc);
		}
		return this.range;
	}
});
