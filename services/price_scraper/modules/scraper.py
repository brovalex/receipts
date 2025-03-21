import os
import pandas as pd
import time
import random
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional
from dotenv import load_dotenv

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from fake_useragent import UserAgent

from services.shared.models import ScrapedProduct
# from .database import get_db
from .reference_products_mapping import REFERENCE_PRODUCTS
from services.shared.config import SCREENSHOT_DIR, MIN_DELAY, MAX_DELAY
import requests
import json

# Load environment variables from .env file
load_dotenv()
# Get proxy list from environment variable
# PROXY_LIST: List[str] = os.getenv("PROXY_LIST", "").split(",") if os.getenv("PROXY_LIST") else []

@staticmethod
def get_random_proxy() -> str:
    """Return a random proxy from the proxy list or None if list is empty."""
    # return random.choice(PROXY_LIST) if PROXY_LIST else None
    PROXY_BASE: str = os.getenv("PROXY_BASE", "")
    return f'{PROXY_BASE}:{20000+random.randint(10, 500)}'

class PriceScraper:
    def __init__(self, root_folder='/app/', proxy=None):
        self.root_folder = root_folder
        self.mapping_df = REFERENCE_PRODUCTS
        self.screenshot_dir = f'{self.root_folder}services/price_scraper/tmp/screenshots/'
        os.makedirs(self.screenshot_dir, exist_ok=True)  # Create the directory if it doesn't exist

    # Helper functions
    def get_url(self, query, domain="https://www.foodbasics.ca"):
        """
        Format the query to be used in the URL
        """
        query = query.replace(" ","+")
        website=domain+f"/search?filter={query}&sortOrder=price-asc"
        return website
    
    def get_cheapest(self, items):
        """
        Get the cheapest item from a list of items
        """
        print(f"Getting cheapest of {len(items)} item(s):")
        sorted_items = sorted([item for item in items if item['pricePerWeight'] is not None], key=lambda x: x['pricePerWeight'])
        cheapest = sorted_items[0]
        print(cheapest)
        return cheapest

    def clean_up_item(self, scraped_item: dict) -> dict:
        """
        Clean up the item response to be used in the database
        """
        def get_clean_price(price: str) -> float:
            price = float(price.replace('$', ''))
            return price
        price = get_clean_price(scraped_item['price'])

        def standardize_unit_of_measure(quantity: float, unit_of_measure: str) -> str:
            # Convert quantity and standardize unit of measure
            if unit_of_measure == 'mg':
                return quantity / 1000, 'g'
            elif unit_of_measure == 'kg':
                return quantity * 1000, 'g'
            elif unit_of_measure in ['un', 'ca']:
                return quantity, 'count'
            else:
                return quantity, unit_of_measure

        def get_clean_quantity(weight: str) -> tuple[float, str]:
            if 'x' in weight:
                parts = weight.split('x')
                multiplier = float(parts[0].strip())
                unit = float(parts[1].split()[0])
                quantity = multiplier * unit
                unit_of_measure = parts[1].split()[1]
            else:
                parts = weight.split()
                quantity = float(parts[0])
                unit_of_measure = parts[1]
            return standardize_unit_of_measure(quantity, unit_of_measure)

        quantity, unitOfMeasure = get_clean_quantity(scraped_item['weight'])

        def calculate_price_per_weight(quantity: float, price: float) -> float:
            return price / quantity

        return {
            'name': scraped_item['title'],
            'quantity': quantity,
            'unitOfMeasure': unitOfMeasure,
            'price': price,
            'pricePerWeight': calculate_price_per_weight(quantity, price),
            'referenceUrl': scraped_item['url'],
            'createdAt': datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')
        }
    
    # Driver functions
    def create_driver(self):
        """
        Create a driver for the Chrome browser
        """
        # half-automated
        # Start a real browser session
        options = webdriver.ChromeOptions()
        driver = webdriver.Chrome(options=options)

        # # Set up Chrome options
        # chrome_options = Options()
        # chrome_options.add_argument("--headless")
        # chrome_options.add_argument("--window-size=1280x900")
        # chrome_options.add_argument("--no-sandbox")  # Added for running in Docker
        # chrome_options.add_argument("--disable-dev-shm-usage")  # Added for running in Docker
        # chrome_options.add_argument(f"--user-data-dir=/tmp/chrome-data-{random.randint(0, 999999)}")  # Use unique temp directory
        # chrome_options.add_argument(f"user-agent={UserAgent().random}")
        # random_proxy = get_random_proxy()
        # chrome_options.add_argument(f'--proxy-server={random_proxy}')
        # print(f"Using proxy: {random_proxy}")
        # # Initialize the Chrome driver
        # driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        # # Set viewport size to match window size
        # driver.execute_cdp_cmd('Emulation.setDeviceMetricsOverride', {'width': 1280, 'height': 900, 'deviceScaleFactor': 1, 'mobile': False})
        return driver

    def visit_home_page(self, driver, domain="https://www.foodbasics.ca"):
        """
        Visit the home page first to mimic normal user behavior
        """
        try:
            print(f"Visiting home page: {domain}")
            driver.get(domain)
            # Add a random delay to simulate human behavior
            delay = random.uniform(MIN_DELAY, MAX_DELAY)
            time.sleep(delay)
            self.remove_consent_banner(driver)
            return True
        except Exception as e:
            print(f"Error visiting home page: {e}")
            return False

    def remove_consent_banner(self, driver):
        """
        Remove the consent banner
        """
        try:
            WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.ID, "onetrust-banner-sdk")))
            accept_button = driver.find_element(By.CSS_SELECTOR,"button#onetrust-accept-btn-handler")
            accept_button.click()
        except Exception as e:
            print(f"Could not find or remove the consent div: {e}")

    def save_screencapture(self, driver, save_path):
        # todo move to s3 bucket in the future
        driver.save_screenshot(save_path)
        return save_path
    
    def capture_proof(self, reference_item_id, url):
        driver = self.create_driver()
        # self.visit_home_page(driver)
        # time.sleep(random.uniform(1, 3))
        # search_input = driver.find_element(By.ID, "header--search--input")
        # search_input.send_keys("english muffins")
        # time.sleep(random.uniform(1, 3))
        driver.get(url)
        input("Press Enter after manually passing the challenge...")
        # time.sleep(random.uniform(1, 3))
        # self.remove_consent_banner(driver) # consent banner doesn't matter here

        # Now continue automation
        driver.save_screenshot("screenshot.png")
        timestamp = pd.Timestamp.now().strftime('%Y-%m-%d_%H-%M-%S')
        filename = f'{self.screenshot_dir}{reference_item_id}_{timestamp}.png'  # Use self.screenshot_dir
        saved_file_name = self.save_screencapture(driver, filename)
        driver.quit()
        return saved_file_name
    
    def save_product(self, product):
        """
        Send the scraped product data to the price-proof API endpoint
        """

        # todo: add a check to see if the product already exists in the database
        try:
            # Convert the product data to the format expected by the API
            api_payload = {
                "name": product.get("name", ""),
                "quantity": float(product.get("quantity", 0)),
                "unitOfMeasure": product.get("unitOfMeasure", ""),
                "price": float(product.get("price", 0)), 
                "pricePerWeight": float(product.get("pricePerWeight", 0)),
                "referenceUrl": product.get("referenceUrl", ""),
                "screenshot": product.get("screenshot", ""),
                "referenceItemId": product.get("referenceItemId")
            }
            
            # Remove None values
            api_payload = {k: v for k, v in api_payload.items() if v is not None}
  
            # Send POST request to the API
            response = requests.post(
                "http://frontend:3000/api/price-proofs",  # Update with your actual API URL
                headers={"Content-Type": "application/json"},
                data=json.dumps(api_payload)
            )
            
            # Check if the request was successful
            if response.status_code == 201:
                print(f"Successfully saved product: {product.get('name')}")
                return True
            else:
                print(f"Failed to save product. Status code: {response.status_code}")
                print(f"Response: {response.text}")
                
                # Fallback to CSV if API fails
                self.scraped_df = pd.DataFrame()
                self.scraped_df = pd.concat([self.scraped_df, pd.DataFrame([product])], ignore_index=True)
                self.scraped_df.to_csv(f'{self.root_folder}/services/price_scraper/tmp/temp_scraped_products.csv', index=False)
                print(f"Saved to CSV as fallback")
                
                return False
                
        except Exception as e:
            print(f"Error saving product to API: {str(e)}")
            
            # Fallback to CSV if exception occurs
            self.scraped_df = pd.DataFrame()
            self.scraped_df = pd.concat([self.scraped_df, pd.DataFrame([product])], ignore_index=True)
            self.scraped_df.to_csv(f'{self.root_folder}/services/price_scraper/tmp/temp_scraped_products.csv', index=False)
            print(f"Saved to CSV as fallback")
            
            return False

    # Main stuff
    def search_for_products(self, product_name: str) -> List[ScrapedProduct]:
        """
        Scrape product information from the website
        Returns ScrapedProduct if found, None if not found
        """
        print(f"Searching for: {product_name}")
        driver = self.create_driver()
        
        # Visit home page first to mimic normal user behavior
        self.visit_home_page(driver)
        
        # Add a small random delay before searching
        time.sleep(random.uniform(1, 3))
        
        print(self.get_url(product_name))
        driver.get(self.get_url(product_name))
        time.sleep(random.uniform(1, 3))
        self.remove_consent_banner(driver) # consent banner doesn't matter here

        items = []
        products = driver.find_elements(By.CLASS_NAME, 'default-product-tile')
        for product in products:
            try:
                title = product.find_element(By.CLASS_NAME, 'head__title').text.strip()
                unit_details = product.find_element(By.CLASS_NAME, 'head__unit-details').text.strip()
                sale_price = product.find_element(By.CSS_SELECTOR, 'div.content__pricing div[data-main-price]').get_attribute('data-main-price')
                secondary_price = product.find_element(By.CLASS_NAME, 'pricing__secondary-price').text.strip()
                product_url = product.find_element(By.CLASS_NAME, 'product-details-link').get_attribute('href')
                clean_item = self.clean_up_item({
                    'title': title,
                    'weight': unit_details,
                    'price': sale_price,
                    'price_per_unit': secondary_price,
                    'url': product_url
                })
                print(clean_item)
                items.append(clean_item)
            except Exception as e:
                print(f"Error processing product: {e}")

        if not items:
            # Take screenshot if no products found
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            screenshot_name = f"no_results_{timestamp}.png"
            screenshot_path = os.path.join(f'{self.screenshot_dir}errors/', screenshot_name)
            driver.save_screenshot(screenshot_path)
            print(f"No products found. Screenshot saved to {screenshot_path}")

        driver.quit()
        return items
    
    def scrape_search(self, reference_item_id: int) -> dict:
        """
        Search products for a given reference item ID
        """
        reference_item = self.mapping_df[self.mapping_df['id'] == reference_item_id].iloc[0]
        product_name = reference_item['product_name']
        print(f"Scraping product: {product_name}")
        products = self.search_for_products(product_name)
        if len(products) == 0:
            print(f"No products found for {product_name}")
            return False
        # Add reference_item_id to all products
        for product in products:
            product['referenceItemId'] = reference_item_id
        return products

    def scrape_product(self, reference_item_id: int, target_product: dict) -> dict:
        """
        Get the product proof for a given reference item ID
        """
        screenshot_path = self.capture_proof(reference_item_id, target_product['referenceUrl'])
        target_product['screenshot'] = screenshot_path.split('/')[-1]
        return target_product
    
    def auto_scrape(self, reference_item_id: int) -> bool:
        """
        Auto scrape a given reference item ID
        """
        products = self.scrape_search(reference_item_id)
        target_product = self.get_cheapest(products)
        target_product = self.scrape_product(reference_item_id, target_product)
        return self.save_product(target_product)

    def retry_proof_capture(self, test_url: str) -> str:
        """
        Retry proof capture for a given proof ID
        """
        return self.capture_proof(0, test_url)