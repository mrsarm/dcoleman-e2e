const { test, describe, expect } = require('@playwright/test');
const {
  OPEN_STATES,
  createTask,
  login,
} = require('./init');


describe('admin login', () => {
  test('login to dashboard', async ({ page }) => {
    await login(page);
  });
});


describe('admin tasks', () => {

  test('create task', async ({ page }) => {
    await login(page);

    const randomTitle = `Title ${Math.floor(Math.random() * 10000)}`;
    const randomState = OPEN_STATES[Math.floor(Math.random() * OPEN_STATES.length)];
    await createTask(page, randomTitle, randomState);

    // Wait for success response
    await page.waitForURL("**/admin/mtasks/task/");

    // Check if order exists in the list
    const rows = await page.locator('table#result_list tbody tr').all();
    let titleFound = false;
    for (const row of rows) {
      const [title, state] = await row.evaluate(el => {
        const title = el.querySelector('td.field-title a');
        const state = el.querySelector('td.field-state');
        return [
          title?.innerText.trim(),
          state?.innerText.trim(),
        ];
      });
      if (title === randomTitle) {
        titleFound = true;
        expect(state).toEqual(randomState);
      }
    }
    expect(titleFound).toBeTruthy();
  });

  test('validate duplicated task', async ({ page }) => {
    await login(page);

    const randomTitle = `Title ${Math.floor(Math.random() * 10000)}`;
    const randomState = OPEN_STATES[Math.floor(Math.random() * OPEN_STATES.length)];
    await createTask(page, randomTitle, randomState);
    // try to create it for second time, with or without the same open state
    const randomState2 = OPEN_STATES[Math.floor(Math.random() * OPEN_STATES.length)];
    await createTask(page, randomTitle, randomState2);
    await expect(page.locator('ul.errorlist li'))
      .toHaveText('Open task with this title and no partner already exists.');
  });
});
