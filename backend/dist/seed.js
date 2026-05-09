"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt = __importStar(require("bcryptjs"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || '';
const UserSchema = new mongoose_1.default.Schema({
    name: String, email: String, password: String, role: String,
    isActive: Boolean, loyaltyPoints: Number, totalPurchases: Number,
}, { timestamps: true });
const CategorySchema = new mongoose_1.default.Schema({
    name: String, icon: String, color: String, description: String, isActive: Boolean,
}, { timestamps: true });
const ProductSchema = new mongoose_1.default.Schema({
    name: String, description: String, price: Number, discountPercent: Number,
    category: mongoose_1.default.Schema.Types.ObjectId, stock: Number, lowStockAlert: Number,
    images: [String], isFeatured: Boolean, isActive: Boolean, soldCount: Number,
    costPrice: Number, unit: String, tags: [String],
}, { timestamps: true });
const UserModel = mongoose_1.default.model('User', UserSchema);
const CategoryModel = mongoose_1.default.model('Category', CategorySchema);
const ProductModel = mongoose_1.default.model('Product', ProductSchema);
const categories = [
    { name: 'Bebidas', icon: '🥤', color: '#3B82F6', description: 'Refrescos, jugos, agua y más' },
    { name: 'Snacks', icon: '🍿', color: '#F59E0B', description: 'Papas, maíz, galletas' },
    { name: 'Lácteos', icon: '🥛', color: '#8B5CF6', description: 'Leche, queso, yogurt' },
    { name: 'Panadería', icon: '🍞', color: '#D97706', description: 'Pan, tortas, ponqué' },
    { name: 'Frutas y Verduras', icon: '🥦', color: '#10B981', description: 'Productos frescos' },
    { name: 'Carnes', icon: '🥩', color: '#EF4444', description: 'Res, pollo, cerdo' },
    { name: 'Aseo', icon: '🧴', color: '#6366F1', description: 'Productos de limpieza' },
    { name: 'Dulces', icon: '🍬', color: '#EC4899', description: 'Chocolates, caramelos' },
];
async function seed() {
    console.log('🌱 Conectando a MongoDB Atlas...');
    await mongoose_1.default.connect(MONGODB_URI);
    console.log('✅ Conectado!');
    await UserModel.deleteMany({});
    await CategoryModel.deleteMany({});
    await ProductModel.deleteMany({});
    console.log('🗑️  Colecciones limpiadas');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await UserModel.create({
        name: 'Administrador', email: 'admin@tiendaxpress.com',
        password: hashedPassword, role: 'admin', isActive: true,
        loyaltyPoints: 0, totalPurchases: 0,
    });
    console.log('👤 Admin creado: admin@tiendaxpress.com / admin123');
    const createdCats = await CategoryModel.insertMany(categories.map(c => ({ ...c, isActive: true })));
    console.log(`📦 ${createdCats.length} categorías creadas`);
    const catMap = {};
    createdCats.forEach((c) => { catMap[c.name] = c._id; });
    const products = [
        { name: 'Coca-Cola 600ml', description: 'Refresco de cola clásico bien frío', price: 3500, costPrice: 2200, stock: 48, lowStockAlert: 10, category: catMap['Bebidas'], isFeatured: true, discountPercent: 0, unit: 'unidad', tags: ['refresco', 'cola'], images: ['https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400'] },
        { name: 'Agua Cristal 500ml', description: 'Agua purificada natural', price: 2000, costPrice: 1100, stock: 72, lowStockAlert: 15, category: catMap['Bebidas'], isFeatured: false, discountPercent: 0, unit: 'unidad', tags: ['agua', 'hidratación'], images: ['https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400'] },
        { name: 'Jugo Hit Mango 200ml', description: 'Jugo natural de mango', price: 2500, costPrice: 1500, stock: 36, lowStockAlert: 8, category: catMap['Bebidas'], isFeatured: false, discountPercent: 10, unit: 'unidad', tags: ['jugo', 'mango', 'natural'], images: ['https://images.unsplash.com/photo-1622598046689-c3b7e1f1f3fc?w=400'] },
        { name: 'Gaseosa Pepsi 1.5L', description: 'Pepsi tamaño familiar', price: 5500, costPrice: 3800, stock: 24, lowStockAlert: 6, category: catMap['Bebidas'], isFeatured: true, discountPercent: 0, unit: 'unidad', tags: ['pepsi', 'refresco'], images: ['https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=400'] },
        { name: 'Papas Margarita 110g', description: 'Papas fritas clásicas sabor original', price: 4200, costPrice: 2800, stock: 30, lowStockAlert: 5, category: catMap['Snacks'], isFeatured: true, discountPercent: 0, unit: 'paquete', tags: ['papas', 'snack'], images: ['https://images.unsplash.com/photo-1621623809702-c7e6b38fc3e6?w=400'] },
        { name: 'Chocoramo', description: 'El ponqué bañado en chocolate más famoso de Colombia', price: 2800, costPrice: 1800, stock: 40, lowStockAlert: 10, category: catMap['Snacks'], isFeatured: true, discountPercent: 0, unit: 'unidad', tags: ['ponqué', 'chocolate', 'colombiano'], images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'] },
        { name: 'Natuchips Limón 150g', description: 'Snack de maíz con limón', price: 3800, costPrice: 2500, stock: 4, lowStockAlert: 5, category: catMap['Snacks'], isFeatured: false, discountPercent: 15, unit: 'paquete', tags: ['maiz', 'limón', 'snack'], images: ['https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400'] },
        { name: 'Leche Alquería 1L', description: 'Leche entera pasteurizada', price: 4800, costPrice: 3500, stock: 18, lowStockAlert: 6, category: catMap['Lácteos'], isFeatured: false, discountPercent: 0, unit: 'litro', tags: ['leche', 'lácteo'], images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400'] },
        { name: 'Yogurt Alpina Fresa 200g', description: 'Yogurt cremoso sabor fresa', price: 3200, costPrice: 2100, stock: 20, lowStockAlert: 5, category: catMap['Lácteos'], isFeatured: false, discountPercent: 0, unit: 'unidad', tags: ['yogurt', 'fresa', 'lácteo'], images: ['https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400'] },
        { name: 'Queso Campesino 250g', description: 'Queso fresco artesanal', price: 7500, costPrice: 5500, stock: 3, lowStockAlert: 4, category: catMap['Lácteos'], isFeatured: false, discountPercent: 0, unit: 'unidad', tags: ['queso', 'lácteo', 'fresco'], images: ['https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400'] },
        { name: 'Pan Tajado Bimbo', description: 'Pan de molde suave blanco', price: 6800, costPrice: 5000, stock: 12, lowStockAlert: 4, category: catMap['Panadería'], isFeatured: false, discountPercent: 0, unit: 'paquete', tags: ['pan', 'molde'], images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'] },
        { name: 'Croissant de Mantequilla', description: 'Croissant artesanal hojaldrado', price: 3500, costPrice: 2200, stock: 8, lowStockAlert: 3, category: catMap['Panadería'], isFeatured: true, discountPercent: 0, unit: 'unidad', tags: ['croissant', 'hojaldre', 'mantequilla'], images: ['https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400'] },
        { name: 'Banano x6', description: 'Racimo de bananos maduros frescos', price: 3000, costPrice: 1800, stock: 25, lowStockAlert: 8, category: catMap['Frutas y Verduras'], isFeatured: false, discountPercent: 0, unit: 'racimo', tags: ['fruta', 'banano'], images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400'] },
        { name: 'Tomate Chonto kg', description: 'Tomate fresco rojo por kilo', price: 4500, costPrice: 2800, stock: 15, lowStockAlert: 5, category: catMap['Frutas y Verduras'], isFeatured: false, discountPercent: 0, unit: 'kg', tags: ['tomate', 'verdura', 'fresco'], images: ['https://images.unsplash.com/photo-1558818498-28c1e002b655?w=400'] },
        { name: 'Detergente Ariel 500g', description: 'Detergente en polvo multiplanet', price: 8500, costPrice: 6200, stock: 20, lowStockAlert: 5, category: catMap['Aseo'], isFeatured: false, discountPercent: 0, unit: 'paquete', tags: ['detergente', 'aseo', 'ropa'], images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'] },
        { name: 'Jabón Protex 120g', description: 'Jabón antibacterial', price: 3800, costPrice: 2500, stock: 35, lowStockAlert: 8, category: catMap['Aseo'], isFeatured: false, discountPercent: 0, unit: 'unidad', tags: ['jabón', 'aseo', 'antibacterial'], images: ['https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400'] },
        { name: 'Chocolate Jet', description: 'El chocolate de Colombia de siempre', price: 2500, costPrice: 1600, stock: 50, lowStockAlert: 10, category: catMap['Dulces'], isFeatured: true, discountPercent: 0, unit: 'unidad', tags: ['chocolate', 'dulce', 'colombiano'], images: ['https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400'] },
        { name: 'Masmelos Golpe', description: 'Malvaviscos suaves variados', price: 1800, costPrice: 1000, stock: 45, lowStockAlert: 10, category: catMap['Dulces'], isFeatured: false, discountPercent: 0, unit: 'paquete', tags: ['masmelo', 'dulce', 'malvavisco'], images: ['https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400'] },
        { name: 'Pechuga de Pollo kg', description: 'Pechuga fresca sin hueso', price: 18000, costPrice: 13500, stock: 8, lowStockAlert: 3, category: catMap['Carnes'], isFeatured: false, discountPercent: 0, unit: 'kg', tags: ['pollo', 'carne', 'proteína'], images: ['https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400'] },
        { name: 'Carne Molida 500g', description: 'Carne molida de res fresca', price: 14000, costPrice: 10500, stock: 5, lowStockAlert: 3, category: catMap['Carnes'], isFeatured: false, discountPercent: 5, unit: 'unidad', tags: ['carne', 'res', 'molida'], images: ['https://images.unsplash.com/photo-1588347818036-c5e4e5af69d6?w=400'] },
    ];
    const createdProducts = await ProductModel.insertMany(products.map(p => ({ ...p, isActive: true, soldCount: Math.floor(Math.random() * 50) })));
    console.log(`🛒 ${createdProducts.length} productos creados`);
    console.log('\n✅ ¡Seed completado exitosamente!');
    console.log('─────────────────────────────────');
    console.log('🔑 Admin: admin@tiendaxpress.com');
    console.log('🔑 Password: admin123');
    console.log('─────────────────────────────────');
    await mongoose_1.default.disconnect();
}
seed().catch(err => {
    console.error('❌ Error en seed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map