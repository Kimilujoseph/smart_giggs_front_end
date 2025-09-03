export interface SalaryPayment {
    id: number;
    employeeId: number;
    amount: string;
    status: string | null;
    paymentDate: string;
    payPeriodMonth: number;
    payPeriodYear: number;
    processedById: number;
    employee: {
        id: number;
        name: string;
        email: string;
    };
    processedBy: {
        id: number;
        name: string;
        email: string;
    };
}
