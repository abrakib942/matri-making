import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as path from 'path';

@Injectable()
export class TemplateService {
  private readonly templatesPath: string;

  constructor() {
    // Path to email-templates directory
    // The templates are located at: apps/api/email-templates by default
    // Uses automatic path resolution: process.cwd() -> __dirname fallback

    const cwd = process.cwd();
    console.debug('TemplateService -> constructor -> process.cwd()', { cwd });

    // Try multiple strategies to find the templates directory
    let templatesPath: string | null = null;

    // Strategy 1: Use process.cwd() (most reliable - app runs from apps/api)
    const cwdTemplatesPath = path.join(cwd, 'email-templates');
    if (fs.existsSync(cwdTemplatesPath)) {
      templatesPath = cwdTemplatesPath;
      console.debug('TemplateService -> constructor -> found templates using cwd strategy', {
        path: templatesPath,
      });
    } else {
      // Strategy 2: Try relative to __dirname (fallback)
      const isInDistFolder = __dirname.includes(path.sep + 'dist' + path.sep);
      const basePath = isInDistFolder
        ? path.join(__dirname, '../../..') // dist/src/util -> apps/api
        : path.join(__dirname, '../..'); // src/util -> apps/api
      const dirnameTemplatesPath = path.join(basePath, 'email-templates');

      if (fs.existsSync(dirnameTemplatesPath)) {
        templatesPath = dirnameTemplatesPath;
        console.debug(
          'TemplateService -> constructor -> found templates using __dirname strategy',
          {
            path: templatesPath,
          },
        );
      }
    }

    // If still not found, use cwd as default (will show error in logs)
    this.templatesPath = templatesPath || cwdTemplatesPath;

    const isProduction = process.env.NODE_ENV === 'production';
    const isInDistFolder = __dirname.includes(path.sep + 'dist' + path.sep);

    console.debug('TemplateService -> constructor -> initialized', {
      isProduction,
      isInDistFolder,
      __dirname,
      cwd,
      templatesPath: this.templatesPath,
      resolvedTemplatesPath: path.resolve(this.templatesPath),
      nodeEnv: process.env.NODE_ENV,
      found: templatesPath !== null,
    });

    // Verify templates directory exists
    if (!fs.existsSync(this.templatesPath)) {
      console.error('TemplateService -> constructor -> templates directory not found', {
        templatesPath: this.templatesPath,
        resolvedPath: path.resolve(this.templatesPath),
        cwd,
        // Try alternative paths for debugging
        alternativePaths: [
          path.join(cwd, 'email-templates'),
          path.join(__dirname, '../../email-templates'),
          path.join(__dirname, '../../../email-templates'),
        ].map(p => ({ path: p, exists: fs.existsSync(p) })),
      });
    } else {
      console.debug('TemplateService -> constructor -> templates directory found', {
        templatesPath: this.templatesPath,
        resolvedPath: path.resolve(this.templatesPath),
        contents: fs.readdirSync(this.templatesPath),
      });
    }
  }

  renderTemplate(templateName: string, data: Record<string, unknown>): string {
    console.debug('TemplateService -> renderTemplate -> called', {
      templateName,
      dataKeys: Object.keys(data),
      templatesPath: this.templatesPath,
    });

    try {
      const templatePath = path.join(this.templatesPath, templateName, 'index.hbs');
      const resolvedTemplatePath = path.resolve(templatePath);

      console.debug('TemplateService -> renderTemplate -> template path resolved', {
        templatePath,
        resolvedTemplatePath,
        exists: fs.existsSync(templatePath),
      });

      if (!fs.existsSync(templatePath)) {
        // List available templates for debugging
        const availableTemplates = fs.existsSync(this.templatesPath)
          ? fs.readdirSync(this.templatesPath)
          : [];
        console.error('TemplateService -> renderTemplate -> template not found', {
          requestedTemplate: templateName,
          templatePath,
          resolvedTemplatePath,
          templatesPath: this.templatesPath,
          availableTemplates,
        });
        throw new Error(
          `Template not found: ${templatePath}. Available templates: ${availableTemplates.join(', ')}`,
        );
      }

      console.debug('TemplateService -> renderTemplate -> reading template file', {
        templatePath,
      });

      const templateContent = fs.readFileSync(templatePath, 'utf-8');

      console.debug('TemplateService -> renderTemplate -> template content read', {
        templatePath,
        contentLength: templateContent.length,
        contentPreview: templateContent.substring(0, 100),
      });

      console.debug('TemplateService -> renderTemplate -> compiling handlebars template', {
        templateName,
      });

      const template = handlebars.compile(templateContent);

      console.debug('TemplateService -> renderTemplate -> rendering template with data', {
        templateName,
        data,
      });

      const renderedHtml = template(data);

      console.debug('TemplateService -> renderTemplate -> template rendered successfully', {
        templateName,
        renderedHtmlLength: renderedHtml.length,
        renderedHtmlPreview: renderedHtml.substring(0, 200),
      });

      return renderedHtml;
    } catch (error) {
      console.error(`TemplateService -> renderTemplate -> error for template "${templateName}":`, {
        templateName,
        templatesPath: this.templatesPath,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
      });
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to render template: ${templateName}. ${errorMessage}`);
    }
  }
}
