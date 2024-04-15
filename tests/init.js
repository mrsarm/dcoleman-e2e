const { expect } = require('@playwright/test');

export const OPEN_STATES = ['To Do', 'In Progress', 'Blocked'];

export const DCOLEMAN_URL = process.env.DCOLEMAN_URL || 'http://localhost:8000';
export const DCOLEMAN_TASKS_VIEWER_URL = process.env.DCOLEMAN_TASKS_VIEWER_URL || 'http://localhost:8888';
export const DCOLEMAN_MASTER_TOKEN = process.env.DCOLEMAN_MASTER_TOKEN || 'porgs';

export async function login(page) {
  // Open login page
  await page.goto(`${DCOLEMAN_URL}/admin/login/`);

  // Login
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'admin1234');
  await page.click('input[type="submit"]');

  // Wait for Admin dashboard
  await page.waitForURL("**/admin/");
  await expect(page).toHaveTitle(/Task Manager/);
}

export async function createTask(page, taskTitle, taskState) {
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
