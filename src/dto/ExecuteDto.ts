import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ExecuteBodyDto {
    @ApiProperty({
        description: 'Result Rego function',
        example: 'result := data #input',
        required: true,
    })
    @IsNotEmpty()
    query: string;
    @ApiProperty({
        required: false,
        description: 'JSON path',
        example: 'result.*.bindings.result',
        default: 'result.*.bindings',
    })
    resultPath: string;
}

export class ExecuteFileDto {
    @IsNotEmpty()
    input: Express.Multer.File[];
    policy?: Express.Multer.File[];
    data?: Express.Multer.File[];
}

export class ExecuteDto extends ExecuteBodyDto {
    @ApiProperty({ type: 'array', required: true, items: { type: 'string', format: 'binary' } })
    input: Express.Multer.File[];
    @ApiProperty({ type: 'array', required: false, items: { type: 'string', format: 'binary' } })
    policy?: Express.Multer.File[];
    @ApiProperty({ type: 'array', required: false, items: { type: 'string', format: 'binary' } })
    data?: Express.Multer.File[];
}
  