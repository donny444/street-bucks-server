insert into "Stock" ("branchId", "recipeId", "quantity")
select b."id", r."name", 9999
from "Branch" b
cross join "Recipe" r;
