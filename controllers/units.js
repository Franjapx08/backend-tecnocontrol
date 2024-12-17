const axios = require('axios').default;
const Units = require('../models/units');
const UnitEvents = require('../models/unitEvents');
const { exportReport, formatDate } = require('../helpers');


/**
 * Obtener unidades almacenadas en BD
 * @author 2024-12-16 14:25:24
 * @param {*} req 
 * @param {*} res 
 */
const getAll = async(req, res) => {
    const { idgps, busqueda } = req.query;
    try {
        const units = new Units();
        const result = await units.getUnits(idgps, {busqueda});
        res.status(200).json({
            code: 200,
            msg: 'Éxito',
            data: result
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'Ocurrio un error'
        });
    }
}

/**
 * Obtener unidad by id
 * @author FJAP <fjavpradev@gmail.com> 2024-12-16 16:55:32
 * @param {*} req 
 * @param {*} res 
 */
const getById = async (req, res) => {
    const { id } = req.params;
    try {
        const units = new Units();
        const result = await units.getUnits(id);
        res.status(200).json({
            code: 200,
            msg: 'Éxito',
            data: result
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'Ocurrio un error'
        });
    }
}

/**
 * Crear registro de unidad
 * @author 2024-12-16 15:02:24
 * @param {*} req 
 * @param {*} res 
 */
const create = async(req, res) => {
    const { 
        idgps, marca, modelo,
        placas, serie, ano,
        color, linea, nombre_unidad, 
        nombre_grupo
    } = req.body;
    try {
        const units = new Units();
        const result = await units.create({idgps, marca, modelo, placas, serie, ano, color, linea, nombre_unidad, nombre_grupo});
        res.status(200).json({
            code: 200,
            msg: 'Unidad creada con éxito'
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'Ocurrio un error'
        });
    }
}

/**
 * Obtener e importar unidades de API tecnocontrol
 * @author FJAP <fjavpradev@gmail.com> 2024-12-16 15:51:38
 * @param {*} req 
 * @param {*} res 
 */
const importUnitEvents = async(req, res) => {
    try {
        /* Importar unidades */
        await importUnits();
        /* Importar eventos */
        await importEvents();
        /* Retornar Resultado */
        res.status(200).json({
            code: 200,
            msg: 'Unidades creadas con éxito'
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'Ocurrio un error'
        });
    }
}

/**
 * Importar unidades
 * @author FJPA 2024-12-17 13:21:03
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const importUnits = async(req, res) => {
    try {
        /* Get api obtener unidades */
        const options = {
          method: 'GET',
          url: process.env.TECNOCONTROLURL+'units',
          headers: {'Tcv-Client-Id': process.env.TECNOCONTROLPRIVATEKEY, Accept: 'application/json'}
        };
        try {
            /* Consumir API */
            const { data } = await axios.request(options);
            /* Construir query insert para BD */
            const dataInsert = data.map(r => {
                return `(${r.IDGPS},'${r.MARCA}','${r.MODELO}','${r.PLACAS}','${r.SERIE}','${r.ANO}','${r.COLOR}','${r.LINEA}','${r.NOMBRE_UNIDAD}','${r.NOMBRE_GRUPO}')`
            })
            /* Construir query para inserción a bd */
            var query = "";
            dataInsert.forEach((e,k) => {
                if(k == 0){
                    query += e;
                }else{
                    query +=  "," + e;
                }
            });
            /* Inicializar modelo de unidades */
            const units = new Units();
            /* Vaciar tabla de unidades */
            //await units.truncateTable();
            /* Llenar tabla de unidades de respuesta */
            return await units.insert(query);
        } catch (error) {
          console.error(error);
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'Ocurrio un error'
        });
    }
}

/**
 * Importar ultimos eventos
 * @author FJAP 2024-12-17 13:20:03
 * @param {*} req 
 * @param {*} res 
 */
