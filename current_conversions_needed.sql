SET search_path TO receipts_app;
WITH ClosestPriceProof AS (
    SELECT 
        ppp.id AS price_proof_id,
        ppp.name AS price_proof_name,
        ppp.reference_item_id,
        ppp.price,
        ppp.quantity,
        ppp.unit_of_measure,
        ppp.reference_url,
        ppp.created_at AS price_proof_date,
        e.id AS expense_id,
        ROW_NUMBER() OVER (
            PARTITION BY e.id, ppp.reference_item_id 
            ORDER BY ABS(EXTRACT(EPOCH FROM (e.created_at - ppp.created_at)))
        ) AS rn
    FROM product_price_proof ppp
    JOIN reference_item ri ON ppp.reference_item_id = ri.id
    JOIN product p ON p.reference_item_id = ri.id
    JOIN expense e ON e.product_id = p.id
    WHERE ppp.reference_item_id IS NOT NULL AND ppp.validated IS TRUE
),
report AS (
    SELECT 
        e.id AS expense_id,
        e.receipt_id,
        e.price_each,
        e.quantity,
        e.price_each * e.quantity AS total_price,
        e.created_at AS expense_date,
        p.id AS product_id,
        p.name AS product_name,
        p.weight AS product_weight,
        p.unit_of_measure AS product_unit_of_measure,
        ri.id AS reference_item_id,
        ri.name AS reference_item_name,
        cpp.price_proof_id,
        cpp.price_proof_name,
        cpp.price AS proof_price,
        cpp.quantity AS proof_quantity,
        cpp.unit_of_measure AS proof_unit_of_measure,
        cpp.reference_url as proof_url,
        cpp.price_proof_date
    FROM expense e
    JOIN product p ON e.product_id = p.id
    JOIN reference_item ri ON p.reference_item_id = ri.id
    LEFT JOIN (SELECT * FROM ClosestPriceProof WHERE rn = 1) cpp 
        ON ri.id = cpp.reference_item_id AND e.id = cpp.expense_id
    WHERE cpp.price_proof_id IS NOT NULL -- TODO: for now, remove later!
    ORDER BY e.created_at DESC
)
SELECT
--* 
--product_name, 
reference_item_id, MIN(reference_item_name) AS reference_item_name_per_id, MIN(proof_url) AS proof_url, product_unit_of_measure, proof_unit_of_measure
FROM report
WHERE product_unit_of_measure <> proof_unit_of_measure
AND NOT EXISTS (
    SELECT 1 
    FROM product_conversion pc 
    WHERE (
        pc.from_unit = product_unit_of_measure 
        AND pc.to_unit = proof_unit_of_measure
    ) OR (
        pc.from_unit = proof_unit_of_measure 
        AND pc.to_unit = product_unit_of_measure
    )
)
-- WHERE price_proof_id IS NULL
 GROUP BY reference_item_id, product_unit_of_measure, proof_unit_of_measure
;

--select DISTINCT unit_of_measure
--from receipts_app.product_price_proof
--
--select name, unit_of_measure
--from product_price_proof
--where unit_of_measure = 'ca';
--





