import { create, act } from 'react-test-renderer';

import Progress from '../Progress';

/* eslint-env jest */
describe('Site admin user course enrollment overview progress widget', () => {
	test('Basic render test (percent = 55)', async () => {
		const enrollment = {
			CourseProgress: {
				PercentageProgress: 0.55,
			},
		};

		let cmp;
		act(() => {
			cmp = create(<Progress enrollment={enrollment} />);
		});

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});

	test('Basic render test (no PercentageProgress)', async () => {
		const enrollment = {
			CourseProgress: {},
		};

		let cmp;
		act(() => {
			cmp = create(<Progress enrollment={enrollment} />);
		});

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});

	test('Basic render test (no CourseProgress)', async () => {
		const enrollment = {};

		let cmp;
		act(() => {
			cmp = create(<Progress enrollment={enrollment} />);
		});

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});
