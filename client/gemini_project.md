we have this route for fetching a specific phone product

/api/inventory/profile/mobile/15
{"status":200,"data":{"findSpecificProduct":{"id":15,"IMEI":"0767128002392","batchNumber":"234-234-6","availableStock":0,"commission":"500","discount":"300","productCost":"120000","color":"black","stockStatus":"distributed","CategoryId":1,"barcodePath":null,"createdAt":"2025-08-12T11:17:55.000Z","storage":"8/128GB","phoneType":"smartphones","updatedAt":"2025-08-12T11:19:54.000Z","itemType":"mobiles","paymentStatus":"paid","supplierId":1,"categories":{"itemName":"Samsung","itemModel":"A16S"},"Supplier":
{"name":"timothy kinoti ANTONY"}}}}
{"message":"Commission cannot exceed 50% of product cost"}


we have this route for updating 
/api/inventory/update-phone-product/16

it takes payload,but it does not allow avaibleStock when updating

this is an example of paylaod it accepts 
{
    "stockStatus":"faulty",
    "commission":1000,
    "IMEI":"034512327892234",
    "productCost":13000
}

for stockStatus we accept "faulty", "reserved", "available"

for accesssories update we have the routes of fetching the product profile 

/api/inventory/profile/accessory/10

{
    "status": 200,
    "data": {
        "id": 10,
        "batchNumber": "23-339-17",
        "productType": "type-C",
        "CategoryId": 1,
        "faultyItems": 0,
        "barcodePath": null,
        "createdAt": "2025-08-12T14:43:15.000Z",
        "availableStock": 11,
        "stockStatus": "faulty",
        "color": "white",
        "productCost": 1200,
        "commission": 50,
        "discount": 0,
        "updatedAt": "2025-08-31T14:03:08.000Z",
        "paymentStatus": "PAID",
        "supplierId": 1,
        "categories": {
            "itemName": "Samsung",
            "itemModel": "A16S",
            "brand": "Samsung",
            "minPrice": 15000,
            "maxPrice": 25000,
            "itemType": "mobiles"
        },
        "Supplier": {
            "name": "timothy kinoti ANTONY"
        }
    }
}

for updating accessory /api/inventory/update-accessory-product/10
it accepts all updates except availableStock

for stockStatus we accept  "available", "suspended", "faulty"

{"status":200,"data":{"id":10,"batchNumber":"23-339-17","productType":"type-C","CategoryId":2,"faultyItems":0,"barcodePath":null,"createdAt":"2025-08-12T14:43:15.000Z","availableStock":11,"stockStatus":"available","color":"white","productCost":1200,"commission":50,"discount":0,"updatedAt":"2025-08-31T12:11:29.000Z","paymentStatus":"PAID","supplierId":1,"categories":{"itemName":"Oraimo earphones","itemModel":"XOS","brand":"Oraimo x","minPrice":1500,"maxPrice":1700,"itemType":"accessories"},"Supplier":{"name":"timothy kinoti ANTONY"}}}




when updating categories and supplier id we are passing their id ,so we have routes that we will utilize to fetch them as shown

/api/category/all

{
    "message": "all categories retrieved successfully",
    "data": [
        {
            "id": 1,
            "itemName": "Samsung",
            "itemModel": "A16S",
            "minPrice": 15000,
            "maxPrice": 25000,
            "brand": "Samsung",
            "category": "mobiles",
            "availableStock": 21
        },
        {
            "id": 2,
            "itemName": "Oraimo earphones",
            "itemModel": "XOS",
            "minPrice": 1500,
            "maxPrice": 1700,
            "brand": "Oraimo x",
            "category": "accessories",
            "availableStock": 2
        },
        {
            "id": 16,
            "itemName": "samsung 4/256 GB",
            "itemModel": "a16s series",
            "minPrice": 15000,
            "maxPrice": 16000,
            "brand": "Samsung ",
            "category": "mobiles",
            "availableStock": 0
        },
        {
            "id": 18,
            "itemName": "Samsung_4/128GB",
            "itemModel": "A05s",
            "minPrice": 15500,
            "maxPrice": 16000,
            "brand": "Samsung",
            "category": "mobiles",
            "availableStock": 0
        }
    ]
}





/api/supplier/supplier

{"data":[{"id":1,"name":"timothy kinoti ANTONY","contactName":"timo muchori","phone":null,"email":"KINOTI@gmail.com","address":"Nairobi CBD","createdAt":"2025-08-11T13:11:39.373Z","updatedAt":"2025-08-11T13:11:39.373Z"}]}