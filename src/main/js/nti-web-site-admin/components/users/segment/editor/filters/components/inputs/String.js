import { useCallback } from 'react';

import { scoped } from '@nti/lib-locale';
import { Input } from '@nti/web-core';

import { InputRegistry } from './common';

const t = scoped(
	'nti-web-site-admin.components.users.segment.editor.filters.components.inputs.String',
	{
		equal: 'Is',
		notEqual: 'Is Not',
		placeholder: 'Enter value...',
	}
);

const CompareOptions = [
	{ value: 'equal', label: t('equal') },
	{ value: 'notEqual', label: t('notEqual') },
];

export function StringInput({ value: valueProp, onChange, autoFocus }) {
	const { comparator, value } = valueProp ?? {};

	const onComparatorChange = useCallback(
		c => {
			onChange({ comparator: c, value });
		},
		[value]
	);

	const onValueChange = useCallback(
		v => {
			onChange({ comparator, value: v });
		},
		[comparator]
	);

	return (
		<>
			<Input.Select
				autoFocus={autoFocus}
				value={comparator ?? ''}
				options={CompareOptions}
				onChange={onComparatorChange}
			/>
			<Input.Text
				value={value ?? ''}
				onChange={onValueChange}
				placeholder={t('placeholder')}
			/>
		</>
	);
}

InputRegistry.register('string', StringInput);
