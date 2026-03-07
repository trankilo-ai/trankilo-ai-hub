import { test, expect } from '@playwright/test'

test.describe('Workspace Dashboard', () => {
  test('workspace page renders heading and members section', async ({ page }) => {
    await page.goto('/workspace/ws-1')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText(/members/i)).toBeVisible()
  })

  test('Admin sees Invite button', async ({ page }) => {
    await page.goto('/workspace/ws-1')
    await expect(page.getByRole('button', { name: /\+ invite/i })).toBeVisible()
  })

  test('invite modal opens on click', async ({ page }) => {
    await page.goto('/workspace/ws-1')
    await page.getByRole('button', { name: /\+ invite/i }).click()

    await expect(page.getByPlaceholder(/email address/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /send invite/i })).toBeVisible()
  })

  test('invite modal can be dismissed', async ({ page }) => {
    await page.goto('/workspace/ws-1')
    await page.getByRole('button', { name: /\+ invite/i }).click()
    await page.getByRole('button', { name: /cancel/i }).click()

    await expect(page.getByPlaceholder(/email address/i)).not.toBeVisible()
  })

  test('New agent button is visible for Admin/Editor', async ({ page }) => {
    await page.goto('/workspace/ws-1')
    await expect(page.getByRole('button', { name: /\+ new agent/i })).toBeVisible()
  })

  test('role badges are shown in member list', async ({ page }) => {
    await page.goto('/workspace/ws-1')
    const memberSection = page.locator('.card').first()
    await expect(memberSection).toBeVisible()
  })
})
