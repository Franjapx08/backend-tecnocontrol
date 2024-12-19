const xlsx = require('xlsx');
const path = require('path');
const { send } = require('process');

const exportReport = async (filename, columns, rows, fileType = 'csv') => {
    /** Status default */
    let status = 400;

    if ( !filename || typeof filename !== 'string' ) {
        return 'El parámetro filename es requerido, o no es correcto';
    }

    /** Validamos si tables tiene longitud */
    if (true) {
        /** Crea un nuevo libro de trabajo */
        let workBook = xlsx.utils.book_new();
        
        /** 
         * Recorre el contenido de tables
         * por cada elemento dentro de tables se crea una hoja 
         * en el workBook
         */
        /** Obtiene el nombre de la hoja */
        const sheetName = 'filename'
        
        /**
         * Mapea columns para convertir titulos a Mayus
         * y reemplazar espacio por guion bajo
         */
        columns = columns.map((obj) => {
            obj.title = obj.title.replace(/ /g, '_').toUpperCase();
            return obj;
        });
        
        /**
         * Mapea las rows con las columns para cambiar las
         * propiedades de cada fila e imprimir los titulos en el Excel
        */
        rows = rows.map((obj) => {
            /** Crea un objeto auxiliar */
            let newObj = {};
            /**
             * Recorre todas las columns por cada row para 
             * relacionar los names de columns con los names de rows
             */
            for (const keyCol in columns) {
                /**
                 * Hace el mapeo de la fila y ademas
                 * - limpia espacios vacios trim()
                 * - limpia elementos HTML que puedan venir replace() con una expresion regular
                 * 
                 * Ademas validamos el valor de la propiedad en la fila actual
                 * para la llave de la columna que se esta iterando.
                 */
                if(columns[keyCol].export == undefined){
                    if (columns[keyCol].type == 'text' ) {
                        newObj[columns[keyCol].key] = (obj[columns[keyCol].key] === null || obj[columns[keyCol].key] === undefined) ? '' : obj[columns[keyCol].key];
                    } else {
                        newObj[columns[keyCol].key] = (obj[columns[keyCol].key] === null || obj[columns[keyCol].key] === undefined || obj[columns[keyCol].key].key === undefined || obj[columns[keyCol].key].key === null) ? '' : obj[columns[keyCol].key].key.trim().replace(/(<([^>]+)>)/ig, '');
                    } 
                    if ( columns[keyCol].esNumero !== undefined && columns[keyCol].esNumero == true && !isNaN(newObj[columns[keyCol].key]) && obj[columns[keyCol].key] !== undefined ) {
                        newObj[columns[keyCol].key] = parseFloat(newObj[columns[keyCol].key]);
                    }
                }
            }
            return newObj;
        }); // end map de rows         
          
        /* Definir cabecera. */
        const columnsTitles = columns.map(el => {
            if(el.export == undefined){
                return el.title
            }
        });
        
        let workSheet = xlsx.utils.json_to_sheet(rows);
        /* Sobrescribir la cabecera. */
        workSheet = xlsx.utils.sheet_add_aoa(workSheet, [columnsTitles], { origin: 'A1' });
        
        /** Agrega la hoja al archivo */
        xlsx.utils.book_append_sheet(workBook, workSheet, sheetName);

        /** Ruta y nombre del archivo */
        const exportFileNamePath = `temp/${filename}.${fileType}`;
        
        /** Obtiene el path del archivo donde inicia la aplicación */
        const appPath = path.join(__dirname, '../');
        
        try {
            /** Se escribe el archivo en el servidor */
            
            /* Tipo de archivo por defecto */
            let bookType = {'bookType':'xlsx'};
            
            /* Identificar si tenemos otro tipo de archivo que nos llega de la solicitud */
            if(fileType == 'csv'){
                bookType = {'bookType':'csv'};
            }

            xlsx.writeFile(workBook, appPath + exportFileNamePath, bookType);
            
            /** Ruta en donde se almaceno el archivo en el servidor */
            const downloadPath = appPath + exportFileNamePath;
            return downloadPath;
        } catch (error) {
            console.log(JSON.stringify(error));
            return 'Ocurrió un error., tables no tiene el formato esperado';
        }
    } // end if table.length

    /** respuesta si tables no contenia contenido */
    
}

module.exports = {
    exportReport
}