const importEvents = async(req, res) => {
    try {
        var d = new Date();
        d.setHours(d.getHours() + 1);
        d.setMinutes(d.getMinutes() - 5);
        var startDate = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.toLocaleTimeString();
        d.setMinutes(d.getMinutes() + 5);
        var endDate = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + (d.toLocaleTimeString());
        console.log(startDate + '  ' + endDate);
        /* Obtener todas las unidades de BD */
        const units = new Units();
        const result = await units.getUnits(null, null, 20);
        /* Valores para consultar API */
        const options = {
            method: 'GET',
            url: process.env.TECNOCONTROLURL,
            headers: {'Tcv-Client-Id': process.env.TECNOCONTROLPRIVATEKEY, Accept: 'application/json'}
          };
        /* Recorrer unidades para almacenar sus eventos del mes actual */
        const dataTotal = [];
        result.forEach(async(e, k) => {
            try {
                /* API eventos Query params para ruta */
                options.url = process.env.TECNOCONTROLURL+`events?dtini=${startDate}&dtfin=${endDate}&idgps=${e.idgps}`
                /* Consumir API */
                const { data } = await axios.request(options);
                /* Construir query insert para BD */
                var dataInsert = '';
                var dataSelect = '';
                if(data[0] && data.length > 0){                    
                    data.forEach((r, k) => {
                        if(k == 0){
                            dataInsert = `('${r.DT_MSG}', '${r.DT_MSG}', '${r.NAME_DEVICE}','${r.IMEI}','${r.DT_MSG}','${r.ID_MSG}','${r.ID_MSG_TYPE}','${r.DESC_MSG}','${r.LAT}','${r.LON}','${r.UBICACION}','${r.VEL}','${r.DTMSG}','${r.IGNICION}','${r.ODOMETRO_KMS}','${r.DIR}','${r.NOMBRE_GRUPO}',${e.idgps})`
                            dataSelect = {
                                name_device: r.NAME_DEVICE,
                                imei: r.IMEI,
                                dt_msg: r.DT_MSG,
                                id_msg: r.ID_MSG,
                                id_msg_type: r.ID_MSG_TYPE,
                                desc_msg: r.DESC_MSG,
                                lat: r.LAT,
                                lon: r.LON,
                                ubicacion: r.UBICACION,
                                vel: r.VEL,
                                dtmsg: r.DTMSG,
                                ignicion: r.IGNICION,
                                odometro_kms: r.ODOMETRO_KMS,
                                dir: r.DIR,
                                nombre_grupo: r.NOMBRE_GRUPO,
                                unit_idgps: e.idgps
                            };
                        }
                    })
                }else{
                    /* API ultimo evento Query params para ruta */
                    options.url = process.env.TECNOCONTROLURL+`ultimoEvent?idgps=${e.idgps}`
                    /* Consumir API */
                    const { data } = await axios.request(options);
                    if(data[0] && data.length > 0){
                        data.forEach((r, k) => {
                            if(k == 0){
                                dataInsert = `('${formatDate(r.FECHA)}', '${formatDate(r.FECHA)}', '${r.ID_UNIDAD}','${r.IMEI}','${formatDate(r.FECHA)}','${r.ID_MSG}','null','${r.OBSERVACIONES}','${r.LATITUD}','${r.LONGITUD}','${r.GEOCERCA}','${r.VELOCIDAD}','null','${r.IGNICION}','${r.ODOMETRO_TOTAL}','${r.DIR}','null',${e.idgps})`
                                dataSelect = {
                                    name_device: r.ID_UNIDAD,
                                    imei: r.IMEI,
                                    id_msg: r.ID_MSG,
                                    lat: r.LATITUD,
                                    lon: r.LONGITUD,
                                    ubicacion: r.GEOCERCA,
                                    vel: r.VELOCIDAD,
                                    ignicion: r.IGNICION,
                                    odometro_kms: r.ODOMETRO_TOTAL,
                                    dir: r.DIR,
                                    unit_idgps: e.idgps
                                };
                            }
                        })
                    }
                }
                /* Inicializar modelo de eventos de unidades */
                const unitEvents = new UnitEvents();
                /* Verificar si el dato cambio */
                const unitEvent = await unitEvents.get(dataSelect);
                if(dataInsert && (unitEvent.length == 0 || !unitEvent)){
                    /* Insertar query */
                    await unitEvents.insert(dataInsert);
                }
            } catch (error) {
                console.error(error);
            }
            return;
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'Ocurrio un error'
        });
    }
}

/**
 * Obtener reporte de unidades considerando filtros
 * @author FJAP <fjavpradev@gmail.com> 2024-12-17 02:18:04
 * @param {*} req 
 * @param {*} res 
 */
const getReport = async(req, res) => {
    const { idgps, busqueda, start_date, end_date } = req.query;
    try {
        /* Obtener data */
        const units = new Units();
        const result = await units.getUnits(idgps, {busqueda, start_date, end_date});
        /* Columnas csv */
        let columns = [
            {
                name: 'idgps',
                title: 'idgps',
                type: 'text'
            },
            {
                name: 'marca',
                title: 'MARCA',
                type: 'text'
            },
            {
                name: 'modelo',
                title: 'MODELO',
                type: 'text'
            },
            {
                name: 'placas',
                title: 'PLACAS',
                type: 'text'
            },
            {
                name: 'serie',
                title: 'SERIE',
                type: 'text'
            },
            {
                name: 'ano',
                title: 'ANO',
                type: 'text'
            },
            {
                name: 'color',
                title: 'COLOR',
                type: 'text'
            },
            {
                name: 'linea',
                title: 'LINEA',
                type: 'text'
            },
            {
                name: 'nombre_unidad',
                title: 'NOMBRE_UNIDAD',
                type: 'text'
            },
            {
                name: 'nombre_grupo',
                title: 'NOMBRE_GRUPO',
                type: 'text'
            },
            {
                name: 'ultima_fecha_evento',
                title: 'ULTIMA_FECHA_EVENTO',
                type: 'text'
            },
            {
                name: 'odometro',
                title: 'ODOMETRO',
                type: 'text'
            },
            {
                name: 'ubicacion',
                title: 'ULTIMA_UBICACION',
                type: 'text'
            },
            {
                name: 'evento',
                title: 'ULTIMO_EVENTO',
                type: 'text'
            },
            {
                name: 'lat',
                title: 'LATITUD',
                type: 'text'
            },
            {
                name: 'lon',
                title: 'LONGITUD',
                type: 'text'
            },
        ];
        /* Rows csv */
        let rows = result;
        /* Mapear información con función */
        const exportData = await exportReport('units', columns, rows);
        /* Exportar reporte */
        res.download(exportData);
        return;
    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'Ocurrio un error'
        });
    }
}

module.exports = {
    getAll,
    create,
    importUnitEvents,
    getById,
    getReport
}
