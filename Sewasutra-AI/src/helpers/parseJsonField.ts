export function parseJSONField(field: any): any {
      if (!field) return null;
      
      if (typeof field === 'string') {
         try {
            return JSON.parse(field);
         } catch {
            return null;
         }
      }
      
      return field;
   }