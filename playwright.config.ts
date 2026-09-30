import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
	testDir: 'e2e',
	// One shared database, so the flows run in order.
	workers: 1,
	fullyParallel: false,
	use: {
		baseURL: `http://localhost:${PORT}`,
		...devices['iPhone 13'],
		browserName: 'chromium'
	},
	webServer: {
		// Production build against a fresh, throwaway database.
		command: 'rm -rf .e2e && npm run build && node build',
		port: PORT,
		env: { PORT: String(PORT), DATABASE_URL: '.e2e/taskjar.db' },
		reuseExistingServer: false,
		timeout: 180_000
	}
});
