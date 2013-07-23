describe("Anchor Utils", function() {

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
				role = 'start',
				element = document.createElement(tagName), ca;

			element.setAttribute('id', id);
			ca = Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {node: element, role:role});

			expect(ca.getElementTagName()).toBe(tagName);
			expect(ca.getElementId()).toBe(id);
			expect(ca.getRole()).toBe(role);
		});

		it("Bad ElementDomContentPointer Creation", function(){
			try {
				Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {elementTagName: 'name', role: 'end'});
				expect(false).toBeTruthy();
			}
			catch (e){
				expect(e.message).toBe('Must supply an Id');
			}

			try {
				Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {elementId: 'id', role: 'start'});
				expect(false).toBeTruthy();
			}
			catch (e){
				expect(e.message).toBe('Must supply a tag name');
			}

			try {
				Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {elementId: 'id', elementTagName: 'tagName', role: 'wrong'});
				expect(false).toBeTruthy();
			}
			catch (e){
				expect(e.message).toBe('Role must be of the value start,end,ancestor, supplied wrong');
			}

			try {
				Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {elementId: 'id', elementTagName: 'tagName'});
				expect(false).toBeTruthy();
			}
			catch (e){
				expect(e.message).toBe('Must supply a role');
			}
		});

		it("Good TextDomContentPointer Creation", function(){
			var	cfg = {
					ancestor: Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {
						elementId: 'id',
						elementTagName: 'tagName',
						role: 'ancestor'
					}),
					role: 'start',
					edgeOffset: 5,
					contexts: [
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text1', contextOffset:0}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text2', contextOffset:1}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text3', contextOffset:2})
					]
				},
				x = Ext.create('NextThought.model.anchorables.TextDomContentPointer', cfg);

			expect(x.getEdgeOffset()).toEqual(cfg.edgeOffset);
			expect(x.getContexts()).toBeTruthy();
			expect(x.getContexts().length).toEqual(cfg.contexts.length);
			expect(x.getAncestor().getRole()).toEqual('ancestor');
			expect(x.getAncestor().getElementTagName()).toEqual('TAGNAME');
			expect(x.getAncestor().getElementId()).toEqual('id');
			expect(x.getRole()).toEqual(cfg.role);
		});

		it("Bad TextDomContentPointer Creation", function(){
			try {
				Ext.create('NextThought.model.anchorables.TextDomContentPointer', {
					role: 'ancestor',
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
					role: 'ancestor',
					edgeOffset: 5
				});
				expect(false).toBeTruthy();
			}
			catch (e){
				expect(e.message).toEqual('Must supply TextContexts');
			}

			try {
				Ext.create('NextThought.model.anchorables.TextDomContentPointer', {
					role: 'ancestor',
					contexts: [
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text1', contextOffset:0}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text2', contextOffset:1}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text3', contextOffset:2})
					]
				});
				expect(false).toBeTruthy();
			}
			catch (e) {
				//expect(e.message).toEqual('Offset must exist and be 0 or more');
				console.warn('This test is in question, can we have a negative edgeOffset???, Ask Chris');
			}

			try {
				Ext.create('NextThought.model.anchorables.TextDomContentPointer', {
					role: 'ancestor',
					edgeOffset: 3,
					contexts: [
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text1', contextOffset:0}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text2', contextOffset:1}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text3', contextOffset:2})
					]
				});
				expect(false).toBeTruthy();
			}
			catch (e) {
				expect(e.message).toEqual('Ancestor must be supplied');
			}

			try {
				Ext.create('NextThought.model.anchorables.TextDomContentPointer', {
					role: 'ancestor',
					edgeOffset: 3,
					ancestor: Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {
						elementId: 'id',
						elementTagName: 'tagName',
						role: 'end' //must be ancestor
					}),
					contexts: [
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text1', contextOffset:0}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text2', contextOffset:1}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text3', contextOffset:2})
					]
				});
				expect(false).toBeTruthy();
			}
			catch (e) {
				expect(e.message).toEqual('If ancestor is an ElementDomContentPointer, role must be of value ancestor');
			}

		});

		it("Good DomContentRangeDescription Creation", function(){
			var tca1 = Ext.create('NextThought.model.anchorables.TextDomContentPointer',{
					role: 'start',
					ancestor: Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {
						elementId: 'id',
						elementTagName: 'tagName',
						role: 'ancestor'
					}),
					edgeOffset: 5,
					contexts: [
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text1', contextOffset:0}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text2', contextOffset:1}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text3', contextOffset:2})
					]
				}),
				tca2 = Ext.create('NextThought.model.anchorables.TextDomContentPointer', {
					role: 'start',
					ancestor: Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {
						elementId: 'id',
						elementTagName: 'tagName',
						role: 'ancestor'
					}),
					edgeOffset: 5,
					contexts: [
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text1', contextOffset:0}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text2', contextOffset:1}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text3', contextOffset:2})
					]
				}),
				ca1 = Ext.create('NextThought.model.anchorables.TextDomContentPointer', {
					role: 'start',
					ancestor: Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {
						elementId: 'id',
						elementTagName: 'tagName',
						role: 'ancestor'
					}),
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
					role: 'start',
					ancestor: Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {
						elementId: 'id',
						elementTagName: 'tagName',
						role: 'ancestor'
					}),
					edgeOffset: 5,
					contexts: [
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text1', contextOffset:0}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text2', contextOffset:1}),
						Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text3', contextOffset:2})
					]
				}),
				tca2 = Ext.create('NextThought.model.anchorables.TextDomContentPointer', {
					role: 'start',
					edgeOffset: 5,
					ancestor: Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {
						elementId: 'id',
						elementTagName: 'tagName',
						role: 'ancestor'
					}),
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
	});

	it('Good TimeRangeDescription Creation', function(){
		function createTimePointer(role, time){
			return Ext.create('NextThought.model.anchorables.TimeContentPointer', {
				role:role,
				seconds:time
			});
		}

		var tp = Ext.create('NextThought.model.anchorables.TimeRangeDescription', {
				seriesId:'myseries',
				start: createTimePointer('start', 12)
			}),
			tp2 =  Ext.create('NextThought.model.anchorables.TimeRangeDescription', {
				seriesId:'myseries',
				start: createTimePointer('start', 11),
				end: createTimePointer('end', 45)
			});

		expect(tp.getStart()).toBeTruthy();
		expect(tp.getEnd()).toBeFalsy();
		expect(tp2.getStart()).toBeTruthy();
		expect(tp2.getEnd()).toBeTruthy();
		expect(tp2.getStart().role).toEqual('start');
		expect(tp2.getStart().seconds).toEqual(11);
		expect(tp2.getSeriesId()).toEqual('myseries');
	});

	it('Bad TimeRangeDescription Creation', function(){
		function createTimePointer(role, time){
			return Ext.create('NextThought.model.anchorables.TimeContentPointer', {
				role:role,
				seconds:time
			});
		}

		var end = createTimePointer('end', 12), tp;
		try{
			tp = Ext.create('NextThought.model.anchorables.TimeRangeDescription', {
				seriesId:'myseries',
				end: end
			});
			expect(tp).toBeFalsy();
		}catch(e){
			expect(e.message).toEqual('Invalid contents');
		}
	});

	it('Good TranscriptRangeDescription Creation', function(){
		function createTranscriptPointer(role, domRangePointer, time, cueid){
			return Ext.create('NextThought.model.anchorables.TranscriptContentPointer', {
				role: role,
				seconds:time,
				pointer:domRangePointer,
				cueid: cueid
			});
		}
		var cfg = {
				ancestor: Ext.create('NextThought.model.anchorables.ElementDomContentPointer', {
					elementId: 'id',
					elementTagName: 'tagName',
					role: 'ancestor'
				}),
				role: 'start',
				edgeOffset: 5,
				contexts: [
					Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text1', contextOffset:0}),
					Ext.create('NextThought.model.anchorables.TextContext', {contextText:'text2', contextOffset:1})
				]
			},
			x = Ext.create('NextThought.model.anchorables.TextDomContentPointer', cfg),
			trd = Ext.create('NextThought.model.anchorables.TranscriptRangeDescription', {
				start: createTranscriptPointer('start', x, 7, '1'),
				end: createTranscriptPointer('end', x, 15, '2'),
				seriesId:'myseries1'
			});

		expect(trd).toBeTruthy();
		expect(trd.getStart().seconds).toEqual(7);
		expect(trd.getStart().pointer).toEqual(x);
		expect(trd.getSeriesId()).toEqual('myseries1');
	});


});

