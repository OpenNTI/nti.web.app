import { Typography } from '@nti/web-core';

import SearchInfo from '../../../common/SearchInfo';

import { CreateSegmentButton } from './CreateButton';
import { UserSegmentsStore } from './Store';
import t from './strings';

const Header = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 20px 30px 10px;
	gap: 0.5rem;

	& > * {
		white-space: nowrap;
	}
`;

export const UserSegmentHeaderPlaceholder = () => (
	<Header>
		<Typography type="header-one-alt">{t('header')}</Typography>
	</Header>
);

export const UserSegmentsHeader = () => {
	const { searchParam } = UserSegmentsStore.useProperties();

	return (
		<>
			<Header>
				<Typography type="header-one-alt">{t('header')}</Typography>
				<CreateSegmentButton />
			</Header>
			<SearchInfo searchTerm={searchParam} />
		</>
	);
};
