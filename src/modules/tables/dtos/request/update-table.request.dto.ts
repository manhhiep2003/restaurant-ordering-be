import { PartialType } from '@nestjs/mapped-types';
import { CreateTableRequestDto } from 'src/modules/tables/dtos/request/create-table.request.dto';

export class UpdateTableRequestDto extends PartialType(CreateTableRequestDto) {}
