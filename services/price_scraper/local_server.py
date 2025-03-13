from fastapi import FastAPI, HTTPException
import uvicorn
from services.price_scraper.modules.scraper import PriceScraper
from services.shared.schemas import ScrapeRequest, ScrapedProductResponse, ErrorResponse
import random
from typing import List, Optional
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Price Scraper Service")

# Get proxy list from environment variable
PROXY_LIST: List[str] = os.getenv("PROXY_LIST", "").split(",") if os.getenv("PROXY_LIST") else []

def get_random_proxy() -> Optional[str]:
    """Return a random proxy from the proxy list or None if list is empty."""
    return random.choice(PROXY_LIST) if PROXY_LIST else None

@app.post("/scrape")
async def scrape_products(request: ScrapeRequest):
    """
    Scrape product prices for given reference item ID.
    Mimic Lambda behavior.
    """
    try:
        # session = get_db_connection() -- add later
        proxy = get_random_proxy()
        scraper = PriceScraper(proxy=proxy)
        result = scraper.scrape_product(request.reference_item_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    # finally:
    #     session.close()

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}