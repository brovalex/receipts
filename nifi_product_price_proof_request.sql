SELECT DISTINCT id as reference_item_id
FROM receipts_app.reference_item
WHERE 
  id NOT IN (
    SELECT reference_item_id as id
    FROM receipts_app.product_price_proof
    WHERE 
      -- created_at >= date_trunc('week', CURRENT_DATE) AND -- freshness check is for later
      validated IS TRUE
  )
order by reference_item_id ASC;