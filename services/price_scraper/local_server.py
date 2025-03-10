from fastapi import FastAPI, HTTPException
import uvicorn
from services.price_scraper.modules.scraper import PriceScraper
from services.shared.schemas import ScrapeRequest, ScrapedProductResponse, ErrorResponse

app = FastAPI(title="Price Scraper Service")

@app.post("/scrape")
async def scrape_products(request: ScrapeRequest):
    """
    Scrape product prices for given reference item ID.
    Mimic Lambda behavior.
    """
    try:
        # session = get_db_connection() -- add later
        scraper = PriceScraper()
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