i want we refine collecting shop stock we have multiple records \


for the overview which will not be viewed by seller 

api/shop/Pokot Resin outlet/overview

you can have different graphs  for this overview now 

{"message":"success","overview":{"totalStockValue":2162200,"pendingStockValue":122400,"confirmedStockValue":1507000,"lowStockItems":{"mobiles":[],"accessories":[]},"stockByCategory":{"Samsung":18,"samsung 4/256 GB":3,"Oraimo earphones":56}}}



now for accessory or mobiles we have different request 

/api/shop/Pokot Resin outlet?page=1&limit=10&itemType=accessory&status=confirmed

{
    "message": "success",
    "shop": {
        "filteredShop": {
            "_id": "1",
            "name": "Pokot Resin outlet",
            "address": "Kiambu 26",
            "sellers": [
                {
                    "id": 1,
                    "sellerId": 2,
                    "assignmentId": 1,
                    "name": "Tony Trace Antony",
                    "phone": "07123453298",
                    "fromDate": "2025-08-11T00:00:00.000Z",
                    "toDate": "2025-09-14T00:00:00.000Z",
                    "status": "assigned"
                },
                {
                    "id": 2,
                    "sellerId": 3,
                    "assignmentId": 2,
                    "name": "Peter Mwangi",
                    "phone": "071235671789",
                    "fromDate": "2025-09-01T00:00:00.000Z",
                    "toDate": "2025-09-14T00:00:00.000Z",
                    "status": "assigned"
                }
            ],
            "mobileItems": {
                "items": [],
                "totalPages": 0,
                "currentPage": 1,
                "totalItems": 0
            },
            "accessoryItems": {
                "totalItems": 1,
                "totalPages": 1,
                "currentPage": 1,
                "items": [
                    {
                        "id": 8,
                        "accessoryID": 12,
                        "shopID": 1,
                        "status": "confirmed",
                        "createdAt": "2025-09-01T13:44:01.000Z",
                        "quantity": 10,
                        "productStatus": "new stock",
                        "updatedAt": "2025-09-05T18:50:36.000Z",
                        "transferId": 8,
                        "confirmedBy": 2,
                        "accessories": {
                            "categories": {
                                "id": 2,
                                "itemName": "Oraimo earphones",
                                "itemModel": "XOS",
                                "minPrice": 1500,
                                "itemType": "accessories",
                                "brand": "Oraimo x",
                                "maxPrice": 1700,
                                "category": "accessories"
                            },
                            "productCost": 1200,
                            "discount": 0,
                            "stockStatus": "available",
                            "batchNumber": "123-456-54"
                        }
                    }
                ]
            }
        }
    }
}

/api/shop/Pokot Resin outlet?page=1&limit=10&itemType=mobile&status=confirmed 

