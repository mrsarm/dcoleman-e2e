const { test, describe, expect } = require('@playwright/test');

const OPEN_STATES = ['To Do', 'In Progress', 'Blocked'];

async function login(page) {
  // Open login page
  await page.goto('http://localhost:8000/admin/login/');

  // Login
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'admin1234');
  await page.click('input[type="submit"]');

  // Wait for Admin dashboard
  await page.waitForURL("**/admin/");
  await expect(page).toHaveTitle(/Task Manager/);
}

describe('login', () => {
  test('login to dashboard', async ({ page }) => {
    await login(page);
  });
});

describe('tasks', () => {

  async function createTask(page, taskTitle, taskState) {
    // Navigate to Tasks page
    await page.click('a[href="/admin/mtasks/task/"]');

    // Click to create a task
    await page.click('a[href="/admin/mtasks/task/add/"]');

    // Fill form with random data
    await page.fill('input[name="title"]', taskTitle);
    await page.selectOption('select[name="state"]', { label: taskState });

    // Submit form
    await page.click('//input[@type="submit" and @value="Save"]');
  }

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
