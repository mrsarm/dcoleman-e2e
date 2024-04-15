const { test, describe, expect } = require('@playwright/test');
const {
  DCOLEMAN_MASTER_TOKEN,
  DCOLEMAN_TASKS_VIEWER_URL,
  OPEN_STATES,
  createTask,
  login,
} = require('./init');

describe('viewer', () => {
  test('open task in viewer', async ({ page }) => {
    await login(page);

    const randomTitle = `Title ${Math.floor(Math.random() * 10000)}`;
    const randomState = OPEN_STATES[Math.floor(Math.random() * OPEN_STATES.length)];
    await createTask(page, randomTitle, randomState);

    // Wait for success response
    await page.waitForURL("**/admin/mtasks/task/");

    const rows = await page.locator('table#result_list tbody tr').all();
    let taskNum;
    for (const row of rows) {
      const [num, title] = await row.evaluate(el => {
        const num = el.querySelector('th.field-number a');
        const title = el.querySelector('td.field-title a');
        return [
          num?.innerText.trim(),
          title?.innerText.trim(),
        ];
      });
      if (title === randomTitle) {
        taskNum = num;
      }
    }
    expect(taskNum).toBeDefined();

    await page.goto(`${DCOLEMAN_TASKS_VIEWER_URL}/${taskNum}?t=${DCOLEMAN_MASTER_TOKEN}`);
    await expect(page).toHaveTitle(`Django Coleman - Task Viewer | Task #${taskNum}`);
    await expect(page.locator('form h2')).toHaveText(`Order Number: #${taskNum}`);
    await expect(page.locator(`//form//input[@value="${randomTitle}"]`)).toBeDefined();
    await expect(page.locator('//nav/ol/li/strong')).toHaveText(randomState);
  });

  test('open not found task in viewer', async ({ page }) => {
    const orderNum = Math.floor(Math.random() * 10000);
    const response = await page.goto(`${DCOLEMAN_TASKS_VIEWER_URL}/${orderNum}?t=${DCOLEMAN_MASTER_TOKEN}`);
    expect(response.status()).toBe(404);
    await expect(page).toHaveTitle(`Django Coleman - Task Viewer | Order Not Found`);
    await expect(page.locator('div.alert-danger h4')).toHaveText('Ups!');
    await expect(page.locator('div.alert-danger p strong')).toHaveText('Order Not Found');
  });

  test('open order without token in viewer not auth', async ({ page }) => {
    const orderNum = Math.floor(Math.random() * 10000);
    const response = await page.goto(`${DCOLEMAN_TASKS_VIEWER_URL}/${orderNum}`);
    expect(response.status()).toBe(401);
    await expect(page).toHaveTitle(`Django Coleman - Task Viewer | Unauthorized Access`);
    await expect(page.locator('div.alert-danger h4')).toHaveText('Ups!');
    await expect(page.locator('div.alert-danger p strong')).toHaveText('Unauthorized Access');
  });
});
