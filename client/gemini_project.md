in this system we will have finacers who will be financing phone bought 

we have the routes for creating the financers
 /api/financer/create
{
    "name":"Mkopa Simu",
    "contactName":"Mkopa Simu",
    "phone":"075743294857",
    "email":"simu@gmail.com",
    "address":"Mombasa road"
}
a respnse code of 201 on successfull creation
here it what it returns incase of an error 

{"message":"A financer with the same F already exists.","error":true}

finding a  particular finacer 

/api/financer/get/3

{"data":{"id":3,"name":"Onfon Mobile","contactName":"Onfon Mobile","phone":"075743294854","email":"onfon@gmail.com","address":"Mombasa road","createdAt":"2025-09-03T13:09:22.856Z","updatedAt":"2025-09-03T13:09:23.000Z"}}

and code 404 if not found

for fetching all financer is 

/api/financer/all

{"data":[{"id":1,"name":"Mkopa Simu","contactName":"Mkopa Simu","phone":"075743294857","email":"simu@gmail.com","address":"Mombasa road","createdAt":"2025-08-11T13:10:58.356Z","updatedAt":"2025-08-11T13:10:58.000Z"},{"id":3,"name":"Onfon Mobile","contactName":"Onfon Mobile","phone":"075743294854","email":"onfon@gmail.com","address":"Mombasa road","createdAt":"2025-09-03T13:09:22.856Z","updatedAt":"2025-09-03T13:09:23.000Z"}]}


/api/financer/financer/1 this is for update


{
    "name":"Mkopa Simu",
    "contactName":"Mkopa Simu",
    "phone":"075743294857",
    "email":"simu@gmail.com",
    "address":"Mombasa road"
}

deletion is not allowed for now 

then we he have finance sale 

/api/sales/report/financer/1

the data is as follows 

{
    "success": true,
    "message": "Sales data retrieved successfully",
    "data": {
        "analytics": {
            "totalSales": 1700,
            "totalProfit": -1200,
            "totalCommission": 0,
            "totalFinanceAmount": 0
        },
        "sales": [
            {
                "saleId": 2,
                "soldprice": 1700,
                "netprofit": 2200,
                "commission": 0,
                "commissionpaid": 0,
                "commissionstatus": "N/A",
                "IMEI": 0,
                "paymentstatus": "PAID",
                "color": "white",
                "storage": "N/A",
                "productcost": 1200,
                "supplier": 1,
                "status": "PARTIALLY_RETURNED",
                "productmodel": "XOS",
                "productname": "Oraimo earphones",
                "totalnetprice": 1700,
                "totalsoldunits": 1,
                "totaltransaction": 1,
                "_id": {
                    "productId": 10,
                    "sellerId": 2,
                    "shopId": 1
                },
                "financeDetails": {
                    "financeStatus": "paid",
                    "financeAmount": 0,
                    "financer": "Mkopa Simu"
                },
                "CategoryId": 2,
                "createdAt": "2025-08-15T11:55:52.000Z",
                "batchNumber": "23-339-17",
                "category": "accessories",
                "sellername": "Tony Trace Antony",
                "shopname": "Pokot Resin outlet",
                "paymentDetails": {
                    "id": 9,
                    "amount": "6800",
                    "paymentMethod": "cash",
                    "status": "completed",
                    "transactionId": "23234323423",
                    "createdAt": "2025-08-15T11:55:51.533Z",
                    "updatedAt": "2025-08-15T11:55:52.000Z"
                }
            },
            {
                "saleId": 1,
                "soldprice": 125000,
                "netprofit": 5000,
                "commission": 500,
                "commissionpaid": 195,
                "commissionstatus": "pending",
                "IMEI": "455434404572392",
                "paymentstatus": "paid",
                "color": "black",
                "storage": "8/128GB",
                "productcost": 120000,
                "supplier": 1,
                "status": "RETURNED",
                "productmodel": "smartphones",
                "productname": "Samsung",
                "totalnetprice": 125000,
                "totalsoldunits": 1,
                "totaltransaction": 1,
                "_id": {
                    "productId": 21,
                    "sellerId": 2,
                    "shopId": 1
                },
                "financeDetails": {
                    "financeStatus": "paid",
                    "financeAmount": 0,
                    "financer": "Mkopa Simu"
                },
                "CategoryId": 1,
                "createdAt": "2025-08-12T13:10:00.000Z",
                "batchNumber": "234-234-6",
                "category": "mobiles",
                "sellername": "Tony Trace Antony",
                "shopname": "Pokot Resin outlet",
                "paymentDetails": {
                    "id": 2,
                    "amount": "125000",
                    "paymentMethod": "cash",
                    "status": "completed",
                    "transactionId": "23234323423",
                    "createdAt": "2025-08-12T13:10:00.010Z",
                    "updatedAt": "2025-08-12T13:10:00.000Z"
                }
            }
        ],
        "salesPerMonth": [],
        "totalSales": 1700,
        "totalProfit": -1200,
        "totalCommission": 0,
        "totalfinancePending": 0,
        "totalPages": 1,
        "currentPage": 1,
        "itemsPerPage": 10
    }
}