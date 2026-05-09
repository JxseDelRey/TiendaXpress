import { Document, Types } from 'mongoose';
export type InventoryMovementDocument = InventoryMovement & Document;
export declare enum MovementType {
    IN = "entrada",
    OUT = "salida",
    ADJUSTMENT = "ajuste"
}
export declare class InventoryMovement {
    product: Types.ObjectId;
    productName: string;
    type: MovementType;
    quantity: number;
    previousStock: number;
    newStock: number;
    reason?: string;
    createdBy?: Types.ObjectId;
}
export declare const InventoryMovementSchema: import("mongoose").Schema<InventoryMovement, import("mongoose").Model<InventoryMovement, any, any, any, any, any, InventoryMovement>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, InventoryMovement, Document<unknown, {}, InventoryMovement, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<InventoryMovement & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    product?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, InventoryMovement, Document<unknown, {}, InventoryMovement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryMovement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    productName?: import("mongoose").SchemaDefinitionProperty<string, InventoryMovement, Document<unknown, {}, InventoryMovement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryMovement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<MovementType, InventoryMovement, Document<unknown, {}, InventoryMovement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryMovement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    quantity?: import("mongoose").SchemaDefinitionProperty<number, InventoryMovement, Document<unknown, {}, InventoryMovement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryMovement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    previousStock?: import("mongoose").SchemaDefinitionProperty<number, InventoryMovement, Document<unknown, {}, InventoryMovement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryMovement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    newStock?: import("mongoose").SchemaDefinitionProperty<number, InventoryMovement, Document<unknown, {}, InventoryMovement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryMovement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    reason?: import("mongoose").SchemaDefinitionProperty<string | undefined, InventoryMovement, Document<unknown, {}, InventoryMovement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryMovement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, InventoryMovement, Document<unknown, {}, InventoryMovement, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryMovement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, InventoryMovement>;
