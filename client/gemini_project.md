now lets work on the salary and commission management list 

/api/commissions/ this gets a list of commission 

/api/commissions/?page=1&limit=10

{
    "success": true,
    "message": "Commission payments retrieved successfully",
    "data": {
        "payments": [
            {
                "id": 9,
                "sellerId": 2,
                "amountPaid": "100",
                "status": null,
                "paymentDate": "2025-09-02T13:47:35.196Z",
                "periodStartDate": "2025-09-02T13:47:35.196Z",
                "periodEndDate": "2025-09-02T13:47:35.196Z",
                "processedById": 1,
                "seller": {
                    "id": 2,
                    "name": "Tony Trace Antony",
                    "email": "tracee@gmail.com"
                },
                "processedBy": {
                    "id": 1,
                    "name": "Timothy Joseph Kimilu",
                    "email": "timothyjoseph8580@gmail.com"
                }
            },
            {
                "id": 8,
                "sellerId": 2,
                "amountPaid": "45",
                "status": null,
                "paymentDate": "2025-09-02T13:44:15.924Z",
                "periodStartDate": "2025-09-02T13:44:15.924Z",
                "periodEndDate": "2025-09-02T13:44:15.924Z",
                "processedById": 1,
                "seller": {
                    "id": 2,
                    "name": "Tony Trace Antony",
                    "email": "tracee@gmail.com"
                },
                "processedBy": {
                    "id": 1,
                    "name": "Timothy Joseph Kimilu",
                    "email": "timothyjoseph8580@gmail.com"
                }
            },
            {
                "id": 2,
                "sellerId": 2,
                "amountPaid": "50",
                "status": "VOIDED",
                "paymentDate": "2025-08-17T10:00:00.000Z",
                "periodStartDate": "2025-07-01T00:00:00.000Z",
                "periodEndDate": "2025-07-31T23:59:59.000Z",
                "processedById": 1,
                "seller": {
                    "id": 2,
                    "name": "Tony Trace Antony",
                    "email": "tracee@gmail.com"
                },
                "processedBy": {
                    "id": 1,
                    "name": "Timothy Joseph Kimilu",
                    "email": "timothyjoseph8580@gmail.com"
                }
            },
            {
                "id": 5,
                "sellerId": 2,
                "amountPaid": "50",
                "status": "VOIDED",
                "paymentDate": "2025-08-17T10:00:00.000Z",
                "periodStartDate": "2025-07-01T00:00:00.000Z",
                "periodEndDate": "2025-07-31T23:59:59.000Z",
                "processedById": 1,
                "seller": {
                    "id": 2,
                    "name": "Tony Trace Antony",
                    "email": "tracee@gmail.com"
                },
                "processedBy": {
                    "id": 1,
                    "name": "Timothy Joseph Kimilu",
                    "email": "timothyjoseph8580@gmail.com"
                }
            }
        ],
        "total": 4,
        "totalPages": 1,
        "currentPage": 1
    }
}
you can void a commission payment 

/api/commissions/pay/5/void

then we have salary payment which i think we should have modal on user management 

so for salary payment we are passing the following payload

/api/salaries/pay

{
    "employeeId": 2,
    "amount": 5000,
    "paymentDate": "2025-08-17T10:00:00Z",
    "payPeriodMonth": 7,
    "payPeriodYear": 2025

}

to fetch all salaries /api/salaries/?page=1&limit=10

{"success":true,"message":"Salary payments retrieved successfully","data":{"payments":[{"id":1,"employeeId":2,"amount":"5000","status":"VOIDED","paymentDate":"2025-08-17T10:00:00.000Z","payPeriodMonth":7,"payPeriodYear":2025,"processedById":1,"employee":{"id":2,"name":"Tony Trace Antony","email":"tracee@gmail.com"},"processedBy":{"id":1,"name":"Timothy Joseph Kimilu","email":"timothyjoseph8580@gmail.com"}}],"total":1,"totalPages":1,"currentPage":1}}

you can void a salary payment 

api/salaries/pay/5/void