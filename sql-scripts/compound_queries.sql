BEGIN TRANSACTION;

-- Seed base tables referenced by dependent records.
insert into "Branch" ("id", "password") values
(1, '$2a$10$7W0VamDpmDMk9ycFv3sFfulNHlbDmmZjblpRv57MRPM.5E3FDk/za'),
(2, '$2a$10$7W0VamDpmDMk9ycFv3sFfulNHlbDmmZjblpRv57MRPM.5E3FDk/za'),
(3, '$2a$10$7W0VamDpmDMk9ycFv3sFfulNHlbDmmZjblpRv57MRPM.5E3FDk/za'),
(4, '$2a$10$7W0VamDpmDMk9ycFv3sFfulNHlbDmmZjblpRv57MRPM.5E3FDk/za'),
(5, '$2a$10$7W0VamDpmDMk9ycFv3sFfulNHlbDmmZjblpRv57MRPM.5E3FDk/za'),
(6, '$2a$10$7W0VamDpmDMk9ycFv3sFfulNHlbDmmZjblpRv57MRPM.5E3FDk/za'),
(7, '$2a$10$7W0VamDpmDMk9ycFv3sFfulNHlbDmmZjblpRv57MRPM.5E3FDk/za'),
(8, '$2a$10$7W0VamDpmDMk9ycFv3sFfulNHlbDmmZjblpRv57MRPM.5E3FDk/za'),
(9, '$2a$10$7W0VamDpmDMk9ycFv3sFfulNHlbDmmZjblpRv57MRPM.5E3FDk/za'),
(10, '$2a$10$7W0VamDpmDMk9ycFv3sFfulNHlbDmmZjblpRv57MRPM.5E3FDk/za'),
(11, '$2a$10$7W0VamDpmDMk9ycFv3sFfulNHlbDmmZjblpRv57MRPM.5E3FDk/za'),
(12, '$2a$10$7W0VamDpmDMk9ycFv3sFfulNHlbDmmZjblpRv57MRPM.5E3FDk/za'),
(13, '$2a$10$7W0VamDpmDMk9ycFv3sFfulNHlbDmmZjblpRv57MRPM.5E3FDk/za'),
(14, '$2a$10$7W0VamDpmDMk9ycFv3sFfulNHlbDmmZjblpRv57MRPM.5E3FDk/za');

insert into "Recipe" ("name", "unit", "imagePath") values
	('Milk', 'cup', 'milk.png'),
	('Coffee beans', 'cap', 'coffee_beans.png'),
	('Sugar', 'tbsp', 'sugar.png'),
	('Ice', 'glass', 'ice.png'),
	('Water', 'cup', 'water.png'),
	('Cocoa powder', 'tsp', 'cocoa_powder.png'),
	('Yeast', 'tsp', 'yeast.png'),
	('Flour', 'cup', 'flour.png'),
	('Butter', 'tsp', 'butter.png'),
	('Salt', 'tsp', 'salt.png'),
	('Condensed milk', 'cup', 'condensed_milk.png'),
	('Unsalted butter', 'tsp', 'unsalted_butter.png'),
	('Egg', 'pc', 'egg.png'),
	('Whipped cream', 'tbsp', 'whipped_cream.png'),
	('Orange jam', 'tbsp', 'orange_jam.png'),
	('Sliced cheese', 'pc', 'sliced_cheese.png'),
	('Sliced ham', 'pc', 'sliced_ham.png'),
	('Mayonnaise', 'tbsp', 'mayonnaise.png'),
	('Sliced bread', 'pc', 'sliced_bread.png');

insert into "Menu" ("name", "price", "category", "imagePath") values 
('Hot latte', 50, 'hot', 'hot_latte.png'),
('Iced latte', 60, 'iced', 'iced_latte.png'),
('Hot mocha', 50, 'hot', 'hot_mocha.png'),
('Iced mocha', 50, 'iced', 'iced_mocha.png'),
('Espresso', 40, 'hot', 'espresso.png'),
('Americano', 50, 'iced', 'americano.png'),
('Croissant', 50, 'bakery', 'croissant.png'),
('Bagel', 50, 'bakery', 'bagel.png'),
('Orange cake', 70, 'bakery', 'orange_cake.png'),
('Hamcheese sandwich', 60, 'bakery', 'hamcheese_sandwich.png');

COMMIT;

BEGIN TRANSACTION;

-- Insert dependent records now that referenced tables exist.
insert into "Ingredient" ("menuId", "recipeId", "amount") values
('Hot latte', 'Milk', 2),
('Hot latte', 'Coffee beans', 1),
('Hot latte', 'Sugar', 1),
('Hot mocha', 'Water', 1),
('Hot mocha', 'Milk', 1),
('Hot mocha', 'Coffee beans', 1),
('Hot mocha', 'Sugar', 1),
('Hot mocha', 'Cocoa powder', 1),
('Espresso', 'Water', 1),
('Espresso', 'Coffee beans', 1),
('Iced latte', 'Milk', 2),
('Iced latte', 'Coffee beans', 1),
('Iced latte', 'Sugar', 1),
('Iced latte', 'Ice', 1),
('Iced mocha', 'Water', 1),
('Iced mocha', 'Milk', 1),
('Iced mocha', 'Coffee beans', 1),
('Iced mocha', 'Sugar', 1),
('Iced mocha', 'Cocoa powder', 1),
('Iced mocha', 'Ice', 1),
('Americano', 'Water', 2),
('Americano', 'Coffee beans', 1),
('Americano', 'Sugar', 1),
('Americano', 'Ice', 1),
('Croissant', 'Water', 1),
('Croissant', 'Yeast', 1),
('Croissant', 'Flour', 2),
('Croissant', 'Butter', 1),
('Croissant', 'Salt', 1),
('Bagel', 'Water', 2),
('Bagel', 'Yeast', 2),
('Bagel', 'Flour', 3),
('Bagel', 'Sugar', 1),
('Bagel', 'Salt', 2),
('Orange cake', 'Condensed milk', 1),
('Orange cake', 'Sugar', 3),
('Orange cake', 'Unsalted butter', 1),
('Orange cake', 'Egg', 1),
('Orange cake', 'Flour', 2),
('Orange cake', 'Whipped cream', 1),
('Orange cake', 'Orange jam', 2),
('Orange cake', 'Salt', 1),
('Hamcheese sandwich', 'Sliced cheese', 1),
('Hamcheese sandwich', 'Sliced ham', 1),
('Hamcheese sandwich', 'Mayonnaise', 1),
('Hamcheese sandwich', 'Sliced bread', 2);

insert into "Stock" ("branchId", "recipeId", "quantity")
select b."id", r."name", 9999
from "Branch" b
cross join "Recipe" r;

COMMIT;
