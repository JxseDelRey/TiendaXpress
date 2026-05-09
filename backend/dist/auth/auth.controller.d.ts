import { AuthService, LoginDto } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: CreateUserDto): Promise<{
        token: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
            role: import("../users/schemas/user.schema").UserRole;
        };
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
            role: import("../users/schemas/user.schema").UserRole;
            loyaltyPoints: number;
        };
    }>;
}
