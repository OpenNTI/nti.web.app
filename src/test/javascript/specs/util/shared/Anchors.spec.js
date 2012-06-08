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

		it('fake test is best', function(){
			expect(AnchorUtils.doSomething()).toBe(1);
		});
	});

	describe("Model Tests", function(){
		it("ContentAnchor created via JSON", function(){
			var id = 'a1234567',
				tagName = 'SOMETAGNAME',
				ca = Ext.create('NextThought.model.anchorables.ContentAnchor', {domId: id, tagName: tagName});

			expect(ca.getTagName()).toBe(tagName);
			expect(ca.getDomId()).toBe(id);
		});

		it("ContentAnchor created via node", function(){
			var id = 'a1234567',
				tagName = 'SOMETAGNAME',
				element = document.createElement(tagName), ca;

			element.setAttribute('id', id);
			ca = Ext.create('NextThought.model.anchorables.ContentAnchor', element);

			expect(ca.getTagName()).toBe(tagName);
			expect(ca.getDomId()).toBe(id);
		});

		it("TextContentAnchor created via JSON", function(){
			var id = 'a1234567',
				tagName = 'SOMETAGNAME',
				contextText = 'some text',
				contextOffset = 15,
				edgeOffset = 3,
				cfg = {
					domId: id,
					tagName: tagName,
					contextText: contextText,
					contextOffset: contextOffset,
					edgeOffset: edgeOffset
				},
				tca = Ext.create('NextThought.model.anchorables.TextContentAnchor', cfg);

			expect(tca.getTagName()).toBe(tagName);
			expect(tca.getDomId()).toBe(id);
			expect(tca.getContextText()).toBe(contextText);
			expect(tca.getContextOffset()).toBe(contextOffset);
			expect(tca.getEdgeOffset()).toBe(edgeOffset);
		});

		it("ContentRangeSpec creation", function(){
			var id = 'a1234567',
				tagName = 'SOMETAGNAME',
				contextText = 'some text',
				contextOffset = 15,
				edgeOffset = 3,
				tca1 = Ext.create('NextThought.model.anchorables.TextContentAnchor', {
					domId: id+'0',
					tagName: tagName + 'C',
					contextText: contextText,
					contextOffset: contextOffset,
					edgeOffset: edgeOffset
				}),
				tca2 = Ext.create('NextThought.model.anchorables.TextContentAnchor', {
					domId: id+'1',
					tagName: tagName + 'B',
					contextText: contextText,
					contextOffset: contextOffset,
					edgeOffset: edgeOffset
				}),
				ca1 = Ext.create('NextThought.model.anchorables.TextContentAnchor', {
					domId: id,
					tagName: tagName
				}),
				cas = Ext.create('NextThought.model.anchorables.ContentRangeSpec', {
					start: tca1,
					end: tca2,
					ancestor: ca1
				});

			expect(cas.getStart()).toBeTruthy();
			expect(cas.getEnd()).toBeTruthy();
			expect(cas.getAncestor()).toBeTruthy();
		});

		it("ContentSimpleTextRangeSpec creation", function(){
			var id = 'a1234567',
				tagName = 'SOMETAGNAME',
				contextText = 'some text',
				contextOffset = 15,
				edgeOffset = 3,
				selectedText = 'this is a test',
				offset = 5,
				tca1 = Ext.create('NextThought.model.anchorables.TextContentAnchor', {
					domId: id+'0',
					tagName: tagName + 'C',
					contextText: contextText,
					contextOffset: contextOffset,
					edgeOffset: edgeOffset
				}),
				tca2 = Ext.create('NextThought.model.anchorables.TextContentAnchor', {
					domId: id+'1',
					tagName: tagName + 'B',
					contextText: contextText,
					contextOffset: contextOffset,
					edgeOffset: edgeOffset
				}),
				ca1 = Ext.create('NextThought.model.anchorables.TextContentAnchor', {
					domId: id,
					tagName: tagName
				}),
				cstas = Ext.create('NextThought.model.anchorables.ContentSimpleTextRangeSpec', {
					start: tca1,
					end: tca2,
					ancestor: ca1,
					offset: offset,
					selectedText: selectedText
				});

			expect(cstas.getStart()).toBeTruthy();
			expect(cstas.getEnd()).toBeTruthy();
			expect(cstas.getAncestor()).toBeTruthy();
			expect(cstas.getOffset()).toBeTruthy();
			expect(cstas.getSelectedText()).toBeTruthy();

			expect(cstas.getOffset()).toBe(offset);
			expect(cstas.getSelectedText()).toBe(selectedText);
		});
	});
});

