/*
  Warnings:

  - The primary key for the `Entry` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Ingredient` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `unit` on the `Ingredient` table. All the data in the column will be lost.
  - The primary key for the `Stock` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `unit` to the `Recipe` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Entry" DROP CONSTRAINT "Entry_menuId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Entry" DROP CONSTRAINT "Entry_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Ingredient" DROP CONSTRAINT "Ingredient_menuId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Ingredient" DROP CONSTRAINT "Ingredient_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Stock" DROP CONSTRAINT "Stock_recipeId_fkey";

-- AlterTable
ALTER TABLE "public"."Entry" DROP CONSTRAINT "Entry_pkey",
ALTER COLUMN "orderId" SET DATA TYPE UUID,
ALTER COLUMN "menuId" SET DATA TYPE CITEXT,
ADD CONSTRAINT "Entry_pkey" PRIMARY KEY ("orderId", "menuId");

-- AlterTable
ALTER TABLE "public"."Ingredient" DROP CONSTRAINT "Ingredient_pkey",
DROP COLUMN "unit",
ALTER COLUMN "menuId" SET DATA TYPE CITEXT,
ALTER COLUMN "recipeId" SET DATA TYPE CITEXT,
ADD CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("menuId", "recipeId");

-- AlterTable
ALTER TABLE "public"."Order" ALTER COLUMN "timestamp" SET DEFAULT (extract(epoch from now())*1000)::bigint;

-- AlterTable
ALTER TABLE "public"."Recipe" ADD COLUMN     "unit" CITEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Stock" DROP CONSTRAINT "Stock_pkey",
ALTER COLUMN "recipeId" SET DATA TYPE CITEXT,
ADD CONSTRAINT "Stock_pkey" PRIMARY KEY ("branchId", "recipeId");

-- AddForeignKey
ALTER TABLE "public"."Stock" ADD CONSTRAINT "Stock_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ingredient" ADD CONSTRAINT "Ingredient_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "public"."Menu"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ingredient" ADD CONSTRAINT "Ingredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Entry" ADD CONSTRAINT "Entry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Entry" ADD CONSTRAINT "Entry_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "public"."Menu"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
