const { db } = require('../database/config');

module.exports = class Units {

    /**
     * Obtener todas las unidades
     * @author FJAP <fjavpradev@gmail.com> 2024-12-16 14:42:25
     * @returns 
     */
    async getUnits(id = null, filtro = null, limit = false) {
        var response = [];
        /* Query inicial */
        var query = `
            SELECT 
                u.idgps, u.marca, u.modelo, u.placas, u.serie, u.ano, u.color, u.linea, u.nombre_unidad, u.nombre_grupo,
                IFNULL(ue.start_date, 'No disponible') as ultima_fecha_evento, IFNULL(ue.odometro_kms, 'No disponible') as odometro,
                IFNULL(ue.ubicacion, 'No disponible') as ubicacion, IFNULL(ue.desc_msg, 'No disponible') as evento,  
                IFNULL(ue.lat, 'No disponible') as lat, IFNULL(ue.lon, 'No disponible') as lon 
            FROM units u
            LEFT JOIN unit_events ue
            ON ue.unit_idgps = u.idgps
            WHERE u.deleted_at IS NULL`;
        /* Validar filtros */
        if(filtro != null && filtro.busqueda != null && id == null){
            query += ` AND marca = '${filtro.busqueda}' OR modelo = '${filtro.busqueda}' OR placas = '${filtro.busqueda}' OR serie = '${filtro.busqueda}'`;
        }else if(id != null){
            query += ` AND idgps = ${id}` 
        }else if(filtro != null && filtro.start_date != null && filtro.end_date != null){
            query += ` AND ue.start_date BETWEEN '${filtro.start_date}' AND '${filtro.end_date}'` 
        }
        /* Limitar resultados */
        if(limit){
            query += ` LIMIT ${limit}`;
        }
        /* Get data query */
        await db.promise().query(query).then(([rows, fields]) => {
            response = rows;
        })
        .catch(console.log());
        /* Return data */
        return response;
    }

    /**
     * Crear unidades especificas
     * @author FJAP <fjavpradev@gmail.com> 2024-12-16 15:02:24
     * @returns 
     */
    async create(data) {
        var query = `INSERT INTO units (idgps, marca, modelo, placas, serie, ano, color, linea, nombre_unidad, nombre_grupo) VALUE ('${data.idgps}', '${data.marca}', '${data.modelo}', '${data.placas}', '${data.serie}', '${data.ano}', '${data.color}', '${data.linea}', '${data.nombre_unidad}', '${data.nombre_grupo}')`;
        return await db.promise().query(query).catch(console.log());
    }

    /**
     * Crear multiples unidades
     * @author FJAP <fjavpradev@gmail.com> 2024-12-16 16:22:14
     * @returns 
     */
    async insert(data) {
        var query = `
            INSERT INTO units (idgps, marca, modelo, placas, serie, ano, color, linea, nombre_unidad, nombre_grupo) 
            VALUE ${data} 
            ON DUPLICATE KEY 
            UPDATE marca=marca, modelo=modelo, placas=placas, serie=serie, ano=ano, color=color, linea=linea, nombre_unidad=nombre_unidad, nombre_grupo=nombre_grupo;`;
        return await db.promise().query(query).catch(console.log());
    }

    /**
     * Eliminar todas las unidades
     * @author FJAP <fjavpradev@gmail.com> 2024-12-16 16:56:08
     * @returns 
     */
    async truncateTable(){
        var query = "UPDATE units SET deleted_at = NOW()";
        return await db.promise().query(query).catch(console.log());
    }

}