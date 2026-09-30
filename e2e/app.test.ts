import { expect, test, type Page } from '@playwright/test';

/** Smoke test for the SPEC §9 acceptance checklist, run in order on one fresh jar. */
test.describe.configure({ mode: 'serial' });

async function addTask(page: Page, title: string, minutes: number) {
	await page.goto('/jar/new');
	await page.getByLabel('What needs doing?').fill(title);
	await page.getByRole('spinbutton').fill(String(minutes));
	await page.getByRole('button', { name: 'Add to the jar' }).click();
	await expect(page).toHaveURL('/jar');
	await expect(page.getByText(title)).toBeVisible();
}

test('empty states: empty jar and nothing fits', async ({ page }) => {
	await page.goto('/jar');
	await expect(
		page.getByText('The jar is empty. Add a few small tasks to get started.')
	).toBeVisible();

	await page.goto('/');
	await expect(page.getByText('0 in the jar')).toBeVisible();
	await page.getByRole('button', { name: 'Up to 5 minutes' }).click();
	await expect(page.getByRole('heading', { name: 'Nothing fits in 5 min.' })).toBeVisible();
	await expect(page.getByText('Enjoy the break!')).toBeVisible();
	await page.getByRole('link', { name: 'Add a quick task' }).click();
	await expect(page).toHaveURL('/jar/new');
});

test('the 30-minute rule holds in the UI and on the server', async ({ page, request }) => {
	await page.goto('/jar/new');
	await page.getByLabel('What needs doing?').fill('Clean out the garage');
	await page.getByRole('spinbutton').fill('45');
	await expect(page.getByRole('alert')).toContainText('Too big! Split it into smaller tasks.');
	await expect(page.getByRole('button', { name: 'Add to the jar' })).toBeDisabled();

	await page.getByRole('button', { name: '30 minutes' }).click();
	await expect(page.getByRole('alert')).toHaveCount(0);
	await page.getByLabel('What needs doing?').fill('');
	await page.getByRole('button', { name: 'Add to the jar' }).click();
	await expect(page.getByText('Give it a name first.')).toBeVisible();

	const response = await request.post('/jar/new', {
		form: { title: 'Sneaky big task', minutes: '45' },
		headers: { origin: 'http://localhost:4173', accept: 'application/json' }
	});
	expect((await response.json()).status).toBe(400);
	await page.goto('/jar');
	await expect(page.getByText('Sneaky big task')).toHaveCount(0);
});

test('tasks can be added, edited and deleted', async ({ page }) => {
	await addTask(page, 'Water the plants', 5);
	await addTask(page, 'Wipe the counters', 10);
	await addTask(page, 'Typo tsak', 20);

	await page.getByRole('link', { name: 'Edit Typo tsak' }).click();
	await page.getByLabel('What needs doing?').fill('Clean out the fridge');
	await page.getByRole('button', { name: 'Save changes' }).click();
	await expect(page).toHaveURL('/jar');
	await expect(page.getByText('Clean out the fridge')).toBeVisible();

	await addTask(page, 'Delete me', 5);
	await page.getByRole('link', { name: 'Edit Delete me' }).click();
	await page.getByRole('button', { name: 'Delete task' }).click();
	await page.getByRole('button', { name: 'Yes, delete' }).click();
	await expect(page).toHaveURL('/jar');
	await expect(page.getByText('Delete me')).toHaveCount(0);

	// Sorted by duration, then title.
	await expect(page.locator('.row-title')).toHaveText([
		'Water the plants',
		'Wipe the counters',
		'Clean out the fridge'
	]);
	await expect(page.getByText('3 tasks waiting to be drawn.')).toBeVisible();
});

test('draws only fitting tasks; skip excludes; nothing else fits', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('3 in the jar')).toBeVisible();
	await page.getByRole('button', { name: 'Up to 5 minutes' }).click();
	await expect(page.getByText('Shuffling…')).toBeVisible();
	await expect(page.getByText('Your task')).toBeVisible();
	await expect(page.locator('.task-title')).toHaveText('Water the plants');
	await expect(page.getByText('5 min or less')).toBeVisible();

	await page.getByRole('button', { name: 'Skip, pull another' }).click();
	await expect(page.getByRole('heading', { name: 'Nothing else fits in 5 min.' })).toBeVisible();
	await page.getByRole('link', { name: 'Try a longer time' }).click();
	await expect(page).toHaveURL('/');
});

test('take it → Go! → open tasks → done', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Up to 15 minutes' }).click();
	await expect(page.getByText('Fits your 15 minutes')).toBeVisible();
	const title = await page.locator('.task-title').textContent();
	expect(['Water the plants', 'Wipe the counters']).toContain(title);

	await page.getByRole('button', { name: 'Take it' }).click();
	await expect(page.getByRole('heading', { name: 'Go!' })).toBeVisible();
	await expect(page.getByText('You took')).toBeVisible();
	// Advances on its own after about 1.8 s.
	await expect(page).toHaveURL('/open', { timeout: 4000 });
	await expect(page.locator('.row-title')).toHaveText([title!]);
	await expect(page.getByText('Taken today')).toBeVisible();

	// Live counts: tab badge and home pills.
	await expect(page.getByLabel('1 open')).toBeVisible();
	await page.getByRole('link', { name: 'Draw' }).click();
	await expect(page.getByText('2 in the jar')).toBeVisible();
	await page.getByRole('link', { name: '1 open →' }).click();

	await page.getByRole('button', { name: `Mark ${title} as done` }).click();
	await expect(page.getByText('All done!')).toBeVisible();
	await expect(page.getByText('Nothing open. Got a few minutes?')).toBeVisible();
	await expect(page.getByLabel('1 open')).toHaveCount(0);
});

test('see open tasks button skips the Go! wait', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Up to 30 minutes' }).click();
	await page.getByRole('button', { name: 'Take it' }).click();
	await page.getByRole('link', { name: 'See open tasks →' }).click();
	await expect(page).toHaveURL('/open');
	await expect(page.locator('.row')).toHaveCount(1);
});

test('reduced motion skips the shuffle', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/');
	await page.getByRole('button', { name: 'Up to 30 minutes' }).click();
	await expect(page.getByText('Your task')).toBeVisible();
	await expect(page.getByText('Shuffling…')).toHaveCount(0);
	const animation = await page
		.locator('.card-slot > .card')
		.evaluate((el) => getComputedStyle(el).animationName);
	expect(animation).toBe('tj-fade-in');
	await page.getByRole('button', { name: 'Back' }).click();
	await expect(page).toHaveURL('/');
});

test('dark theme follows the system setting', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'dark' });
	await page.goto('/');
	const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
	expect(bg).toBe('rgb(23, 18, 43)');
});

test('home splits into two columns on a landscape tablet', async ({ page }) => {
	await page.setViewportSize({ width: 1180, height: 820 });
	await page.goto('/');
	const headline = await page
		.getByRole('heading', { name: 'How much time do you have?' })
		.boundingBox();
	const tile = await page.getByRole('button', { name: 'Up to 30 minutes' }).boundingBox();
	expect(tile!.x).toBeGreaterThan(headline!.x + headline!.width);
	expect(tile!.y + tile!.height).toBeLessThanOrEqual(820);
});
