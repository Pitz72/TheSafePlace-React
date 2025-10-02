from playwright.sync_api import sync_playwright, Page, expect
import time

def run_verification(page: Page):
    """
    This script verifies the core bug fixes, including a wait condition
    to prevent race conditions when interacting with the inventory.
    """
    try:
        # 1. Navigate to the application
        page.goto("http://localhost:5173", timeout=15000)

        # 2. Aggressively skip the boot sequence
        new_game_locator = page.get_by_text("[N] Nuova Partita")
        for i in range(20):
            if new_game_locator.is_visible():
                break
            page.locator("body").click(force=True, timeout=500)
            time.sleep(0.5)

        # 3. Start a new game by pressing Enter
        expect(new_game_locator).to_be_visible(timeout=5000)
        page.keyboard.press("Enter")

        # 4. Handle Character Creation
        confirmation_prompt = page.get_by_text("Premi [ENTER] per iniziare l'avventura")
        expect(confirmation_prompt).to_be_visible(timeout=15000)
        page.keyboard.press("Enter")

        # 5. Wait for the main game screen and verify initial state
        survival_panel_title = page.get_by_role("heading", name="SOPRAVVIVENZA")
        expect(survival_panel_title).to_be_visible(timeout=10000)

        # Verify Survival Stats
        satiety_locator = page.locator("li", has_text="Sazietà:")
        expect(satiety_locator).not_to_contain_text("NaN")

        # Verify Game Clock
        time_locator = page.locator("li", has_text="Ora:")
        expect(time_locator).not_to_contain_text("NaN:NaN")

        # 6. Equip an item
        page.keyboard.press("i")
        inventory_title = page.get_by_role("heading", name="INVENTARIO")
        expect(inventory_title).to_be_visible()
        page.keyboard.press("Enter")

        equip_action_locator = page.get_by_text("[E] EQUIPAGGIA")
        expect(equip_action_locator).to_be_visible()

        page.keyboard.press("e")

        # *** CRITICAL STEP ***
        # Wait for the action menu to disappear to prevent a race condition.
        expect(equip_action_locator).not_to_be_visible()

        # Now it's safe to close the inventory.
        page.keyboard.press("i")
        expect(inventory_title).not_to_be_visible()

        # 7. Verify the item is equipped
        weapon_equipment_locator = page.locator("div", has_text="ARMA:")
        expect(weapon_equipment_locator).to_contain_text("Coltello da sopravvivenza")

        # 8. Take the final screenshot
        screenshot_path = "jules-scratch/verification/verification.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

    except Exception as e:
        print(f"An error occurred during verification: {e}")
        error_screenshot_path = "jules-scratch/verification/error_screenshot.png"
        page.screenshot(path=error_screenshot_path)
        raise

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            run_verification(page)
        finally:
            browser.close()

if __name__ == "__main__":
    main()