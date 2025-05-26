@Post('import/csv')
@UseInterceptors(FileInterceptor('file'))
importCSV(@UploadedFile() file: Express.Multer.File) {
  return this.importExportService.importCSV(file.buffer);
}

@Get('export/json')
exportToJSON() {
  return this.importExportService.exportToJSON();
}
