/*
  Warnings:

  - The primary key for the `Branch` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `uuid` on the `Branch` table. All the data in the column will be lost.
  - The primary key for the `Menu` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `uuid` on the `Menu` table. All the data in the column will be lost.
  - The primary key for the `MenuRecipe` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OrderMenu` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Recipe` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `uuid` on the `Recipe` table. All the data in the column will be lost.
  - The primary key for the `Stock` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `menuId` on the `MenuRecipe` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `recipeId` on the `MenuRecipe` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `menuId` on the `OrderMenu` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `branchId` on the `Staff` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `branchId` on the `Stock` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `recipeId` on the `Stock` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."MenuRecipe" DROP CONSTRAINT "MenuRecipe_menuId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MenuRecipe" DROP CONSTRAINT "MenuRecipe_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderMenu" DROP CONSTRAINT "OrderMenu_menuId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Staff" DROP CONSTRAINT "Staff_branchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Stock" DROP CONSTRAINT "Stock_branchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Stock" DROP CONSTRAINT "Stock_recipeId_fkey";

-- AlterTable
ALTER TABLE "public"."Branch" DROP CONSTRAINT "Branch_pkey",
DROP COLUMN "uuid",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ADD CONSTRAINT "Branch_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Menu" DROP CONSTRAINT "Menu_pkey",
DROP COLUMN "uuid",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ADD CONSTRAINT "Menu_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."MenuRecipe" DROP CONSTRAINT "MenuRecipe_pkey",
DROP COLUMN "menuId",
ADD COLUMN     "menuId" BIGINT NOT NULL,
DROP COLUMN "recipeId",
ADD COLUMN     "recipeId" BIGINT NOT NULL,
ADD CONSTRAINT "MenuRecipe_pkey" PRIMARY KEY ("menuId", "recipeId");

-- AlterTable
ALTER TABLE "public"."OrderMenu" DROP CONSTRAINT "OrderMenu_pkey",
DROP COLUMN "menuId",
ADD COLUMN     "menuId" BIGINT NOT NULL,
ADD CONSTRAINT "OrderMenu_pkey" PRIMARY KEY ("orderId", "menuId");

-- AlterTable
ALTER TABLE "public"."Recipe" DROP CONSTRAINT "Recipe_pkey",
DROP COLUMN "uuid",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ADD CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Staff" DROP COLUMN "branchId",
ADD COLUMN     "branchId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Stock" DROP CONSTRAINT "Stock_pkey",
DROP COLUMN "branchId",
ADD COLUMN     "branchId" BIGINT NOT NULL,
DROP COLUMN "recipeId",
ADD COLUMN     "recipeId" BIGINT NOT NULL,
ADD CONSTRAINT "Stock_pkey" PRIMARY KEY ("branchId", "recipeId");

-- AddForeignKey
ALTER TABLE "public"."Staff" ADD CONSTRAINT "Staff_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Stock" ADD CONSTRAINT "Stock_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Stock" ADD CONSTRAINT "Stock_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuRecipe" ADD CONSTRAINT "MenuRecipe_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "public"."Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuRecipe" ADD CONSTRAINT "MenuRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderMenu" ADD CONSTRAINT "OrderMenu_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "public"."Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
