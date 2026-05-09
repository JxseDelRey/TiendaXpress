import { Document, Types } from 'mongoose';
export type PromotionDocument = Promotion & Document;
export declare enum DiscountType {
    PERCENTAGE = "porcentaje",
    FIXED = "monto_fijo"
}
export declare class Promotion {
    name: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    applicableProducts: Types.ObjectId[];
    applicableCategories: Types.ObjectId[];
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    minPurchaseAmount: number;
}
export declare const PromotionSchema: import("mongoose").Schema<Promotion, import("mongoose").Model<Promotion, any, any, any, any, any, Promotion>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Promotion, Document<unknown, {}, Promotion, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Promotion & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Promotion, Document<unknown, {}, Promotion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Promotion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string | undefined, Promotion, Document<unknown, {}, Promotion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Promotion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    discountType?: import("mongoose").SchemaDefinitionProperty<DiscountType, Promotion, Document<unknown, {}, Promotion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Promotion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    discountValue?: import("mongoose").SchemaDefinitionProperty<number, Promotion, Document<unknown, {}, Promotion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Promotion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    applicableProducts?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[], Promotion, Document<unknown, {}, Promotion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Promotion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    applicableCategories?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[], Promotion, Document<unknown, {}, Promotion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Promotion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    startDate?: import("mongoose").SchemaDefinitionProperty<Date, Promotion, Document<unknown, {}, Promotion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Promotion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    endDate?: import("mongoose").SchemaDefinitionProperty<Date, Promotion, Document<unknown, {}, Promotion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Promotion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, Promotion, Document<unknown, {}, Promotion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Promotion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    minPurchaseAmount?: import("mongoose").SchemaDefinitionProperty<number, Promotion, Document<unknown, {}, Promotion, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Promotion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Promotion>;
