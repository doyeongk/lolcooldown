import { test, expect } from "@playwright/test"

test.describe("Visual regression tests", () => {
  test("home page renders correctly", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveScreenshot("home.png", { fullPage: true })
  })

  test("play page renders correctly", async ({ page }) => {
    await page.goto("/play")
    // Wait for game to load
    await page.waitForSelector("[data-testid='game-container']", { timeout: 10000 }).catch(() => {
      // If no test id, wait for any content
    })
    await expect(page).toHaveScreenshot("play.png", { fullPage: true })
  })
})
