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
UnitConversions AS (
    SELECT
        pc.reference_item_id,
        pc.from_unit,
        pc.to_unit,
        CASE
            WHEN pc.from_unit = 'mL' AND pc.to_unit = 'g' THEN 1 / pc.factor
            ELSE pc.factor
        END AS conversion_factor
    FROM product_conversion pc
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
        cpp.price_proof_date,
        -- COALESCE(uc.conversion_factor, 1) AS unit_conversion_factor,
        CASE
            WHEN p.unit_of_measure = cpp.unit_of_measure THEN p.weight * cpp.price / cpp.quantity
            WHEN uc.conversion_factor IS NULL THEN cpp.price
            ELSE p.weight * cpp.price / cpp.quantity * uc.conversion_factor
        END AS equivalent_base_price,
        CASE
            WHEN p.unit_of_measure = cpp.unit_of_measure THEN GREATEST(0, e.price_each - p.weight * cpp.price / cpp.quantity)
            WHEN uc.conversion_factor IS NULL THEN GREATEST(0, e.price_each - cpp.price)
            ELSE GREATEST(0, e.price_each - p.weight * cpp.price / cpp.quantity * uc.conversion_factor)
        END AS product_cost_difference,
        e.quantity * CASE
            WHEN p.unit_of_measure = cpp.unit_of_measure THEN GREATEST(0, e.price_each - p.weight * cpp.price / cpp.quantity)
            WHEN uc.conversion_factor IS NULL THEN GREATEST(0, e.price_each - cpp.price)
            ELSE GREATEST(0, e.price_each - p.weight * cpp.price / cpp.quantity * uc.conversion_factor)
        END AS gf_total
    FROM expense e
    JOIN product p ON e.product_id = p.id
    JOIN reference_item ri ON p.reference_item_id = ri.id
    LEFT JOIN (SELECT * FROM ClosestPriceProof WHERE rn = 1) cpp 
        ON ri.id = cpp.reference_item_id AND e.id = cpp.expense_id
    LEFT JOIN UnitConversions uc ON p.reference_item_id = uc.reference_item_id 
        AND ((uc.from_unit = p.unit_of_measure AND uc.to_unit = cpp.unit_of_measure)
             OR (uc.from_unit = cpp.unit_of_measure AND uc.to_unit = p.unit_of_measure))
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


