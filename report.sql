SET search_path TO receipts_app;
WITH ClosestPriceProof AS (
    SELECT 
        ppp.id AS price_proof_id,
        ppp.name AS price_proof_name,
        ppp.reference_item_id,
        ppp.price,
        ppp.quantity,
        ppp.unit_of_measure,
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
        cpp.price_proof_date
        , p.weight * cpp.price / cpp.quantity AS equivalent_base_price -- assuming UoM are the same (TODO)
        , GREATEST(0, e.price_each - p.weight * cpp.price / cpp.quantity) AS product_cost_difference
        , e.quantity * GREATEST(0, e.price_each - p.weight * cpp.price / cpp.quantity) AS gf_total
    FROM expense e
    JOIN product p ON e.product_id = p.id
    JOIN reference_item ri ON p.reference_item_id = ri.id
    LEFT JOIN (SELECT * FROM ClosestPriceProof WHERE rn = 1) cpp 
        ON ri.id = cpp.reference_item_id AND e.id = cpp.expense_id
    WHERE cpp.price_proof_id IS NOT NULL -- temp for now to remove mistakes
    ORDER BY e.created_at DESC
)
SELECT
* 
FROM report
--FROM ClosestPriceProof
-- WHERE price_proof_id IS NOT NULL
-- GROUP BY reference_item_id
;


