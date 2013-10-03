Ext.define('NextThought.view.form.fields.PlaceholderPolyfill', {

	renderPlaceholder: function(inputEl) {
		var p = 'Placeholder', t;
		if (Ext.supports[p] || !inputEl.getAttribute('placeholder')) {return;}

		function handleBlur() {
			var v = Ext.getDom(inputEl).value;
			if (p) { p[Ext.isEmpty(v) ? 'show' : 'hide'](); }
		}

		p = Ext.DomHelper.insertAfter(inputEl,
				{tag: 'span', cls: 'placeholder', html: inputEl.getAttribute('placeholder'), style: t }, true);

		p.setStyle(inputEl.getStyles(
				'font-size', 'font-weight', 'font-family',
				'text-transform', 'letter-spacing'));

		p.setVisibilityMode(Ext.Element.DISPLAY);
		this.mon(p, 'click', inputEl.focus, inputEl);

		handleBlur();


		this.mon(inputEl, {
			focus: function handleFocus() { if (p) { p.hide(); } },
			blur: handleBlur
		});
	},




	fixPlaceholders: function(input) {
		if (Ext.supports.Placeholder) {return;}

		if (!Ext.isArray(input)) {
			input = [input];
		}

		function wrap(el) {
			el.appendTo(
					Ext.DomHelper.insertBefore(el,
							{tag: 'span', style: {position: 'relative', display: 'inline-block'}}));
		}

		function needsWrap(el) {
			//Some time in the future we should check if the parent of the el is a shrink-wrapped container with a
			// position other than static (so that coordinates are relative to it)
			//el = el.parent();
			//return el.getStyle('position') === 'static';
			return true;
		}

		function fix(el) {
			if (!el.getAttribute('placeholder')) {return;}
			el = Ext.get(el);
			if (needsWrap(el)) {
				wrap(el);
			}
			this.renderPlaceholder(el, true);
		}

		Ext.each(input, fix, this);
	}
});
