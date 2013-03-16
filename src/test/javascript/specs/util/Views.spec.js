describe("View utils", function(){
	var testViewUtils;

	beforeEach(function(){
		testViewUtils = {};
		/*jslint sub:true */ //no way to ignore reserved property if using don notation
		testViewUtils['__proto__'] = NextThought.util.Views['__proto__'];
		/*jslint sub:false */
	});

	describe("From RoomInfo to Transcript",function(){
		it('transforms for same user', function(){
			var roomId = 'tag:nextthought.com,2011-10:Jumbo_MC_13-OID-0x23691e:55736572735f31:p7aw5jeMjCf'
				transcriptId = testViewUtils.convertToTranscriptId(roomId, 'Jumbo-MC-13');

			expect(transcriptId.toString()).toEqual('tag:nextthought.com,2011-10:Jumbo_MC_13-Transcript-0x23691e:55736572735f31:p7aw5jeMjCf')
		});

		it('transforms for other user', function(){
			var roomId = 'tag:nextthought.com,2011-10:Jumbo_MC_13-OID-0x23691e:55736572735f31:p7aw5jeMjCf'
				transcriptId = testViewUtils.convertToTranscriptId(roomId, 'chris.utz@nextthought.com');

			expect(transcriptId.toString()).toEqual('tag:nextthought.com,2011-10:chris.utz@nextthought.com-Transcript-0x23691e:55736572735f31:p7aw5jeMjCf')
		});
	});
});
