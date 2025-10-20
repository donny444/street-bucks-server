/*
  Warnings:

  - The primary key for the `Attendance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `uuid` column on the `Attendance` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Order` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `uuid` column on the `Order` table would be altered.
  - The primary key for the `Staff` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `uuid` column on the `Staff` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Attendance"
ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "public"."Order"
ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "timestamp" SET DEFAULT (extract(epoch from now())*1000)::bigint;

-- AlterTable
ALTER TABLE "public"."Staff"
ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();