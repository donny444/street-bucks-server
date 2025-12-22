select "Order"."uuid", "Order"."totalPrice", "Order"."timestamp", "OrderMenu"."menuId", "OrderMenu"."quantity" from "Order"
inner join "OrderMenu" on "Order"."uuid" = "OrderMenu"."orderId"
where "Order"."uuid" = '13c0bb41-1fd0-4fc3-8658-0043adffd000'; -- Replace with desired order UUID