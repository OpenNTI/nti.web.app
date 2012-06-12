describe("Anchor Utils", function() {
	var AnchorUtils;

	/**
	 * Just do basic setup stuff, make sure anchors utils is setup.
	 */
	//Make sure setup gets called before each test.
	beforeEach(function(){
		AnchorUtils = new NextThought.util.shared.Anchors();
	});

	describe("Tests", function(){
		it("Make sure Anchors is defined", function() {
			expect(NextThought.util.shared.Anchors).toBeDefined();
		});
	});

	describe("Model Tests", function(){
		it('Good TextContent Creation', function(){
			var text = 'This is some text',
				offset = 5,
				ct = Ext.create('NextThought.model.anchorables.TextContext', {contextText:text, contextOffset:offset});

			expect(ct).toBeTruthy();
			expect(ct.getContextText()).toEqual(text);
			expect(ct.getContextOffset()).toEqual(offset);
		});

		it('Bad TextContent Creation', function(){
			try {
				Ext.create('NextThought.model.anchorables.TextContext', {contextText:'', contextOffset:5});
				expect(false).toBeTruthy();
			}
			catch (e) {
				expect(e.message).toEqual('Text must have one or more characters');
			}
			try {
				Ext.create('NextThought.model.anchorables.TextContext', {contextOffset:5});
				expect(false).toBeTruthy();
			}
			catch (e) {
				expect(e.message).toEqual('Text must have one or more characters');
			}
			try {
				Ext.create('NextThought.model.anchorables.TextContext', {contextText: 'text', contextOffset:-1})
				expect(false).toBeTruthy();
			}
			catch (e) {
				expect(e.message).toEqual('Offset must be greater than 0, supplied value: -1');
			}
			try {
				Ext.create('NextThought.model.anchorables.TextContext', {contextText: 'text'});
				expect(false).toBeTruthy();
			}
			catch (e) {
				expect(e.message).toEqual('No offset supplied');
			}
		});

		it("Good DomContentPointer Creation", function(){
			var role = 'end',
				ca = Ext.create('NextThought.model.anchorables.DomContentPointer', {role: role});

			expect(ca.getRole()).toBe(role);
		});

		it("Bad DomContentPointer Creation", function(){
			try {
				Ext.create('NextThought.model.anchorables.DomContentPointer', {role: 'invalid'});
				expect(false).toBeTruthy();
			}
			catch (e){
				expect(e.message).toEqual('Role must be of the value start,end,ancestor, supplied invalid');
			}

			try {
				Ext.create('NextThought.model.anchorables.DomContentPointer', {});
				expect(false).toBeTruthy();
			}
			catch (e){
				expect(e.message).toEqual('Must supply a role');
			}
		});

		it("Good ElementDomContentPointer Creation via config", function(){
			var id = 'a1234567',
				tagName = 'SOMETAGNAME',
				role = 'end',
				ca = Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {elementId: id, elementTagName: tagName, role: role});

			expect(ca.getElementTagName()).toBe(tagName);
			expect(ca.getElementId()).toBe(id);
			expect(ca.getRole()).toBe(role);
		});

		it("Good ElementDomContentPointer Creation via node", function(){
			var id = 'a1234567',
				tagName = 'SOMETAGNAME',
				type = 'start',
				element = document.createElement(tagName), ca;

			element.setAttribute('id', id);
			ca = Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {node: element, type:type});

			expect(ca.getElementTagName()).toBe(tagName);
			expect(ca.getElementId()).toBe(id);
			expect(ca.getRole()).toBe(role);
		});

		it("Bad ElementDomContentPointer Creation", function(){
			try {
				Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {elementTagName: 'name', type: 'end'});
				expect(false).toBeTruthy();
			}
			catch (e){
				expect(e.message).toBe('Must supply an Id');
			}

			try {
				Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {elementId: 'id', type: 'start'});
				expect(false).toBeTruthy();
			}
			catch (e){
				expect(e.message).toBe('Must supply a tag name');
			}

			try {
				Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {elementId: 'id', elementTagName: 'tagName', type: 'wrong'});
				expect(false).toBeTruthy();
			}
			catch (e){
				expect(e.message).toBe('Type must be of the type start,end,ancestor, supplied wrong');
			}

			try {
				Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {elementId: 'id', elementTagName: 'tagName'});
				expect(false).toBeTruthy();
			}
			catch (e){
				expect(e.message).toBe('Must supply a type');
			}
		});

		it("Good TextDomContentPointer Creation via config", function(){
			var	cfg = {
					elementId: 'id',
					elementTagName: 'tagName',
					role: 'ancestor',
					edgeOffset: 5,
					contexts: [
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text1', contextOffset:0}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text2', contextOffset:1}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text3', contextOffset:2})
					]
				},
				x = Ext.create('NextThought.model.anchorables.TextDomContentPointer', cfg);

			expect(x.getEdgeOffset()).toBe(cfg.edgeOffset);
			expect(x.getRole()).toBe(cfg.role);
			expect(x.getContexts()).toBeTruthy();
			expect(x.getContexts().length).toBe(cfg.contexts.length);
			expect(x.getElementTagName()).toBe(cfg.elementTagName);
			expect(x.getElementId()).toBe(cfg.elementId);
		});

		it("Bad TextDomContentPointer Creation via config", function(){
			try {
				Ext.create('NextThought.model.anchorables.TextDomContentPointer', {
					elementId: 'id',
					elementTagName: 'tagName',
					type: 'ancestor',
					edgeOffset: 5,
					contexts: []
				});
				expect(false).toBeTruthy();
			}
			catch (e){
				expect(e.message).toEqual('Must supply at least 1 TextContext');
			}

			try {
				Ext.create('NextThought.model.anchorables.TextDomContentPointer', {
					elementId: 'id',
					elementTagName: 'tagName',
					type: 'ancestor',
					edgeOffset: 5
				});
				expect(false).toBeTruthy();
			}
			catch (e){
				expect(e.message).toEqual('Must supply TextContexts');
			}

			try {
				Ext.create('NextThought.model.anchorables.TextDomContentPointer', {
					elementId: 'id',
					elementTagName: 'tagName',
					type: 'ancestor',
					contexts: [
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text1', contextOffset:0}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text2', contextOffset:1}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text3', contextOffset:2})
					]
				});
				expect(false).toBeTruthy();
			}
			catch (e) {
				expect(e.message).toEqual('Offset must exist and be 0 or more');
			}

		});

		it("Good DomContentRangeDescription Creation", function(){
			var tca1 = Ext.create('NextThought.model.anchorables.TextDomContentPointer',{
					elementId: 'id',
					elementTagName: 'tagName',
					type: 'ancestor',
					edgeOffset: 5,
					contexts: [
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text1', contextOffset:0}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text2', contextOffset:1}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text3', contextOffset:2})
					]
				}),
				tca2 = Ext.create('NextThought.model.anchorables.TextDomContentPointer', {
					elementId: 'id',
					elementTagName: 'tagName',
					type: 'ancestor',
					edgeOffset: 5,
					contexts: [
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text1', contextOffset:0}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text2', contextOffset:1}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text3', contextOffset:2})
					]
				}),
				ca1 = Ext.create('NextThought.model.anchorables.TextDomContentPointer', {
					elementId: 'id',
					elementTagName: 'tagName',
					type: 'ancestor',
					edgeOffset: 5,
					contexts: [
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text1', contextOffset:0}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text2', contextOffset:1}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text3', contextOffset:2})
					]
				}),
				dcrd = Ext.create('NextThought.model.anchorables.DomContentRangeDescription', {
					start: tca1,
					end: tca2,
					ancestor: ca1
				});

			expect(dcrd.getStart()).toBeTruthy();
			expect(dcrd.getEnd()).toBeTruthy();
			expect(dcrd.getAncestor()).toBeTruthy();
		});

		it("Bad DomContentRangeDescription Creation", function(){
			var tca1 = Ext.create('NextThought.model.anchorables.TextDomContentPointer',{
					elementId: 'id',
					elementTagName: 'tagName',
					type: 'ancestor',
					edgeOffset: 5,
					contexts: [
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text1', contextOffset:0}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text2', contextOffset:1}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text3', contextOffset:2})
					]
				}),
				tca2 = Ext.create('NextThought.model.anchorables.TextDomContentPointer', {
					elementId: 'id',
					elementTagName: 'tagName',
					type: 'ancestor',
					edgeOffset: 5,
					contexts: [
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text1', contextOffset:0}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text2', contextOffset:1}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text3', contextOffset:2})
					]
				}),
				ca1 = Ext.create('NextThought.model.anchorables.TextDomContentPointer', {
					elementId: 'id',
					elementTagName: 'tagName',
					type: 'ancestor',
					edgeOffset: 5,
					contexts: [
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text1', contextOffset:0}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text2', contextOffset:1}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text3', contextOffset:2})
					]
				});

			try {
				Ext.create('NextThought.model.anchorables.DomContentRangeDescription', {
					start: tca1,
					end: tca2
				});
				expect(false).toBeTruthy();
			}
			catch (e) {
				expect(e.message).toEqual('Invalid contents');
			}
		});
	})
});

