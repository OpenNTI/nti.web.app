Ext.define('NextThought.model.anchorables.TranscriptContentPointer', {
	extend: 'NextThought.model.anchorables.TimeContentPointer',


	config:{
		pointer:{},
		cueid:''
	},


	statics:{
		createFromObject: function(o){
			var cp = NextThought.model.anchorables.DomContentPointer;

			return NextThought.model.anchorables.TranscriptContentPointer.create({
				pointer: cp.createFromObject(o.pointer),
				cueid: o.cueid,
				role: o.role,
				seconds: o.seconds
			});
		}
	},


	constructor: function(o){
		this.callParent(arguments);
		this.Class = 'TranscriptContentPointer';
	}
});