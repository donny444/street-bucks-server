/*
  Warnings:

  - The primary key for the `Attendance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `uuid` column on the `Attendance` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `MenuRecipe` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Order` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `uuid` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Recipe` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Recipe` table. All the data in the column will be lost.
  - The primary key for the `Stock` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[imagePath]` on the table `Recipe` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `imagePath` to the `Recipe` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."MenuRecipe" DROP CONSTRAINT "MenuRecipe_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Stock" DROP CONSTRAINT "Stock_recipeId_fkey";

-- DropIndex
DROP INDEX "public"."Recipe_name_key";

-- AlterTable
ALTER TABLE "public"."Attendance" DROP CONSTRAINT "Attendance_pkey",
DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY ("uuid");

-- AlterTable
ALTER TABLE "public"."MenuRecipe" DROP CONSTRAINT "MenuRecipe_pkey",
ALTER COLUMN "recipeId" SET DATA TYPE TEXT,
ADD CONSTRAINT "MenuRecipe_pkey" PRIMARY KEY ("menuId", "recipeId");

-- AlterTable
ALTER TABLE "public"."OrderMenu" DROP CONSTRAINT "OrderMenu_orderId_fkey",
DROP CONSTRAINT "OrderMenu_pkey",
ALTER COLUMN "orderId" SET DATA TYPE UUID USING ("orderId")::uuid;

-- AlterTable
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_pkey",
DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "timestamp" SET DEFAULT (extract(epoch from now())*1000)::bigint,
ADD CONSTRAINT "Order_pkey" PRIMARY KEY ("uuid");

-- AlterTable
ALTER TABLE "public"."OrderMenu" ADD CONSTRAINT "OrderMenu_pkey" PRIMARY KEY ("orderId", "menuId");

-- AddForeignKey
ALTER TABLE "public"."OrderMenu" ADD CONSTRAINT "OrderMenu_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "public"."Recipe" DROP CONSTRAINT "Recipe_pkey",
DROP COLUMN "id",
ADD COLUMN     "imagePath" TEXT NOT NULL,
ADD CONSTRAINT "Recipe_pkey" PRIMARY KEY ("name");

-- AlterTable
ALTER TABLE "public"."Stock" DROP CONSTRAINT "Stock_pkey",
ALTER COLUMN "recipeId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Stock_pkey" PRIMARY KEY ("branchId", "recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_imagePath_key" ON "public"."Recipe"("imagePath");

-- AddForeignKey
ALTER TABLE "public"."Stock" ADD CONSTRAINT "Stock_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuRecipe" ADD CONSTRAINT "MenuRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
