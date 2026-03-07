import { test, expect } from '@playwright/test'

test.describe('Agent Detail — Agentfile editor', () => {
  test('agent detail page renders tab navigation', async ({ page }) => {
    await page.goto('/workspace/ws-1/agent/agent-1')

    await expect(page.getByRole('button', { name: /agentfile/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /playground/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /sdk monitor/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /activity log/i })).toBeVisible()
  })

  test('version history tab is visible in editor view', async ({ page }) => {
    await page.goto('/workspace/ws-1/agent/agent-1')

    await expect(page.getByText(/version history/i)).toBeVisible()
  })

  test('switching to Playground tab shows playground UI', async ({ page }) => {
    await page.goto('/workspace/ws-1/agent/agent-1')

    await page.getByRole('button', { name: /playground/i }).click()
    await expect(page.getByText(/send a message/i)).toBeVisible()
    await expect(page.getByPlaceholder(/type a message/i)).toBeVisible()
  })

  test('switching to Activity Log tab shows log UI', async ({ page }) => {
    await page.goto('/workspace/ws-1/agent/agent-1')

    await page.getByRole('button', { name: /activity log/i }).click()
    await expect(page.getByText(/activity log/i)).toBeVisible()
  })

  test('Viewer role shows read-only badge', async ({ page }) => {
    await page.goto('/workspace/ws-1/agent/agent-1')
    await expect(page.getByText(/view only/i)).toBeVisible()
  })
})
