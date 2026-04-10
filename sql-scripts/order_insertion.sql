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
			item_quantity := 1 + floor(random() * 4)::integer;
			total_price := total_price + (menu_record.price * item_quantity);

			INSERT INTO "Entry" ("orderId", "menuId", "quantity")
			VALUES (new_order_id, menu_record.name, item_quantity);

			-- Subtract stock based on ingredients needed for this menu item
			UPDATE "Stock" s
			SET "quantity" = s."quantity" - (ing."amount" * item_quantity)
			FROM "Ingredient" ing
			WHERE s."branchId" = branch_id
			  AND s."recipeId" = ing."recipeId"
			  AND ing."menuId" = menu_record.name;
		END LOOP;

		UPDATE "Order"
		SET "totalPrice" = total_price
		WHERE "uuid" = new_order_id;
	END LOOP;
END;
$$ LANGUAGE plpgsql;
