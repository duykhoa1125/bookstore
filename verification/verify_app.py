
from playwright.sync_api import sync_playwright

def verify_app_loads():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the app (assuming it's running on localhost:5173 which is default for Vite)
            # However, I need to start the app first.
            page.goto('http://localhost:5173')
            page.wait_for_load_state('networkidle')

            # Check title or some element
            print(f'Page title: {page.title()}')

            # Take a screenshot
            page.screenshot(path='verification/app_loaded.png')
            print('Screenshot taken.')

        except Exception as e:
            print(f'Error: {e}')
        finally:
            browser.close()

if __name__ == '__main__':
    verify_app_loads()
