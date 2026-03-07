import { test, expect } from '@playwright/test'

test.describe('Playground', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workspace/ws-1/agent/agent-1')
    await page.getByRole('button', { name: /playground/i }).click()
  })

  test('shows empty state with sloth emoji', async ({ page }) => {
    await expect(page.locator('text=🦥')).toBeVisible()
    await expect(page.getByText(/send a message to test/i)).toBeVisible()
  })

  test('message input and Send button are present', async ({ page }) => {
    await expect(page.getByPlaceholder(/type a message/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /send/i })).toBeVisible()
  })

  test('Send button is disabled when input is empty', async ({ page }) => {
    const sendBtn = page.getByRole('button', { name: /send/i })
    await expect(sendBtn).toBeDisabled()
  })

  test('typing a message enables Send button', async ({ page }) => {
    await page.getByPlaceholder(/type a message/i).fill('Hello agent')
    const sendBtn = page.getByRole('button', { name: /send/i })
    await expect(sendBtn).toBeEnabled()
  })
})
