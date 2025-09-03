export interface CommissionPayment {
    id: number;
    sellerId: number;
    amountPaid: string;
    status: string | null;
    paymentDate: string;
    periodStartDate: string;
    periodEndDate: string;
    processedById: number;
    seller: {
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
