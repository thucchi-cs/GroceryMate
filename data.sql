-- DELETE FROM grocery_items WHERE list_id IN 
--     (SELECT id FROM grocery_lists WHERE user_id=2);

-- DELETE FROM grocery_lists WHERE user_id=2;


-- INSERT INTO grocery_lists (user_id, week_start, week_end, budget) VALUES
--     (2, '2025-06-15', '2025-06-21', 150),
--     (2, '2025-06-22', '2025-06-28', 150),
--     (2, '2025-06-29', '2025-07-05', 150),
--     (2, '2025-07-06', '2025-07-12', 120),
--     (2, '2025-07-13', '2025-07-19', 135),
--     (2, '2025-07-20', '2025-07-26', 135);


INSERT INTO grocery_items (list_id, item, category_id, price, quantity, bought) VALUES
    (27, 'bread',           1, 3.25, 1, TRUE),
    (27, 'oatmeal',         1, 4.00, 1, TRUE),
    (27, 'milk',            3, 8.12, 2, TRUE),
    (27, 'ground_turkey',   1, 3.79, 2, FALSE),
    (27, 'apples',          4, 4.20, 6, TRUE),
    (27, 'chicken_breast',  8, 11.89, 1, TRUE),
    (27, 'carrots',         4, 2.99, 1, TRUE),
    (27, 'cheese',          3, 3.21, 1, TRUE),
    (27, 'toothpaste',      6, 3.50, 2, TRUE),
    (27, 'dish_soap',       5, 2.39, 1, FALSE),
    (27, 'black_beans',     21, 2.20, 3, TRUE),
    (27, 'spaghetti',       1, 2.89, 1, TRUE),
    (27, 'coffee',          2, 3.11, 1, TRUE),
    (27, 'chips',           10, 5.44, 2, TRUE),
    (27, 'cabbage',         4, 2.98, 2, TRUE),
    (27, 'tomatoes',        4, 1.98, 2, TRUE)