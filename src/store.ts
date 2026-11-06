import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type Item = { id: string; name: string };

@Injectable()
export class Store {
  private path(collection: string) {
    const dir = process.env.DATA_DIR || join(process.cwd(), "data");
    mkdirSync(dir, { recursive: true });
    return join(dir, `${collection}.json`);
  }

  list(collection: string): Item[] {
    try { return JSON.parse(readFileSync(this.path(collection), "utf8")); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  }

  get(collection: string, id: string): Item {
    const item = this.list(collection).find(item => item.id === id);
    if (!item) throw new NotFoundException("Registro não encontrado");
    return item;
  }

  save(collection: string, items: Item[]) {
    const path = this.path(collection);
    const temporary = `${path}.${randomUUID()}.tmp`;
    writeFileSync(temporary, JSON.stringify(items, null, 2));
    renameSync(temporary, path);
  }

  create(collection: string, name: string) {
    const items = this.list(collection);
    const item = { id: randomUUID(), name };
    items.push(item);
    this.save(collection, items);
    return item;
  }

  update(collection: string, id: string, name?: string) {
    const items = this.list(collection);
    const item = items.find(item => item.id === id);
    if (!item) throw new NotFoundException("Registro não encontrado");
    if (name !== undefined) item.name = name;
    this.save(collection, items);
    return item;
  }

  remove(collection: string, id: string) {
    const items = this.list(collection);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) throw new NotFoundException("Registro não encontrado");
    items.splice(index, 1);
    this.save(collection, items);
  }
}
