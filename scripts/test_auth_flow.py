#!/usr/bin/env python3
"""
Selenium test for Ciyex authentication flow
Tests the OAuth2/Keycloak login process with visible browser
"""

import time
import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Configuration
FRONTEND_URL = "http://localhost:3000"
BACKEND_URL = "http://localhost:8080"
KEYCLOAK_URL = "https://aran-stg.zpoa.com"

# Test credentials
KEYCLOAK_USERNAME = "alice@example.com"
KEYCLOAK_PASSWORD = "Password@123"

def setup_driver():
    """Setup Chrome driver with visible browser"""
    print("🔧 Setting up Chrome driver...")
    
    chrome_options = Options()
    # Make browser visible for debugging
    # chrome_options.add_argument('--headless')  # Commented out to see the browser
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    # Accept insecure certificates for staging environment
    chrome_options.add_argument('--ignore-certificate-errors')
    chrome_options.add_argument('--allow-insecure-localhost')
    
    # Prevent crashes
    chrome_options.add_argument('--disable-extensions')
    chrome_options.add_argument('--disable-infobars')
    chrome_options.add_argument('--remote-debugging-port=9222')
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        driver.set_page_load_timeout(30)
        driver.implicitly_wait(5)
        print("✅ Chrome driver initialized")
        return driver
    except Exception as e:
        print(f"❌ Failed to initialize Chrome driver: {e}")
        print("💡 Make sure Chrome and chromedriver are installed:")
        print("   sudo apt-get install chromium-browser chromium-chromedriver")
        sys.exit(1)

def test_frontend_loads(driver):
    """Test if frontend application loads"""
    print(f"\n📱 Testing frontend at {FRONTEND_URL}...")
    
    try:
        driver.get(FRONTEND_URL)
        time.sleep(2)
        
        print(f"✅ Frontend loaded: {driver.title}")
        print(f"   Current URL: {driver.current_url}")
        return True
    except Exception as e:
        print(f"❌ Frontend failed to load: {e}")
        return False

def test_login_flow(driver):
    """Test the complete login flow"""
    print("\n🔐 Testing login flow...")
    
    try:
        # Wait for page to load
        time.sleep(3)
        
        # Look for "Sign in with Aran" button (Keycloak SSO)
        print("   Looking for 'Sign in with Aran' button...")
        possible_selectors = [
            "//button[contains(text(), 'Sign in with Aran')]",
            "//button[contains(text(), 'Sign in with aran')]",
            "//button[contains(text(), 'SIGN IN WITH ARAN')]",
            "//a[contains(text(), 'Sign in with Aran')]",
            "//button[contains(text(), 'Aran')]",
            "//button[contains(text(), 'Login')]",
            "//button[contains(text(), 'Sign In')]",
            "//a[contains(text(), 'Login')]",
            "//a[contains(text(), 'Sign In')]",
            "//button[contains(@class, 'login')]",
            "//button[contains(@class, 'sign-in')]",
        ]
        
        login_button = None
        for selector in possible_selectors:
            try:
                login_button = driver.find_element(By.XPATH, selector)
                print(f"   ✅ Found login button with selector: {selector}")
                print(f"   Button text: {login_button.text}")
                break
            except NoSuchElementException:
                continue
        
        # If no button found, list all buttons on the page for debugging
        if not login_button:
            print("   ⚠️  No matching button found. Listing all buttons on page:")
            try:
                all_buttons = driver.find_elements(By.TAG_NAME, "button")
                for i, btn in enumerate(all_buttons[:10]):  # Show first 10 buttons
                    try:
                        print(f"      Button {i+1}: '{btn.text}' (class: {btn.get_attribute('class')})")
                    except:
                        pass
            except:
                print("      Could not list buttons")
        
        if not login_button:
            print("   ⚠️  No login button found, checking if already on login page...")
            # Check if we're already on Keycloak login page
            if "keycloak" in driver.current_url.lower() or "auth" in driver.current_url.lower():
                print("   ✅ Already on authentication page")
            else:
                print("   📸 Taking screenshot for debugging...")
                try:
                    driver.save_screenshot("/tmp/ciyex_no_login_button.png")
                    print("   💾 Screenshot saved to: /tmp/ciyex_no_login_button.png")
                except:
                    print("   ⚠️  Could not save screenshot")
                try:
                    print(f"   Current page source preview:\n{driver.page_source[:500]}...")
                except:
                    print("   ⚠️  Could not get page source")
                return False
        else:
            print("   🖱️  Clicking login button...")
            login_button.click()
            time.sleep(3)
        
        # Wait for redirect to Keycloak
        print(f"   Waiting for Keycloak redirect...")
        WebDriverWait(driver, 10).until(
            lambda d: "keycloak" in d.current_url.lower() or 
                     "aran-stg.zpoa.com" in d.current_url.lower() or
                     "login" in d.current_url.lower()
        )
        
        print(f"   ✅ Redirected to: {driver.current_url}")
        
        # Fill in Keycloak login form
        print("   🔑 Filling in credentials...")
        
        # Wait for username field
        username_field = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "username"))
        )
        username_field.clear()
        username_field.send_keys(KEYCLOAK_USERNAME)
        print(f"   ✅ Entered username: {KEYCLOAK_USERNAME}")
        
        # Fill password
        password_field = driver.find_element(By.ID, "password")
        password_field.clear()
        password_field.send_keys(KEYCLOAK_PASSWORD)
        print(f"   ✅ Entered password")
        
        # Click submit
        submit_button = driver.find_element(By.ID, "kc-login")
        print("   🖱️  Clicking submit...")
        submit_button.click()
        
        # Wait for redirect back to application
        time.sleep(5)
        
        print(f"   ✅ After login, current URL: {driver.current_url}")
        
        # Check if login was successful
        if "localhost:3000" in driver.current_url:
            print("   ✅ Successfully redirected back to application!")
            
            # Check for authentication token in cookies or localStorage
            cookies = driver.get_cookies()
            print(f"   🍪 Cookies: {len(cookies)} found")
            for cookie in cookies:
                if 'token' in cookie['name'].lower() or 'session' in cookie['name'].lower():
                    print(f"      - {cookie['name']}: {cookie['value'][:20]}...")
            
            # Check localStorage
            try:
                local_storage = driver.execute_script("return window.localStorage;")
                print(f"   💾 LocalStorage items: {len(local_storage)}")
                for key in local_storage:
                    if 'token' in key.lower():
                        print(f"      - {key}: {local_storage[key][:20]}...")
            except:
                pass
            
            return True
        else:
            print(f"   ⚠️  Unexpected URL after login: {driver.current_url}")
            driver.save_screenshot("/tmp/ciyex_after_login.png")
            print("   💾 Screenshot saved to: /tmp/ciyex_after_login.png")
            return False
            
    except TimeoutException as e:
        print(f"   ❌ Timeout: {e}")
        try:
            driver.save_screenshot("/tmp/ciyex_timeout.png")
            print("   💾 Screenshot saved to: /tmp/ciyex_timeout.png")
        except:
            print("   ⚠️  Could not save screenshot")
        return False
    except Exception as e:
        print(f"   ❌ Error during login: {e}")
        try:
            driver.save_screenshot("/tmp/ciyex_error.png")
            print("   💾 Screenshot saved to: /tmp/ciyex_error.png")
        except:
            print("   ⚠️  Could not save screenshot")
        return False

