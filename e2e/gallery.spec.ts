import { test, expect } from '@playwright/test'

test.use({
  storageState: { cookies: [], origins: [] },
})

test.describe('Public Gallery', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, '__MOCK_AUTH__', { value: true })
    })
  })

  test('gallery page has heading and search bar', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /agent registry/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search agents/i)).toBeVisible()
  })

  test('search input accepts text', async ({ page }) => {
    await page.goto('/')

    const searchInput = page.getByPlaceholder(/search agents/i)
    await searchInput.fill('CRM')
    await expect(searchInput).toHaveValue('CRM')
  })

  test('platform filter renders all options', async ({ page }) => {
    await page.goto('/')

    const select = page.locator('select')
    await expect(select).toBeVisible()
    await expect(select.locator('option[value=""]')).toHaveText('All platforms')
    await expect(select.locator('option[value="LangChain"]')).toBeVisible()
  })

  test('shows sloth emoji in heading', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=🦥')).toBeVisible()
  })
})
