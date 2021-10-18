import React, { useCallback, useMemo } from 'react';

import { Input } from '@nti/web-core';
import { scoped } from '@nti/lib-locale';

import { FilterSetRule } from '../types/common';

import { ComponentRegistry } from './Registry';

const t = scoped(
	'nti-web-site-admin.components.users.segment.editor.filters.components.Rule',
	{
		placeholder: 'Choose a rule...',
	}
);

const OptionOrder = ['isactive', 'isdeactivated'];

export function FilterRule({ filter, parent }) {
	const active = filter?.getActiveRule();
	const { options, selected } = useMemo(() => {
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

				return { value: rule, label: rule.label, key: o };
			}).filter(Boolean),
			selected: active ? rules[active] : null,
		};
	}, [filter, parent, active]);

	const onRuleChange = useCallback(
		newRule => {
			const { FilterSet } = newRule;

			if (filter instanceof FilterSet) {
				filter.setActiveRule(newRule);
			} else {
				const newFilter = new FilterSet(parent, {});

				newFilter.setActiveRule(newRule);

				parent.replaceFilterSet(filter, newFilter);
			}
		},
		[filter, parent]
	);

	return (
		<div>
			<Input.Select
				options={options}
				value={selected}
				placeholder={t('placeholder')}
				onChange={onRuleChange}
			/>
		</div>
	);
}

ComponentRegistry.register(s => s instanceof FilterSetRule, FilterRule);
