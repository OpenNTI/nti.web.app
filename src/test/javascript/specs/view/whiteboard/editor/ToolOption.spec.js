describe('ToolOption tests', function(){

	describe('Tooltips', function(){

		function createToolOption(opts){
			var options = Ext.applyIf((opts||{}), {
				buildOptions: Ext.emptyFn
			});
			var o = NextThought.view.whiteboard.editor.ToolOption.create(options);
			return o;
		}

		it('Sets the tooltip property from option', function(){
			var o = createToolOption({option: 'foo'});
			expect(o.tooltip.toLowerCase()).toEqual('foo');
		});

		it('Prefers value of tipText if present', function(){
			var o = createToolOption({option: 'foo', tipText: 'bar'});
			expect(o.tooltip.toLowerCase()).toEqual('bar');
		});
	});
});
