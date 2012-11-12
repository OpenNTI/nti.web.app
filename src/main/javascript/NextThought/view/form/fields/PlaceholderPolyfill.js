Ext.define('NextThought.view.form.fields.PlaceholderPolyfill',{

	renderPlaceholder: function(inputEl){
		var p = 'Placeholder';
		if(Ext.supports[p] || !this.placeholder){return;}

		p = this.placeholderEl = Ext.DomHelper.append(
				this.inputEl.parent(), {cls: 'placeholder', html: this.placeholder}, true);

		p.setVisibilityMode(Ext.Element.DISPLAY);
		this.mon(p,'click',this.focus,this);

		this.handleBlur();

		this.mon(inputEl,{
			scope: this,
			focus: this.handleFocus,
			blur: this.handleBlur
		});
	},

	handleFocus: function(){
		if(this.placeholderEl){
			this.placeholderEl.hide();
		}
	},

	handleBlur: function(){
		var v = this.getValue()||'';
		if(this.placeholderEl){
			this.placeholderEl[v===''?'show':'hide']();
		}
	}
});
