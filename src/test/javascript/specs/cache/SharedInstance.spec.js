describe('Shared Instance Cache tests', function() {
	var cache;

	function createRecord(value, id) {
		return NextThought.model.courseware.Grade.create({
			NTIID: id,
			value: value
		});
	}

	beforeEach(function() {
		cache = NextThought.cache.SharedInstance.create({
			getKeyForRecord: function(record) {
				return record.getId();
			}
		});
	});


	it('Changing the value or one changes the other', function() {
		var rec1 = createRecord('rec1', 'rec1'),
			rec2 = createRecord('rec2', 'rec2'),
			rec1Clone = createRecord('rec1', 'rec1'),
			rec2Clone = createRecord('rec2', 'rec2');

		rec1 = cache.getRecord(rec1);
		rec2 = cache.getRecord(rec2);
		rec1Clone = cache.getRecord(rec1Clone);
		rec2Clone = cache.getRecord(rec2Clone);

		expect(rec1Clone).toBe(rec1);
		expect(rec2Clone).toBe(rec2);

		rec1.set('value', 'newRec1');

		expect(rec1Clone.get('value')).toEqual('newRec1');
		expect(rec2Clone.get('value')).toEqual('rec2');

		rec2.set('value', 'newRec2');

		expect(rec1Clone.get('value')).toEqual('newRec1');
		expect(rec2Clone.get('value')).toEqual('newRec2');
	});
});