Ext.define('NextThought.view.math.symbols.Panel',{
	extend: 'Ext.panel.Panel',
	cls: 'math-symbol-panel',
	alias: 'widget.math-symbol-panel',

	requires: [
		'NextThought.view.Window'
	],

	statics: {
		/**
		 * Static method called when we need to show the Math Panel.
		 *
		 * @param cmp - the current target component you want clicks of this
		 *				panel along to.
		 * @param alignTo - a component this window should align it's top right corner to.
		 */
		showMathSymbolPanelFor: function(cmp, alignTo) {
			if(!cmp) {
				console.error('must call math symbol panel with some component');
				return;
			}

			if (!this.win) {
				this.win = Ext.widget('nti-window',{
					title: 'Math Symbols',
					closeAction: 'hide',
					hidden: true,
					minHeight: 115,
					layout: 'auto',
					focusOnToFront: false,
					items: [
						{xtype: 'math-symbol-panel'}
					]
				});
			}
			this.win.show();
			if (!this.win.keepPosition){this.win.alignTo(alignTo, 'tr-tl', [0, 10]);}
			this.win.down('math-symbol-panel').setTargetComponent(cmp);
			this.win.on({
				'hide': function(){
					delete this.keepPosition;
				},
				'move': function(){
					this.keepPosition = true;
				},
				scope: this.win
			});

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
	layout: {
		type: 'table',
		columns: 4
	},
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
		{xtype:'button', iconCls: 'approx', latex: '\\approx' }
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
