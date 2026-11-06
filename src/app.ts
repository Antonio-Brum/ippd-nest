import "reflect-metadata";
import { Body, Controller, Delete, Get, HttpCode, Module, Param, Patch, Post, Put, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Store } from "./store";

class CreateDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

class UpdateDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}

function resource(collection: string) {
  @Controller(collection)
  class ResourceController {
    constructor(private readonly store: Store) {}
    @Get() list() { return this.store.list(collection); }
    @Get(":id") get(@Param("id") id: string) { return this.store.get(collection, id); }
    @Post() create(@Body() body: CreateDto) { return this.store.create(collection, body.name); }
    @Put(":id") replace(@Param("id") id: string, @Body() body: CreateDto) { return this.store.update(collection, id, body.name); }
    @Patch(":id") update(@Param("id") id: string, @Body() body: UpdateDto) { return this.store.update(collection, id, body.name); }
    @Delete(":id") @HttpCode(204) remove(@Param("id") id: string) { this.store.remove(collection, id); }
  }
  @Module({ controllers: [ResourceController], providers: [Store] })
  class ResourceModule {}
  return ResourceModule;
}

@Module({ imports: [resource("tasks"), resource("projects")] })
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
