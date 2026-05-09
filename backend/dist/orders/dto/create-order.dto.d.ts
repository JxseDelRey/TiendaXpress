export declare class OrderItemDto {
    product: string;
    quantity: number;
}
export declare class CreateOrderDto {
    items: OrderItemDto[];
    customerName?: string;
    customerDocument?: string;
    customerPhone?: string;
    notes?: string;
    paymentMethod?: string;
}
