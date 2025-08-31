-- CreateTable
CREATE TABLE "public"."Attendance" (
    "uuid" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "public"."Staff" (
    "uuid" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" VARCHAR(60) NOT NULL,
    "isManager" BOOLEAN NOT NULL DEFAULT false,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "public"."Branch" (
    "uuid" TEXT NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "public"."Stock" (
    "branchId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("branchId","recipeId")
);

-- CreateTable
CREATE TABLE "public"."Recipe" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "public"."MenuRecipe" (
    "menuId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "MenuRecipe_pkey" PRIMARY KEY ("menuId","recipeId")
);

-- CreateTable
CREATE TABLE "public"."Menu" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "public"."OrderMenu" (
    "orderId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "OrderMenu_pkey" PRIMARY KEY ("orderId","menuId")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "uuid" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_name_key" ON "public"."Recipe"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Menu_name_key" ON "public"."Menu"("name");

-- AddForeignKey
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."Staff"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Staff" ADD CONSTRAINT "Staff_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Stock" ADD CONSTRAINT "Stock_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Stock" ADD CONSTRAINT "Stock_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuRecipe" ADD CONSTRAINT "MenuRecipe_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "public"."Menu"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuRecipe" ADD CONSTRAINT "MenuRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderMenu" ADD CONSTRAINT "OrderMenu_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderMenu" ADD CONSTRAINT "OrderMenu_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "public"."Menu"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
