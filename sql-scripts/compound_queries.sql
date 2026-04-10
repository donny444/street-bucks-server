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

insert into "Menu" ("name", "price", "category", "imagePath", "note") values 
('Hot latte', 50, 'hot', 'hot_latte.png', 'hot_latte.md'),
('Iced latte', 60, 'iced', 'iced_latte.png', 'iced_latte.md'),
('Hot mocha', 50, 'hot', 'hot_mocha.png', 'hot_mocha.md'),
('Iced mocha', 50, 'iced', 'iced_mocha.png', 'iced_mocha.md'),
('Espresso', 40, 'hot', 'espresso.png', 'espresso.md'),
('Americano', 50, 'iced', 'americano.png', 'americano.md'),
('Croissant', 50, 'bakery', 'croissant.png', 'croissant.md'),
('Bagel', 50, 'bakery', 'bagel.png', 'bagel.md'),
('Orange cake', 70, 'bakery', 'orange_cake.png', 'orange_cake.md'),
('Hamcheese sandwich', 60, 'bakery', 'hamcheese_sandwich.png', 'hamcheese_sandwich.md');

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

BEGIN TRANSACTION;

-- Insert users for all branches.
insert into "User" ("email", "branchId", "firstName", "lastName", "password", "role") values
('ava.smi@streetbucks.com', 1, 'Ava', 'Smith', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('liam.joh@streetbucks.com', 1, 'Liam', 'Johnson', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('mia.wil@streetbucks.com', 1, 'Mia', 'Williams', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('noah.bro@streetbucks.com', 1, 'Noah', 'Brown', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('ella.jon@streetbucks.com', 1, 'Ella', 'Jones', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('lucas.gar@streetbucks.com', 1, 'Lucas', 'Garcia', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('zoe.mil@streetbucks.com', 1, 'Zoe', 'Miller', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('oliver.dav@streetbucks.com', 2, 'Oliver', 'Davis', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('sophia.rod@streetbucks.com', 2, 'Sophia', 'Rodriguez', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('ethan.mar@streetbucks.com', 2, 'Ethan', 'Martinez', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('harper.her@streetbucks.com', 2, 'Harper', 'Hernandez', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('mason.lop@streetbucks.com', 2, 'Mason', 'Lopez', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('isabella.gon@streetbucks.com', 2, 'Isabella', 'Gonzalez', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('logan.wil@streetbucks.com', 2, 'Logan', 'Wilson', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('charlotte.and@streetbucks.com', 3, 'Charlotte', 'Anderson', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('james.tho@streetbucks.com', 3, 'James', 'Thomas', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('amelia.tay@streetbucks.com', 3, 'Amelia', 'Taylor', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('benjamin.moo@streetbucks.com', 3, 'Benjamin', 'Moore', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('evelyn.jac@streetbucks.com', 3, 'Evelyn', 'Jackson', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('elijah.mar@streetbucks.com', 3, 'Elijah', 'Martin', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('lily.lee@streetbucks.com', 3, 'Lily', 'Lee', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('henry.per@streetbucks.com', 4, 'Henry', 'Perez', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('grace.whi@streetbucks.com', 4, 'Grace', 'White', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('sebastian.har@streetbucks.com', 4, 'Sebastian', 'Harris', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('chloe.san@streetbucks.com', 4, 'Chloe', 'Sanchez', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('aiden.cla@streetbucks.com', 4, 'Aiden', 'Clark', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('natalie.ram@streetbucks.com', 4, 'Natalie', 'Ramirez', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('caleb.lew@streetbucks.com', 4, 'Caleb', 'Lewis', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('victoria.rob@streetbucks.com', 5, 'Victoria', 'Robinson', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('daniel.wal@streetbucks.com', 5, 'Daniel', 'Walker', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('nora.you@streetbucks.com', 5, 'Nora', 'Young', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('julian.all@streetbucks.com', 5, 'Julian', 'Allen', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('penelope.kin@streetbucks.com', 5, 'Penelope', 'King', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('owen.wri@streetbucks.com', 5, 'Owen', 'Wright', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('zoey.sco@streetbucks.com', 5, 'Zoey', 'Scott', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('leo.tor@streetbucks.com', 6, 'Leo', 'Torres', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('samantha.ngu@streetbucks.com', 6, 'Samantha', 'Nguyen', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('david.hil@streetbucks.com', 6, 'David', 'Hill', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('stella.flo@streetbucks.com', 6, 'Stella', 'Flores', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('samuel.gre@streetbucks.com', 6, 'Samuel', 'Green', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('audrey.ada@streetbucks.com', 6, 'Audrey', 'Adams', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('christian.bak@streetbucks.com', 6, 'Christian', 'Baker', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('victoria.riv@streetbucks.com', 7, 'Victoria', 'Rivera', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('adrian.nel@streetbucks.com', 7, 'Adrian', 'Nelson', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('madeline.car@streetbucks.com', 7, 'Madeline', 'Carter', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('wyatt.mit@streetbucks.com', 7, 'Wyatt', 'Mitchell', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('hannah.per@streetbucks.com', 7, 'Hannah', 'Perez', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('isaac.rob@streetbucks.com', 7, 'Isaac', 'Roberts', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('gabriella.tur@streetbucks.com', 7, 'Gabriella', 'Turner', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('ryan.phi@streetbucks.com', 8, 'Ryan', 'Phillips', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('layla.cam@streetbucks.com', 8, 'Layla', 'Campbell', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('julian.par@streetbucks.com', 8, 'Julian', 'Parker', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('nora.eva@streetbucks.com', 8, 'Nora', 'Evans', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('elijah.edw@streetbucks.com', 8, 'Elijah', 'Edwards', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('zoe.col@streetbucks.com', 8, 'Zoe', 'Collins', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('caleb.ste@streetbucks.com', 8, 'Caleb', 'Stewart', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('penelope.san@streetbucks.com', 9, 'Penelope', 'Sanchez', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('xavier.mor@streetbucks.com', 9, 'Xavier', 'Morris', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('ella.rog@streetbucks.com', 9, 'Ella', 'Rogers', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('anthony.rea@streetbucks.com', 9, 'Anthony', 'Reed', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('maya.coo@streetbucks.com', 9, 'Maya', 'Cook', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('jacob.mor@streetbucks.com', 9, 'Jacob', 'Morgan', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('sofia.bel@streetbucks.com', 9, 'Sofia', 'Bell', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('carter.mur@streetbucks.com', 10, 'Carter', 'Murphy', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('mila.bai@streetbucks.com', 10, 'Mila', 'Bailey', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('hudson.riv@streetbucks.com', 10, 'Hudson', 'Rivera', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('emily.coo@streetbucks.com', 10, 'Emily', 'Cooper', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('lincoln.pet@streetbucks.com', 10, 'Lincoln', 'Peterson', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('aurora.gra@streetbucks.com', 10, 'Aurora', 'Gray', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('wesley.ram@streetbucks.com', 10, 'Wesley', 'Ramirez', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('leah.san@streetbucks.com', 11, 'Leah', 'Sanders', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('isaiah.fos@streetbucks.com', 11, 'Isaiah', 'Foster', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('audrey.rea@streetbucks.com', 11, 'Audrey', 'Reed', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('roman.hug@streetbucks.com', 11, 'Roman', 'Hughes', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('elena.bry@streetbucks.com', 11, 'Elena', 'Bryant', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('marcus.pri@streetbucks.com', 11, 'Marcus', 'Price', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('naomi.har@streetbucks.com', 11, 'Naomi', 'Hart', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('charlie.spe@streetbucks.com', 12, 'Charlie', 'Spencer', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('lila.bry@streetbucks.com', 12, 'Lila', 'Bryant', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('milo.bro@streetbucks.com', 12, 'Milo', 'Brooks', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('addison.fox@streetbucks.com', 12, 'Addison', 'Fox', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('cora.war@streetbucks.com', 12, 'Cora', 'Warren', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('levi.pow@streetbucks.com', 12, 'Levi', 'Powell', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('ivy.lon@streetbucks.com', 12, 'Ivy', 'Long', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('daniel.col@streetbucks.com', 13, 'Daniel', 'Coleman', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('nora.pet@streetbucks.com', 13, 'Nora', 'Peters', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('henry.mor@streetbucks.com', 13, 'Henry', 'Morales', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('hazel.pat@streetbucks.com', 13, 'Hazel', 'Patterson', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('theo.hug@streetbucks.com', 13, 'Theo', 'Hughes', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('clara.kim@streetbucks.com', 13, 'Clara', 'Kim', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('everett.bis@streetbucks.com', 13, 'Everett', 'Bishop', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('paisley.mat@streetbucks.com', 14, 'Paisley', 'Matthews', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('nathan.bro@streetbucks.com', 14, 'Nathan', 'Brooks', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('savannah.mon@streetbucks.com', 14, 'Savannah', 'Montgomery', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('eli.new@streetbucks.com', 14, 'Eli', 'Newman', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('mikaela.bis@streetbucks.com', 14, 'Mikaela', 'Bishop', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'staff'),
('jordan.wal@streetbucks.com', 14, 'Jordan', 'Walsh', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager'),
('daisy.ste@streetbucks.com', 14, 'Daisy', 'Stephens', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'manager');

insert into "User" ("email", "branchId", "firstName", "lastName", "password", "role") values
('marcus.che@streetbucks.com', 1, 'Marcus', 'Chen', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'administrator'),
('rachel.kap@streetbucks.com', 2, 'Rachel', 'Kapoor', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'administrator'),
('kevin.obr@streetbucks.com', 3, 'Kevin', 'O''Brien', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'administrator'),
('jessica.mul@streetbucks.com', 4, 'Jessica', 'Müller', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'administrator'),
('thomas.lar@streetbucks.com', 5, 'Thomas', 'Larsson', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'administrator'),
('amanda.dub@streetbucks.com', 6, 'Amanda', 'Dubois', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'administrator'),
('christopher.sil@streetbucks.com', 7, 'Christopher', 'Silva', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'administrator'),
('michelle.sat@streetbucks.com', 8, 'Michelle', 'Sato', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'administrator'),
('brandon.kow@streetbucks.com', 9, 'Brandon', 'Kowalski', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'administrator'),
('sarah.ber@streetbucks.com', 10, 'Sarah', 'Bergström', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'administrator'),
('matthew.ros@streetbucks.com', 11, 'Matthew', 'Rossi', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'administrator'),
('lauren.pet@streetbucks.com', 12, 'Lauren', 'Petrov', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'administrator'),
('jonathan.nak@streetbucks.com', 13, 'Jonathan', 'Nakamura', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'administrator'),
('nicole.han@streetbucks.com', 14, 'Nicole', 'Hansen', '$2a$10$28Ra6W4Kx9xRy0NG76bAnu7zHiwq/cG1eI1fkYCt8GCeAZ3NQ7JWO', 'administrator');

-- Generate 50000 orders with random items.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
	target_orders integer := 50000;
	i integer;
	new_order_id uuid;
	order_timestamp bigint;
	total_price double precision;
	item_count integer;
	menu_record RECORD;
	item_quantity integer;
	branch_id bigint;
	pv_menu_name text;
BEGIN
	FOR i IN 1..target_orders LOOP
		new_order_id := gen_random_uuid();
		order_timestamp := floor(
			extract(epoch FROM (timestamp '2026-01-01' + random() * interval '365 days')) * 1000
		)::bigint;
		branch_id := (1 + floor(random() * 14))::bigint;

		INSERT INTO "Order" ("uuid", "branchId", "timestamp", "totalPrice")
		VALUES (new_order_id, branch_id, order_timestamp, 0);

		total_price := 0;
		item_count := 1 + floor(random() * 4)::integer;

		FOR menu_record IN
			SELECT name, price FROM "Menu" ORDER BY random() LIMIT item_count
		LOOP
			pv_menu_name := menu_record.name;
			item_quantity := 1 + floor(random() * 4)::integer;
			total_price := total_price + (menu_record.price * item_quantity);

			INSERT INTO "Entry" ("orderId", "menuId", "quantity")
			VALUES (new_order_id, pv_menu_name, item_quantity);

			-- Subtract stock based on ingredients needed for this menu item
			UPDATE "Stock" s
			SET "quantity" = s."quantity" - (ing."amount" * item_quantity)
			FROM "Ingredient" ing
			WHERE s."branchId" = branch_id
			  AND s."recipeId" = ing."recipeId"
			  AND ing."menuId" = pv_menu_name;
		END LOOP;

		UPDATE "Order"
		SET "totalPrice" = total_price
		WHERE "uuid" = new_order_id;
	END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Seeds attendance records for all days in 2026
-- For each branch, one user is absent (no record) each day
WITH RECURSIVE dates AS (
  -- Generate all dates in 2026
  SELECT '2026-01-01'::date AS dt
  UNION ALL
  SELECT (dt + interval '1 day')::date
  FROM dates
  WHERE dt < '2026-12-31'::date
),
branch_users AS (
  -- Get all users with row numbers within their branch
  SELECT 
    email,
    "branchId",
    (ROW_NUMBER() OVER (PARTITION BY "branchId" ORDER BY email) - 1)::int AS user_idx,
    COUNT(*) OVER (PARTITION BY "branchId")::int AS users_in_branch
  FROM "User"
),
attendance_data AS (
  SELECT 
    bu.email,
    bu."branchId",
    d.dt,
    bu.user_idx,
    -- Calculate which user index is absent for this day/branch
    -- Using day of year mod number of users in branch (rotates through users)
    ((EXTRACT(DOY FROM d.dt)::int - 1) % bu.users_in_branch) AS absent_idx,
    -- Generate a pseudo-random time seed based on hash of email + date for reproducibility
    ('x' || substr(md5(bu.email || d.dt::text), 1, 8))::bit(32)::int AS time_seed
  FROM dates d
  CROSS JOIN branch_users bu
)
INSERT INTO "Attendance" ("userId", "dateTime")
SELECT 
  email,
  -- Timestamp: date + time between 06:00:00 and 17:59:59 (12-hour window)
  dt + interval '6 hours' + (abs(time_seed) % 43200) * interval '1 second'
FROM attendance_data
WHERE user_idx != absent_idx
ORDER BY dt, "branchId", email;

COMMIT;
