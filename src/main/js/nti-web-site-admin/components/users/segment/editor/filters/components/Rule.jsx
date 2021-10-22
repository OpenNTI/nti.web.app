import { useCallback, useMemo } from 'react';

import { Input } from '@nti/web-core';
import { scoped } from '@nti/lib-locale';

import { FilterSetRule } from '../types/common';

import { ComponentRegistry } from './Registry';
import { getInput } from './inputs/Inputs';

const t = scoped(
	'nti-web-site-admin.components.users.segment.editor.filters.components.Rule',
	{
		placeholder: 'Choose a rule...',
	}
);

const Container = styled.div`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.625rem;

	& > * {
		flex: 0 0 auto;
		min-width: 120px;
	}
`;

const OptionOrder = [
	'isactive',
	'isdeactivated',
	'isenrolled',
	'isnotenrolled',
	'role',
	'location',
];

export function FilterRule({ filter, parent }) {
	const active = filter?.getActiveRule();
	const { options, rules } = useMemo(() => {
		const rules = parent.allowedSubFilterSets.reduce(
			(acc, subFilter) => ({ ...acc, ...subFilter.getRules() }),
			{}
		);

		return {
			options: OptionOrder.map(o => {
				const rule = rules[o];

				if (!rule) {
					return null;
				}

				return { value: o, label: rule.label };
			}),
			rules,
		};
	}, [filter, parent, active]);

	const onRuleChange = useCallback(
		name => {
			const newRule = rules[name];
			const { FilterSet } = newRule;

			if (filter instanceof FilterSet) {
				filter.setActiveRule(newRule);
			} else {
				const newFilter = new FilterSet();

				newFilter.setActiveRule(newRule);

				parent.replaceFilterSet(filter, newFilter);
			}
		},
		[filter, parent, rules]
	);

	const selected = active ? rules[active] : null;
	const InputCmp = getInput(selected?.input);

	const inputValue = selected?.getValue?.(filter);
	const onInputChange = useCallback(
		value => selected.setValue(filter, value),
		[filter, selected]
	);

	return (
		<Container>
			<Input.ListBox
				value={active}
				placeholder={t('placeholder')}
				onChange={onRuleChange}
				autoFocus={!active}
			>
				{options.map(o => (
					<Input.Option value={o.value} key={o.value}>
						{o.label}
					</Input.Option>
				))}
			</Input.ListBox>
			{InputCmp && (
				<InputCmp
					autoFocus
					value={inputValue}
					onChange={onInputChange}
				/>
			)}
		</Container>
	);
}

ComponentRegistry.register(s => s instanceof FilterSetRule, FilterRule);
