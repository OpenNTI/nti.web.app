Ext.define('NextThought.view.form.fields.PlaceholderPolyfill',{

	renderPlaceholder: function(inputEl){
		var p = 'Placeholder';
		if(Ext.supports[p] || !this.placeholder){return;}

		function handleBlur(){
			var v = inputEl.getValue()||'';
			if(p){ p[v===''?'show':'hide'](); }
		}

		p = Ext.DomHelper.append(
				inputEl.parent(), {cls: 'placeholder', html: this.placeholder}, true);

		p.setVisibilityMode(Ext.Element.DISPLAY);
		this.mon(p,'click',this.focus,this);

		handleBlur();


		this.mon(inputEl,{
			focus: function handleFocus(){ if(p){ p.hide(); } },
			blur: handleBlur
		});
	}
});
