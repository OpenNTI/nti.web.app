Ext.define('NextThought.view.widgets.menu.MathSymbolPanel',{
	extend: 'Ext.panel.Panel',
	cls: 'math-symbol-panel',
	alias: 'widget.math-symbol-panel',

	statics: {
		/**
		 * Static method called when we need to show the Math Panel.
		 *
		 * @param cmp - the current target component you want clicks of this
		 *				panel along to.
		 * @param x - x position for this window
		 * @param y - y position for this window
		 */
		showMathSymbolPanelFor: function(cmp, x, y) {
			if(!cmp) {
				console.error('must call math symbol panel with some component');
				return;
			}

			if (!this.win) {
				this.win = Ext.widget('window',{
					closeAction: 'hide',
					hidden: true,
					layout: 'fit',
					height: 196,
					width: 175,
					items: {
						xtype: 'math-symbol-panel'
					}
				});
			}
			this.win.setPosition(x, y);
			this.win.down('math-symbol-panel').setTargetComponent(cmp);
			this.win.show();
		},


		/**
		 * Hide the window and release the target component
		 */
		hideMathSymbolPanel: function() {
			if (this.win) {
				this.win.down('math-symbol-panel').releaseTargetComponent();
				this.win.hide();
			}
		}
	},


	/* settings for this panel*/
	defaults: {
		height: 40,
		width: 40,
		cls: 'math-symbol-button'
	},
	maxHeight: 162,
	maxWidth: 162,
	minHeight: 162,
	minWidth: 162,


	/** These are the math buttons*/
	items: [
		{xtype:'button', text: 'SQRT', latex: '\\sqrt' },
		{xtype:'button', text: 'LOG', latex: '\\log' },
		{xtype:'button', text: 'S2', latex: '/S2' },
		{xtype:'button', text: 'S3', latex: '/S3' },
		{xtype:'button', text: 'S4', latex: '/S4' },
		{xtype:'button', text: 'S5', latex: '/S5' },
		{xtype:'button', text: 'S6', latex: '/S6' },
		{xtype:'button', text: 'S7', latex: '/S7' },
		{xtype:'button', text: 'S8', latex: '/S8' },
		{xtype:'button', text: 'S9', latex: '/S9' },
		{xtype:'button', text: 'S10', latex: '/S10' },
		{xtype:'button', text: 'S11', latex: '/S11' },
		{xtype:'button', text: 'S12', latex: '/S12' },
		{xtype:'button', text: 'S13', latex: '/S13' },
		{xtype:'button', text: 'S14', latex: '/S14' },
		{xtype:'button', text: 'S15', latex: '/S15' }
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
},
function(){
	//Make this globally accessed for the statics...
	window.MathSymbolPanel = this;
});
