/*
  Warnings:

  - The primary key for the `MenuRecipe` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OrderMenu` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Stock` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `unit` to the `MenuRecipe` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."MenuRecipe" DROP CONSTRAINT "MenuRecipe_menuId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MenuRecipe" DROP CONSTRAINT "MenuRecipe_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderMenu" DROP CONSTRAINT "OrderMenu_menuId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderMenu" DROP CONSTRAINT "OrderMenu_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Stock" DROP CONSTRAINT "Stock_recipeId_fkey";

-- AlterTable
ALTER TABLE "public"."MenuRecipe" DROP CONSTRAINT "MenuRecipe_pkey",
ADD COLUMN     "unit" TEXT NOT NULL,
ALTER COLUMN "menuId" SET DATA TYPE CITEXT,
ALTER COLUMN "recipeId" SET DATA TYPE CITEXT,
ADD CONSTRAINT "MenuRecipe_pkey" PRIMARY KEY ("menuId", "recipeId");

-- AlterTable
ALTER TABLE "public"."Order" ALTER COLUMN "timestamp" SET DEFAULT (extract(epoch from now())*1000)::bigint;

-- AlterTable
ALTER TABLE "public"."OrderMenu" DROP CONSTRAINT "OrderMenu_pkey",
ALTER COLUMN "orderId" SET DATA TYPE UUID,
ALTER COLUMN "menuId" SET DATA TYPE CITEXT,
ADD CONSTRAINT "OrderMenu_pkey" PRIMARY KEY ("orderId", "menuId");

-- AlterTable
ALTER TABLE "public"."Stock" DROP CONSTRAINT "Stock_pkey",
ALTER COLUMN "recipeId" SET DATA TYPE CITEXT,
ADD CONSTRAINT "Stock_pkey" PRIMARY KEY ("branchId", "recipeId");

-- AddForeignKey
ALTER TABLE "public"."Stock" ADD CONSTRAINT "Stock_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuRecipe" ADD CONSTRAINT "MenuRecipe_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "public"."Menu"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuRecipe" ADD CONSTRAINT "MenuRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderMenu" ADD CONSTRAINT "OrderMenu_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderMenu" ADD CONSTRAINT "OrderMenu_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "public"."Menu"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
