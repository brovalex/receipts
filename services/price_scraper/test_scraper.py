import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from services.price_scraper.scraper import PriceScraper

# Create a simple test CSV file
import pandas as pd
test_data = {
    'id': [1, 2],
    'product_name': ['milk 2%', 'bread white']
}
pd.DataFrame(test_data).to_csv('test_mapping.csv', index=False)

# Run the scraper
scraper = PriceScraper('test_mapping.csv')

# Test a single product search
products = scraper.search_for_products('milk 2%')
print(f"\nFound {len(products)} products:")
for p in products:
    print(f"- {p['name']}: ${p['price']} for {p['quantity']}{p['unitOfMeasure']}")

# Test full scrape including screenshot
success = scraper.scrape_product(1)
print(f"\nFull scrape successful: {success}")