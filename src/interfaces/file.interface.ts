import { Express } from "express";

export abstract class FileValidator<TValidationOptions = Record<string, any>> {
  constructor(protected readonly validationOptions: TValidationOptions) {}

  abstract isValid(file?: Express.Multer.File): boolean | Promise<boolean>;

  abstract buildErrorMessage(file: Express.Multer.File): string;
}
