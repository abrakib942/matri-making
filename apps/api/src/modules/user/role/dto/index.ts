import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

class RoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

export { RoleDto as CreateRoleDto, RoleDto as UpdateRoleDto };

export class AssignRolePermissionsDto {
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  permissionIds: number[];
}
