import { Body, Controller, BadRequestException, Post, Req, UploadedFiles } from '@nestjs/common';
import { OpaService } from '../services/OpaService';
import { ApiBody, ApiConsumes, ApiOkResponse } from '@nestjs/swagger';
import { UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ExecuteDto, ExecuteBodyDto, ExecuteFileDto } from '../dto/ExecuteDto';
import { isEmpty } from '../utils/Base';

@Controller('execute')
export class Execute {
    constructor(private readonly opaService: OpaService) {}
    @Post()
    @ApiOkResponse({
        isArray: true,
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'input' },
        { name: 'policy' },
        { name: 'data' },
    ]))
    @ApiBody({
        type: ExecuteDto,
    })
    async executePost(@UploadedFiles() files: ExecuteFileDto, @Body() body: ExecuteBodyDto): Promise<Record<string, any>[]> {
        if (isEmpty(files.input)) {
            throw new BadRequestException('input', 'Not found input file')
        }
        return this.opaService.execute({
            ...files,
            ...body,
        } as ExecuteDto);
    }
}
