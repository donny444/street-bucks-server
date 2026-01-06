/*
  Warnings:

  - The primary key for the `Menu` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fileName` on the `Menu` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Menu` table. All the data in the column will be lost.
  - The primary key for the `MenuRecipe` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OrderMenu` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Recipe` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `imagePath` to the `Menu` table without a default value. This is not possible if the table is not empty.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS citext;

-- DropForeignKey
ALTER TABLE "public"."Stock" DROP CONSTRAINT "Stock_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MenuRecipe" DROP CONSTRAINT "MenuRecipe_menuId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderMenu" DROP CONSTRAINT "OrderMenu_menuId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderMenu" DROP CONSTRAINT "OrderMenu_orderId_fkey";

-- DropIndex
DROP INDEX "public"."Menu_name_key";

-- AlterTable
ALTER TABLE "public"."Menu" DROP CONSTRAINT "Menu_pkey",
DROP COLUMN "fileName",
DROP COLUMN "id",
ADD COLUMN     "imagePath" TEXT NOT NULL,
ALTER COLUMN "name" SET DATA TYPE CITEXT,
ADD CONSTRAINT "Menu_pkey" PRIMARY KEY ("name");

-- AlterTable
ALTER TABLE "public"."Stock" DROP CONSTRAINT "Stock_pkey",
ALTER COLUMN "recipeId" SET DATA TYPE CITEXT,
ADD CONSTRAINT "Stock_pkey" PRIMARY KEY ("branchId", "recipeId");

-- AlterTable
ALTER TABLE "public"."MenuRecipe" DROP CONSTRAINT "MenuRecipe_pkey",
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
ALTER TABLE "public"."Recipe" DROP CONSTRAINT "Recipe_pkey" CASCADE,
ALTER COLUMN "name" SET DATA TYPE CITEXT,
ADD CONSTRAINT "Recipe_pkey" PRIMARY KEY ("name");

-- AddForeignKey
ALTER TABLE "public"."Stock" ADD CONSTRAINT "Stock_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuRecipe" ADD CONSTRAINT "MenuRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuRecipe" ADD CONSTRAINT "MenuRecipe_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "public"."Menu"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderMenu" ADD CONSTRAINT "OrderMenu_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderMenu" ADD CONSTRAINT "OrderMenu_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "public"."Menu"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
