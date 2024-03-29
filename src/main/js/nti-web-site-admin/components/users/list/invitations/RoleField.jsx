import { Select } from '@nti/web-commons';

import t from './strings';
import { Label, Row } from './common-parts';

export function RoleField({ value, onChange }) {
	return (
		<Row className="invite-people-role-field">
			<Label>{t('role')}</Label>
			<Select
				onChange={onChange}
				value={value}
				className="invite-select"
				css={css`
					border: none;
					box-shadow: none;
					line-height: 2;

					:global(.icon-chevron-down) {
						right: 5px;
					}
				`}
			>
				<option value="learner">Learner</option>
				<option value="admin">Administrator</option>
			</Select>
		</Row>
	);
}
