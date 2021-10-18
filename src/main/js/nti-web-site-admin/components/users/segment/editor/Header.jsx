import { scoped } from '@nti/lib-locale';
import { Input } from '@nti/web-commons';
import { Button } from '@nti/web-core';

import { SegmentStore } from '../Store';

const t = scoped('nti-web-site-admin.components.users.segment.editor.Header', {
	save: 'Save',
});

const Container = styled.div`
	padding: 20px 30px 30px;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
`;

const Controls = styled.div`
	display: inline-flex;
	flex-direction: row;
	align-items: center;
`;

const Title = styled(Input.Text)`
	&:global(.nti-text-input) {
		display: block;
		height: auto;
		padding: 0 0.625rem;
		border: none;
		font-size: 2rem;
		box-shadow: 0 1px 0 0 var(--border-grey-light);
	}
`;

export function Header() {
	const { title, setTitle, save } = SegmentStore.useProperties();

	return (
		<Container>
			<Title value={title} onChange={setTitle} />
			<Controls>
				<Button rounded onClick={save} busy={save.running}>
					{t('save')}
				</Button>
			</Controls>
		</Container>
	);
}
