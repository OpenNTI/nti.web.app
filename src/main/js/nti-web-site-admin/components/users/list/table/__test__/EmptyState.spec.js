/* eslint-env jest */
import React from 'react';
import { create, act } from 'react-test-renderer';

import EmptyState from '../EmptyState';

describe('Site admin user table empty state test', () => {
	test('Test default wording', () => {
		let cmp;
		act(() => {
			cmp = create(<EmptyState />);
		});

		const tree = cmp.toJSON();

		// should just use the default label for empty component
		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});

	test('Test custom wording', () => {
		let cmp;
		act(() => {
			cmp = create(<EmptyState message="this is custom text" />);
		});

		const tree = cmp.toJSON();

		// should show "this is custom text"
		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});
