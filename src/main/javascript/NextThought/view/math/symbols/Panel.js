Ext.define('NextThought.view.math.symbols.Panel',{
	extend: 'Ext.panel.Panel',
	cls: 'math-symbol-panel',
	alias: 'widget.math-symbol-panel',

	/* settings for this panel*/
	layout: {
		type: 'table',
		columns: 3
	},
	border: false,
	defaults: {
		ui: 'math-symbol',
		scale: 'large'
	},


	/** These are the math buttons*/
	items: [
		{xtype:'button', iconCls: 'radic', latex: '\\surd' },
		{xtype:'button', iconCls: 'squared', latex: 'x^2' },
		{xtype:'button', iconCls: 'parens', latex: '(x)' },
		{xtype:'button', iconCls: 'pi', latex: '\\pi' },
		{xtype:'button', iconCls: 'approx', latex: '\\approx' },
		{html: ''}//filler to make the interior border show up
	],


	/** @private */
	afterRender: function() {
		Ext.each(this.query('button'), function(b){
			b.addListener('click', this.symbolClicked, this);
		}, this);

		this.callParent(arguments);
	},


	/**
	 * Set the target component that we should pass back to someone who knows how to
	 * shove latex into it.
	 *
	 * @param c - the component which will accept the shoving of LaTeX
	 */
	setTargetComponent: function(c) {
		if(c) {
			this.targetComponent = c;
		}
	},


	/**
	 * remove the target component, do this if you don't want the symbols clicked to have any effect
	 */
	releaseTargetComponent: function() {
		this.targetComponent = undefined;
	},


	/**
	 * When a math button has been clicked, send the LaTeX to the QuizUtils along with the
	 * component we've been told about for further processing...
	 *
	 * @param symBtn - the button pressed
	 */
	symbolClicked: function(symBtn) {
		QuizUtils.sendLaTeXCommand(this.targetComponent, symBtn.latex);
	}
});
