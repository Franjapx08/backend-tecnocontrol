const { db } = require('../database/config');

module.exports = class UnitEvents {

    /**
     * Obtener todas las unidades
     * @author FJAP <fjavpradev@gmail.com> 2024-12-16 14:42:25
     * @returns 
     */
    async getUnits(id = null, filtro = null) {
        var response = [];
        /* Query inicial */
        var query = 'SELECT * FROM units';
        /* Validar filtros */
        if(filtro != null && id == null){
            query += ` WHERE marca = '${filtro}' OR modelo = '${filtro}' OR placas = '${filtro}' OR serie = '${filtro}'`;
        }else if(id != null){
            query += ` WHERE idgps = ${id}` 
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
     * 
     * @author FJAP <fjavpradev@gmail.com> 
     * @returns 
     */
    async get(filtro = null) {
        var response = [];
        /* Query inicial */
        var query = 'SELECT * FROM unit_events';
        /* Validar filtros */
        if (Object.entries(filtro)?.length) {
            query += ` WHERE `;
            Object.keys(filtro).forEach((fKey, index) => {
                if (index < Object.entries(filtro).length - 1) {
                query = query + `${fKey}='${filtro[fKey]}' AND `
                } else {
                query = query + `${fKey}='${filtro[fKey]}'`
                }
            });
        }
        console.log(query);
        
        //query += " LIMIT 1";
        /* Get data query */
        await db.promise().query(query).then(([rows, fields]) => {
            response = rows;
        })
        .catch(console.log());
        /* Return data */
        return response;
    }

    /**
     * Crear multiples registros
     * @author FJAP <fjavpradev@gmail.com> 2024-12-16 18:02:43
     * @returns 
     */
    async insert(data) {
        var query = `INSERT INTO unit_events (start_date, end_date, name_device, imei, dt_msg, id_msg, id_msg_type, desc_msg, lat, lon, ubicacion, vel, dtmsg, ignicion, odometro_kms, dir, nombre_grupo, unit_idgps) VALUE ${data}`;
        return await db.promise().query(query).catch(console.log());
    }

    /**
     * Eliminar todas las unidades
     * @author FJAP <fjavpradev@gmail.com> 2024-12-16 16:56:08
     * @returns 
     */
    async truncateTable(){
        var query = "TRUNCATE TABLE units";
        return await db.promise().query(query).catch(console.log());
    }

}