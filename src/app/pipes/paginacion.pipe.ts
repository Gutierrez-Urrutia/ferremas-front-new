import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paginacion'
})
export class PaginacionPipe implements PipeTransform {
  transform(array: any[], page: number = 1, itemsPerPage: number = 10): any[] {
    if (!array || array.length === 0) {
      return [];
    }
    
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return array.slice(startIndex, endIndex);
  }
}