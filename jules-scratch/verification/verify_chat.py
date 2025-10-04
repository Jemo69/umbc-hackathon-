from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the home page to sign up/sign in
        page.goto("http://localhost:3000/")

        # Click the "Get Started" button to go to the signup page
        page.get_by_role("link", name="Get Started").click()
        expect(page).to_have_url("http://localhost:3000/sign-up")

        # Fill in the sign-up form
        import uuid
        unique_id = uuid.uuid4()
        page.get_by_label("Name").fill("Jules")
        page.get_by_label("Email").fill(f"jules-{unique_id}@test.com")
        page.locator("#input-password").fill("password123")
        page.locator("#input-confirm-password").fill("password123")
        page.get_by_label("I agree to the Terms of Service").check()
        page.get_by_role("button", name="Create Account").click()

        # Wait for navigation to the dashboard after successful sign-up
        expect(page).to_have_url("http://localhost:3000/dashboard", timeout=20000)

        # Navigate to the chat page
        page.goto("http://localhost:3000/chat")
        expect(page).to_have_url("http://localhost:3000/chat")

        # Find the chat input and send a message
        chat_input = page.get_by_placeholder("Ask Edutron anything...")
        expect(chat_input).to_be_visible()
        chat_input.fill("Hello, Edutron!")
        page.get_by_role("button", name="Send message").click()

        # Wait for the message to appear in the chat
        expect(page.get_by_text("Hello, Edutron!")).to_be_visible(timeout=10000)

        # Wait for AI response to appear
        expect(page.get_by_text("i've added \"Hello, Edutron!\" to your task list. want to set a subject or priority?")).to_be_visible(timeout=20000)

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/chat_verification.png")

        print("Verification script completed successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)