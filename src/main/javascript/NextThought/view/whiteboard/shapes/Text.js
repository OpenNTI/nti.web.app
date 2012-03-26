Ext.define(	'NextThought.view.whiteboard.shapes.Text', {
	extend:	'NextThought.view.whiteboard.shapes.Base',

	draw: function(ctx){
		this.callParent(arguments);

		ctx.font='30pt Calibri';
		ctx.fontAlign = 'center';

		ctx.fillText(this.text,0,0);
		ctx.strokeText(this.text,0,0);

		console.log(ctx.measureText(this.text).width, this.text);
	}
});
