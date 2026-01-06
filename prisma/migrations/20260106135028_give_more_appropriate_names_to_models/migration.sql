/*
  Warnings:

  - You are about to drop the `MenuRecipe` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderMenu` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."MenuRecipe";

-- DropTable
DROP TABLE "public"."OrderMenu";

-- CreateTable
CREATE TABLE "public"."Ingredient" (
    "menuId" CITEXT NOT NULL,
    "recipeId" ciTEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("menuId","recipeId")
);

-- CreateTable
CREATE TABLE "public"."Entry" (
    "orderId" UUID NOT NULL,
    "menuId" CITEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("orderId","menuId")
);

-- AddForeignKey
ALTER TABLE "public"."Ingredient" ADD CONSTRAINT "Ingredient_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "public"."Menu"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ingredient" ADD CONSTRAINT "Ingredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Entry" ADD CONSTRAINT "Entry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Entry" ADD CONSTRAINT "Entry_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "public"."Menu"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
