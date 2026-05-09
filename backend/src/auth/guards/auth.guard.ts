import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
}

@Injectable()
export class AdminGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new ForbiddenException('No autenticado');
    }
    if (user.role !== 'admin') {
      throw new ForbiddenException('Solo administradores pueden acceder');
    }
    return user;
  }
}
