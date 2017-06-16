/* eslint-env jest */
const Grade = require('../Grade');

describe ('Grade Model Tests', () => {
	describe ('getDisplay tests', () => {
		test ('Value and Letter', () => {
			expect(Grade.getDisplay({value: '100', letter: 'A'})).toEqual('100 A');
			expect(Grade.getDisplay({Correctness: '100', Grade: 'A'})).toEqual('100 A');
		});

		test ('Value and no Letter', () => {
			expect(Grade.getDisplay({value: '100'})).toEqual('100');
			expect(Grade.getDisplay({Correctness: '100'})).toEqual('100');
		});

		test ('No Value and Letter', () => {
			expect(Grade.getDisplay({letter: 'A'})).toEqual('A');
			expect(Grade.getDisplay({Grade: 'A'})).toEqual('A');
		});
	});
});
