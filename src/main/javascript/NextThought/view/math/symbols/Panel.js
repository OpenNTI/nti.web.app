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
		height: 40,
		width: 40,
		cls: 'math-symbol-button'
	},


	/** These are the math buttons*/
	items: [
		{xtype:'button', text: '&radic;', latex: '\\surd' },
		{xtype:'button', text: 'x&sup2', latex: 'x^2' },
		{xtype:'button', text: '()', latex: '(x)' },
		{xtype:'button', text: '&Pi;', latex: '\\pi' },
		{xtype:'button', text: '&#8776', latex: '\\approx' }
		/*
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
		*/
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