def test_api_call(driver):
    """Test making an authenticated API call"""
    print("\n🌐 Testing authenticated API call...")
    
    try:
        # Prefer making the API call from the browser context using the app's auth token
        # Try to locate an access token in localStorage
        try:
            local_storage = driver.execute_script("return window.localStorage;")
        except Exception:
            local_storage = {}

        token_value = None
        if isinstance(local_storage, dict):
            for key in local_storage:
                k = key.lower()
                if 'access' in k or 'token' in k or 'id_token' in k or 'keycloak' in k or 'auth' in k:
                    token_value = local_storage[key]
                    print(f"   🔎 Found token-like key in localStorage: {key}")
                    break

        if not token_value:
            print("   ⚠️  No token found in localStorage. Cannot perform authenticated API call from browser.")
            print("   Tip: the app usually stores an access token in localStorage after login; ensure login completed successfully.")
            return False

        # Use fetch from browser to include Authorization header (so same-origin/localStorage context is used)
        script = """
            const url = arguments[0];
            const token = arguments[1];
            const callback = arguments[arguments.length-1];
            fetch(url, {method: 'GET', headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }})
                .then(async res => {
                    const text = await res.text();
                    callback({status: res.status, body: text});
                })
                .catch(err => callback({error: err.toString()}));
        """

        try:
            result = driver.execute_async_script(script, f"{BACKEND_URL}/api/patients", token_value)
        except Exception as e:
            print(f"   ❌ Error executing fetch in browser: {e}")
            return False

        if not result:
            print("   ⚠️  No result from fetch call")
            return False

        if 'error' in result:
            print(f"   ❌ Fetch error: {result['error']}")
            return False

        status = result.get('status')
        body = result.get('body', '') or ''

        print(f"   ↩️  API response status: {status}")
        if status == 200:
            if '{' in body:
                print("   ✅ API returned JSON response (successful)")
                print(f"   Response preview: {body[:200]}...")
                return True
            else:
                print(f"   ⚠️  API returned non-JSON body: {body[:200]}...")
                return False
        elif status in (401, 403):
            print(f"   ⚠️  API returned {status} - Authentication/authorization failed")
            return False
        else:
            print(f"   ⚠️  Unexpected API status {status} - body preview: {body[:200]}...")
            return False
            
    except Exception as e:
        print(f"   ❌ Error testing API: {e}")
        return False

def main():
    """Main test execution"""
    print("=" * 60)
    print("🧪 Ciyex Authentication Flow Test")
    print("=" * 60)
    
    driver = None
    try:
        driver = setup_driver()
        
        # Run tests
        results = {
            "Frontend Loads": test_frontend_loads(driver),
            "Login Flow": False,
            "API Call": False
        }
        
        if results["Frontend Loads"]:
            results["Login Flow"] = test_login_flow(driver)
            
            if results["Login Flow"]:
                results["API Call"] = test_api_call(driver)
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 Test Results Summary")
        print("=" * 60)
        
        for test_name, passed in results.items():
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"{status} - {test_name}")
        
        all_passed = all(results.values())
        
        if all_passed:
            print("\n🎉 All tests passed!")
        else:
            print("\n⚠️  Some tests failed. Check screenshots in /tmp/ for debugging.")
        
        # Keep browser open for inspection
        print("\n⏸️  Browser will stay open for 30 seconds for inspection...")
        time.sleep(30)
        
        return 0 if all_passed else 1
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        return 1
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        if driver:
            print("\n🔚 Closing browser...")
            driver.quit()

if __name__ == "__main__":
    sys.exit(main())
