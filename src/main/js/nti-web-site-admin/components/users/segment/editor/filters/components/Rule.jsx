import React from 'react';

import { ComponentRegistry, Default } from './Registry';

export function FilterRule({ filter, parent }) {
	return <div>Filter Rule</div>;
}

ComponentRegistry.register(Default, FilterRule);
