import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
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
    private generateToken;
    validateUser(payload: any): Promise<import("../users/schemas/user.schema").UserDocument | null>;
}
