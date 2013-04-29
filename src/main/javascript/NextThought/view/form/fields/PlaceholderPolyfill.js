Ext.define('NextThought.view.form.fields.PlaceholderPolyfill',{

	renderPlaceholder: function(inputEl){
		var p = 'Placeholder';
		if(Ext.supports[p] || !inputEl.getAttribute('placeholder')){return;}

		function handleBlur(){
			var v = Ext.getDom(inputEl).value;
			if(p){ p[Ext.isEmpty(v)?'show':'hide'](); }
		}

		p = Ext.DomHelper.insertAfter( inputEl,
				{ cls: 'placeholder', html: inputEl.getAttribute('placeholder') }, true);

		p.setStyle( inputEl.getStyles(
				'font-size', 'font-weight','font-family',
				'text-transform', 'letter-spacing'));

		p.setVisibilityMode(Ext.Element.DISPLAY);
		this.mon(p,'click',inputEl.focus,inputEl);

		handleBlur();


		this.mon(inputEl,{
			focus: function handleFocus(){ if(p){ p.hide(); } },
			blur: handleBlur
		});
	}
});
