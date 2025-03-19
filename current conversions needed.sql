-- insert values into conversions table
INSERT INTO receipts_app.product_conversion (reference_item_id, from_unit, to_unit, factor)
VALUES
    (16, 'count', 'g', 1.4), -- 'grams each'),
    (18, 'mL', 'g', 1.262626262626263), -- '500g/396ml'),
    (36, 'count', 'g', 57), -- 'english muffins 684g for 12'),
    (40, 'count', 'g', 75), -- 'weiners 450g for 6'),
    (45, 'count', 'g', 100), -- 'muffins 600g for 6'),
    (52, 'count', 'g', 23.66666666666667) -- 'cupcakes 284 grams for 12');
