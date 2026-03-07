import { test, expect } from '@playwright/test'

test.describe('Login page', () => {
  test('renders logo and all three sign-in options', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByRole('img', { name: 'trankilo-ai' })).toBeVisible()

    await expect(page.getByRole('button', { name: /google/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /github/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()

    await expect(page.getByPlaceholder('Email')).toBeVisible()
    await expect(page.getByPlaceholder('Password')).toBeVisible()
  })

  test('shows register toggle', async ({ page }) => {
    await page.goto('/login')

    await page.getByRole('button', { name: /don't have an account/i }).click()
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
  })

  test('unauthenticated user visiting / is redirected to /login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated user visiting workspace is redirected to /login', async ({ page }) => {
    await page.goto('/workspace/some-id')
    await expect(page).toHaveURL(/\/login/)
  })
})
