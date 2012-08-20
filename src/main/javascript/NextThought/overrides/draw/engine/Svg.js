Ext.define('NextThought.overrides.draw.engine.Svg',{
	override: 'Ext.draw.engine.Svg',


	/**
	 * Do our custom text to support superscript
	 * @param sprite
	 * @param textString
	 * @return {Array}
	 */
	setText: function(sprite, textString) {
		 var me = this,
			 el = sprite.el.dom,
			 tspans = [],
			 tspan, text, x, i, ln, texts, parts, sspan, pspan, textNode;

		//clean out current nodes so the replaced text has a freash start
		while (el.firstChild) {
			el.removeChild(el.firstChild);
		}

		// Wrap each row into tspan to emulate rows
		texts = String(textString).split("\n");
		for (i = 0, ln = texts.length; i < ln; i++) {
			text = texts[i];
			if (text) {
				parts = text.split('\u008C');
				sspan = pspan = tspan = me.createSvgElement("tspan");
				for(x=0; x<parts.length; x++){
					textNode = document.createTextNode(Ext.htmlDecode(parts[x]));

					if(x>0){
						pspan = sspan;
						sspan = me.createSvgElement("tspan");
						sspan.setAttribute('baseline-shift','super');
						sspan.setAttribute('style','font-size: 0.5em;');
						sspan.appendChild(textNode);
						pspan.appendChild(sspan);
					}
					else {
						pspan.appendChild(textNode);
					}
				}
				el.appendChild(tspan);
				tspans[i] = tspan;
			}
		}
		return tspans;
	}
});
