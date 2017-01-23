const Grade = require('../Grade');

describe('Grade Model Tests', () => {
	describe('getDisplay tests', () => {
		it('Value and Letter', () => {
			expect(Grade.getDisplay({value: '100', letter: 'A'})).toEqual('100 A');
			expect(Grade.getDisplay({Correctness: '100', Grade: 'A'})).toEqual('100 A');
		});

		it('Value and no Letter', () => {
			expect(Grade.getDisplay({value: '100'})).toEqual('100');
			expect(Grade.getDisplay({Correctness: '100'})).toEqual('100');
		});

		it('No Value and Letter', () => {
			expect(Grade.getDisplay({letter: 'A'})).toEqual('A');
			expect(Grade.getDisplay({Grade: 'A'})).toEqual('A');
		});
	});
});
