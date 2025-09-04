we are creating supplier 
/api/supplier/create
{
"name":"timothy kinoti ANTONY",
"contactName":"timo muchori",
"email":"KINOTI@gmail.com",
"address":"Nairobi CBD"
}

a 400 code returns with this message {"message":"A supplier with the same S already exists.","error":true}

when fetching the all supplier 
/api/supplier/all

 [
        {
            "id": 1,
            "name": "timothy kinoti ANTONY",
            "contactName": "timo muchori",
            "phone": null,
            "email": "KINOTI@gmail.com",
            "address": "Nairobi CBD",
            "createdAt": "2025-08-11T13:11:39.373Z",
            "updatedAt": "2025-08-11T13:11:39.000Z"
        },
        {
            "id": 3,
            "name": "Montino Alfred",
            "contactName": "moti",
            "phone": null,
            "email": "montino@gmail.com",
            "address": "Nairobi Kinoti",
            "createdAt": "2025-09-03T18:31:15.175Z",
            "updatedAt": "2025-09-03T18:31:15.000Z"
        }
    ]


for updating /api/supplier/update-profile/1

{
"name":"timothy kinoti ANTONY",
"contactName":"timo muchori",
"email":"KINOTI@gmail.com",
"address":"Nakuru"
}


for getting a particular supplier api/supplier/get/1

{
    "data": {
        "id": 1,
        "name": "timothy kinoti ANTONY",
        "contactName": "timo muchori",
        "phone": null,
        "email": "KINOTI@gmail.com",
        "address": "Nakuru",
        "createdAt": "2025-08-11T13:11:39.373Z",
        "updatedAt": "2025-08-11T13:11:39.000Z"
    }
}