{
    "message": "success",
    "shop": {
        "filteredShop": {
            "_id": "1",
            "name": "Pokot Resin outlet",
            "address": "Kiambu 26",
            "sellers": [
                {
                    "id": 1,
                    "sellerId": 2,
                    "assignmentId": 1,
                    "name": "Tony Trace Antony",
                    "phone": "07123453298",
                    "fromDate": "2025-08-11T00:00:00.000Z",
                    "toDate": "2025-09-14T00:00:00.000Z",
                    "status": "assigned"
                },
                {
                    "id": 2,
                    "sellerId": 3,
                    "assignmentId": 2,
                    "name": "Peter Mwangi",
                    "phone": "071235671789",
                    "fromDate": "2025-09-01T00:00:00.000Z",
                    "toDate": "2025-09-14T00:00:00.000Z",
                    "status": "assigned"
                }
            ],
            "mobileItems": {
                "totalItems": 16,
                "totalPages": 2,
                "currentPage": 1,
                "items": [
                    {
                        "id": 9,
                        "mobileID": 6,
                        "shopID": 1,
                        "status": "confirmed",
                        "confirmedBy": 2,
                        "transferId": 7,
                        "createdAt": "2025-08-12T09:14:10.000Z",
                        "productStatus": "new stock",
                        "quantity": 1,
                        "updatedAt": "2025-09-05T05:56:24.000Z",
                        "mobiles": {
                            "categories": {
                                "id": 1,
                                "itemName": "Samsung",
                                "itemModel": "A16S",
                                "minPrice": 140000,
                                "itemType": "mobiles",
                                "brand": "Samsung",
                                "maxPrice": 150000,
                                "category": "mobiles"
                            },
                            "IMEI": "1571282566231399",
                            "batchNumber": "234-234-6",
                            "color": "black",
                            "productCost": "120000",
                            "discount": "300",
                            "stockStatus": "distributed"
                        }
                    },
                    {
                        "id": 10,
                        "mobileID": 5,
                        "shopID": 1,
                        "status": "confirmed",
                        "confirmedBy": 2,
                        "transferId": 6,
                        "createdAt": "2025-08-12T09:14:10.000Z",
                        "productStatus": "new stock",
                        "quantity": 1,
                        "updatedAt": "2025-09-05T05:56:44.000Z",
                        "mobiles": {
                            "categories": {
                                "id": 1,
                                "itemName": "Samsung",
                                "itemModel": "A16S",
                                "minPrice": 140000,
                                "itemType": "mobiles",
                                "brand": "Samsung",
                                "maxPrice": 150000,
                                "category": "mobiles"
                            },
                            "IMEI": "1371282566231399",
                            "batchNumber": "234-234-6",
                            "color": "black",
                            "productCost": "120000",
                            "discount": "300",
                            "stockStatus": "distributed"
                        }
                    },
                    {
                        "id": 12,
                        "mobileID": 7,
                        "shopID": 1,
                        "status": "confirmed",
                        "confirmedBy": 2,
                        "transferId": 5,
                        "createdAt": "2025-08-12T09:14:10.000Z",
                        "productStatus": "new stock",
                        "quantity": 1,
                        "updatedAt": "2025-09-05T05:56:37.000Z",
                        "mobiles": {
                            "categories": {
                                "id": 1,
                                "itemName": "Samsung",
                                "itemModel": "A16S",
                                "minPrice": 140000,
                                "itemType": "mobiles",
                                "brand": "Samsung",
                                "maxPrice": 150000,
                                "category": "mobiles"
                            },
                            "IMEI": "0571282566231399",
                            "batchNumber": "234-234-6",
                            "color": "black",
                            "productCost": "120000",
                            "discount": "300",
                            "stockStatus": "distributed"
                        }
                    },
                    {
                        "id": 17,
                        "mobileID": 1,
                        "shopID": 1,
                        "status": "confirmed",
                        "confirmedBy": 2,
                        "transferId": 9,
                        "createdAt": "2025-08-12T09:34:08.000Z",
                        "productStatus": "new stock",
                        "quantity": 1,
                        "updatedAt": "2025-09-05T06:10:07.000Z",
                        "mobiles": {
                            "categories": {
                                "id": 1,
                                "itemName": "Samsung",
                                "itemModel": "A16S",
                                "minPrice": 140000,
                                "itemType": "mobiles",
                                "brand": "Samsung",
                                "maxPrice": 150000,
                                "category": "mobiles"
                            },
                            "IMEI": "138012827882399",
                            "batchNumber": "234-234-6",
                            "color": "black",
                            "productCost": "120000",
                            "discount": "300",
                            "stockStatus": "distributed"
                        }
                    },
                    {
                        "id": 18,
                        "mobileID": 3,
                        "shopID": 1,
                        "status": "confirmed",
                        "confirmedBy": 2,
                        "transferId": 11,
                        "createdAt": "2025-08-12T09:34:09.000Z",
                        "productStatus": "new stock",
                        "quantity": 1,
                        "updatedAt": "2025-09-05T05:56:48.000Z",
                        "mobiles": {
                            "categories": {
                                "id": 1,
                                "itemName": "Samsung",
                                "itemModel": "A16S",
                                "minPrice": 140000,
                                "itemType": "mobiles",
                                "brand": "Samsung",
                                "maxPrice": 150000,
                                "category": "mobiles"
                            },
                            "IMEI": "1380128274231399",
                            "batchNumber": "234-234-6",
                            "color": "black",
                            "productCost": "120000",
                            "discount": "300",
                            "stockStatus": "distributed"
                        }
                    },
                    {
                        "id": 19,
                        "mobileID": 2,
                        "shopID": 1,
                        "status": "confirmed",
                        "confirmedBy": 2,
                        "transferId": 10,
                        "createdAt": "2025-08-12T09:34:09.000Z",
                        "productStatus": "new stock",
                        "quantity": 1,
                        "updatedAt": "2025-09-05T06:10:12.000Z",
                        "mobiles": {
                            "categories": {
                                "id": 1,
                                "itemName": "Samsung",
                                "itemModel": "A16S",
                                "minPrice": 140000,
                                "itemType": "mobiles",
                                "brand": "Samsung",
                                "maxPrice": 150000,
                                "category": "mobiles"
                            },
                            "IMEI": "138012827452399",
                            "batchNumber": "234-234-6",
                            "color": "black",
                            "productCost": "120000",
                            "discount": "300",
                            "stockStatus": "distributed"
                        }
                    },
                    {
                        "id": 24,
                        "mobileID": 10,
                        "shopID": 1,
                        "status": "confirmed",
                        "confirmedBy": 2,
                        "transferId": 13,
                        "createdAt": "2025-08-12T09:52:11.000Z",
                        "productStatus": "new stock",
                        "quantity": 1,
                        "updatedAt": "2025-09-05T06:10:15.000Z",
                        "mobiles": {
                            "categories": {
                                "id": 1,
                                "itemName": "Samsung",
                                "itemModel": "A16S",
                                "minPrice": 140000,
                                "itemType": "mobiles",
                                "brand": "Samsung",
                                "maxPrice": 150000,
                                "category": "mobiles"
                            },
                            "IMEI": "056712825662392",
                            "batchNumber": "234-234-6",
                            "color": "black",
                            "productCost": "120000",
                            "discount": "300",
                            "stockStatus": "distributed"
                        }
                    },
                    {
                        "id": 30,
                        "mobileID": 14,
                        "shopID": 1,
                        "status": "confirmed",
                        "confirmedBy": 2,
                        "transferId": 15,
                        "createdAt": "2025-08-12T10:03:02.000Z",
                        "productStatus": "new stock",
                        "quantity": 1,
                        "updatedAt": "2025-09-05T06:10:18.000Z",
                        "mobiles": {
                            "categories": {
                                "id": 1,
                                "itemName": "Samsung",
                                "itemModel": "A16S",
                                "minPrice": 140000,
                                "itemType": "mobiles",
                                "brand": "Samsung",
                                "maxPrice": 150000,
                                "category": "mobiles"
                            },
                            "IMEI": "07671280062392",
                            "batchNumber": "234-234-6",
                            "color": "black",
                            "productCost": "120000",
                            "discount": "300",
                            "stockStatus": "distributed"
                        }
                    },
                    {
                        "id": 31,
                        "mobileID": 12,
                        "shopID": 1,
                        "status": "confirmed",
                        "confirmedBy": 2,
                        "transferId": 17,
                        "createdAt": "2025-08-12T10:03:02.000Z",
                        "productStatus": "new stock",
                        "quantity": 1,
                        "updatedAt": "2025-09-05T06:10:21.000Z",
                        "mobiles": {
                            "categories": {
                                "id": 1,
                                "itemName": "Samsung",
                                "itemModel": "A16S",
                                "minPrice": 140000,
                                "itemType": "mobiles",
                                "brand": "Samsung",
                                "maxPrice": 150000,
                                "category": "mobiles"
                            },
                            "IMEI": "05671287762392",
                            "batchNumber": "234-234-6",
                            "color": "black",
                            "productCost": "120000",
                            "discount": "300",
                            "stockStatus": "distributed"
                        }
                    },
                    {
                        "id": 33,
                        "mobileID": 12,
                        "shopID": 1,
                        "status": "confirmed",
                        "confirmedBy": 2,
                        "transferId": 17,
                        "createdAt": "2025-08-12T10:03:03.000Z",
                        "productStatus": "new stock",
                        "quantity": 1,
                        "updatedAt": "2025-09-05T06:10:21.000Z",
                        "mobiles": {
                            "categories": {
                                "id": 1,
                                "itemName": "Samsung",
                                "itemModel": "A16S",
                                "minPrice": 140000,
                                "itemType": "mobiles",
                                "brand": "Samsung",
                                "maxPrice": 150000,
                                "category": "mobiles"
                            },
                            "IMEI": "05671287762392",
                            "batchNumber": "234-234-6",
                            "color": "black",
                            "productCost": "120000",
                            "discount": "300",
                            "stockStatus": "distributed"
                        }
                    }
                ]
            },
            "accessoryItems": {
                "items": [],
                "totalPages": 0,
                "currentPage": 1,
                "totalItems": 0
            }
        }
    }
}


