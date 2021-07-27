import React from 'react';
import renderer, { act } from 'react-test-renderer';

import View from '../View';

const getCourse = hasRosterLink => {
	return {
		CatalogEntry: {
			Title: 'course1',
			getDefaultAssetRoot() {
				return 'testRoot';
			},
		},
		getPresentationProperties: () => {
			return {
				title: 'course1',
				label: 'Course 1',
			};
		},
		hasLink: () => hasRosterLink,
	};
};

/* eslint-env jest */
describe('Site admin user course enrollment nav bar test', () => {
	test('Basic render test (has roster link)', async () => {
		const course = getCourse(true);

		let cmp;
		act(() => {
			cmp = renderer.create(<View course={course} />);
		});

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});

	test('Basic render test (has no roster link)', async () => {
		const course = getCourse(false);

		let cmp;
		act(() => {
			cmp = renderer.create(<View course={course} />);
		});

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});
