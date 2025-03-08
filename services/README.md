## To run the API service

Install dependencies:
```
cd services/price_scraper
pip install -r requirements.txt
```

Start the API server:
```
uvicorn main:app --reload
```

You can then make API calls like:
```
curl -X POST "http://localhost:8000/api/v1/scrape" \
     -H "Content-Type: application/json" \
     -d '{"reference_item_ids": [54, 55, 56]}'
```

The API will be available at:
API Endpoints: http://localhost:8000/api/v1/...