for pending stock we can have status value changed to pending 



for product search we are apssing the following request api/shop/searchproducts/Pokot Resin outlet?productName=138012827882399

the result 

{"message":"Search successful","products":{"phoneItems":{"items":[{"id":17,"mobileID":1,"shopID":1,"status":"confirmed","confirmedBy":2,"transferId":9,"createdAt":"2025-08-12T09:34:08.000Z","productStatus":"new stock","quantity":1,"updatedAt":"2025-09-05T06:10:07.000Z","mobiles":{"id":1,"IMEI":"138012827882399","batchNumber":"234-234-6","availableStock":0,"commission":"500","discount":"300","productCost":"120000","color":"black","stockStatus":"distributed","CategoryId":1,"barcodePath":null,"createdAt":"2025-08-12T08:14:02.000Z","storage":"8/128GB","phoneType":"smartphones","updatedAt":"2025-08-12T09:34:06.000Z","itemType":"mobiles","paymentStatus":"paid","supplierId":1,"categories":{"id":1,"itemName":"Samsung","itemModel":"A16S","minPrice":140000,"itemType":"mobiles","brand":"Samsung","maxPrice":150000,"category":"mobiles"}}}],"totalItems":1,"totalPages":1,"currentPage":1},"stockItems":{"items":[],"totalItems":0,"totalPages":0,"currentPage":1}},"error":false}

