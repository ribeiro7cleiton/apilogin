import { Router } from "express";
import database from "./database";
import 'dotenv-safe/config';


const jwt = new require('jsonwebtoken');
const routes = new Router();
var aQuery = "";

routes.get("/", (req, res) => {
    /*
 #swagger.description = 'Apresentanção da API.'
*/
    return res.json({ message: "API LOGIN SOPASTA V1" });
});

routes.post("/login", (req, res) => {

    /*
  #swagger.description = 'Login com retorno de Token para autenticação nas apis da Sopasta.'
 

  #swagger.parameters['nomusu'] = {
    description: 'Usuário.',
    type: 'strgin',
    required: true,
    in: 'body',
    example: 'joao.silva',
  }

 #swagger.parameters['senusu'] = {
   description: 'Senha Usuário.',
   type: 'string',
   required: true,
   in: 'body',
   example: '741qaz1!',
  }  
*/

    var aNomUsu = req.body.nomusu;
    var aSenUsu = req.body.senusu;
    var aRetSen = "";
    var aUsuSta = "";
    var aRetErr = "";
    var nRetErr = 0;
    var data;

    try {
        if ((aNomUsu != null && aNomUsu != undefined) || (aSenUsu != null && aSenUsu != undefined)) {
            try {
                aQuery = "SELECT USU_SenUsu,USU_UsuSta                      \
                            FROM APONTAMENTOS.USU_TCadUsu                   \
                           WHERE USU_NomUsu ='"+ aNomUsu + "'                  \
                             AND USU_SenUsu = APONTAMENTOS.md5('"+ aSenUsu + "')";
                fExecQuery(aQuery).then(response => {
                    data = response[0];
                    nRetErr = response[1]; // reterr = 1 significa algum erro no oracle

                    if (nRetErr == 1) {
                        return res.json({
                            message: data.toString(),
                            error: nRetErr
                        });
                    } else {
                        for (var i in data) { //vai passar por todos os objetos dentro do array               
                            aRetSen = data[i]["USU_SENUSU"];
                            aUsuSta = data[i]["USU_USUSTA"];
                        }

                        if (aRetSen != null && aRetSen != undefined && !!aRetSen) {
                            if (aUsuSta != "A") {
                                nRetErr = 1;
                                return res.json({
                                    message: "Usuário não está ativo, verifique!",
                                    error: nRetErr
                                });
                            } else {
                                const token = jwt.sign({ aRetSen, aNomUsu }, process.env.SECRET, {
                                    // expires in 5min expiresIn: 300 
                                });
                                return res.json({
                                    message: token,
                                    error: nRetErr
                                });
                            };
                        } else {
                            nRetErr = 1;
                            return res.json({
                                message: "Usuário ou Senha incorretos!",
                                error: nRetErr
                            });
                        }
                    };

                });
            } catch (error) {
                return res.json({ message: error });
            }
        } else {
            return res.json("Nome ou Senha não informados");
        }
    } catch (error) {
        return res.json(error);
    }
});

routes.post("/alterarsenha", (req, res) => {

    /*
  #swagger.description = 'Alterar Senha dos usuários.'
 

  #swagger.parameters['nomusu'] = {
    description: 'Usuário.',
    type: 'strgin',
    required: true,
    in: 'body',
    example: 'joao.silva',
  }

 #swagger.parameters['senusu'] = {
   description: 'Senha Usuário.',
   type: 'string',
   required: true,
   in: 'body',
   example: '741qaz1!',
  }  
*/
    var aNomUsu = req.body.nomusu;
    var aSenUsu = req.body.senusu;
    var aRetUsu = "";
    var aRetErr = "";
    var nRetErr = 0;
    var data;

    try {
        if ((aNomUsu != null && aNomUsu != undefined) || (aSenUsu != null && aSenUsu != undefined)) {
            try {
                aQuery = "SELECT *                        \
                            FROM APONTAMENTOS.USU_TCadUsu \
                       WHERE USU_NomUsu ='" + aNomUsu + "'";
                fExecQuery(aQuery).then(response => {
                    data = response[0];
                    nRetErr = response[1]; // reterr = 1 significa algum erro no oracle

                    if (nRetErr == 1) {
                        return res.json({
                            message: data.toString(),
                            error: nRetErr
                        });
                    } else {
                        for (var i in data) { //vai passar por todos os objetos dentro do array               
                            aRetUsu = data[i]["USU_NOMUSU"];
                        }
                        if (aRetUsu == null || aRetUsu == undefined || !aRetUsu) {
                            return res.json({
                                message: aNomUsu + " não encontrado no sistema !",
                                error: nRetErr
                            });
                        }
                    };
                }).then(response => {
                    if ((aRetUsu != null && aRetUsu != undefined && !!aRetUsu) && (nRetErr == 0)) {
                        aQuery = "UPDATE APONTAMENTOS.USU_TCadUsu                        \
                                     SET USU_SenUsu = APONTAMENTOS.md5('"+ aSenUsu + "')  \
                                   WHERE USU_NomUsu = '"+ aNomUsu + "'";
                        fExecQuery(aQuery).then(response => {
                            data = response[0];
                            nRetErr = response[1]; // reterr = 1 significa algum erro no oracle

                            if (nRetErr == 1) {
                                return res.json({
                                    message: data.toString(),
                                    error: nRetErr
                                });
                            } else {
                                return res.json({
                                    message: "Senha Alterada com Sucesso !",
                                    error: nRetErr
                                });
                            };
                        });
                    }
                });
            } catch (error) {
                return res.json({ message: error });
            }
        } else {
            return res.json({
                message: "Nome ou Senha não informados",
                error: nRetErr
            });
        }
    } catch (error) {
        return res.json(error);
    }

});

routes.post("/inserirusuario", (req, res) => {

    /*
  #swagger.description = 'Inserir novo usuário para utilização dos sistemas.'
 

  #swagger.parameters['nomusu'] = {
    description: 'Usuário.',
    type: 'string',
    required: true,
    in: 'body',
    example: 'joao.silva',
  }

 #swagger.parameters['senusu'] = {
   description: 'Senha Usuário.',
   type: 'string',
   required: true,
   in: 'body',
   example: '741qaz1!',
  }
  
  #swagger.parameters['numcad'] = {
   description: 'Cadastro do usuário como colaborador.',
   type: 'integer',
   required: true,
   in: 'body',
   example: 1234,
  }
*/

    var aNomUsu = req.body.nomusu;
    var aSenUsu = req.body.senusu;
    var nNumCad = req.body.numcad;
    var aRetUsu = "";
    var data;
    var nRetErr = 0;

    try {
        if ((aNomUsu != null && aNomUsu != undefined) || (aSenUsu != null && aSenUsu != undefined)) {
            try {
                aQuery = "SELECT *                        \
                            FROM APONTAMENTOS.USU_TCadUsu \
                       WHERE USU_NomUsu ='" + aNomUsu + "'";
                fExecQuery(aQuery).then(response => {
                    data = response[0];
                    nRetErr = response[1]; // reterr = 1 significa algum erro no oracle

                    if (nRetErr == 1) {
                        return res.json({
                            message: data.toString(),
                            error: nRetErr
                        });
                    } else {
                        for (var i in data) { //vai passar por todos os objetos dentro do array               
                            aRetUsu = data[i]["USU_NOMUSU"];
                        }
                        if (aRetUsu != null && aRetUsu != undefined && !!aRetUsu) {
                            return res.json({
                                message: aNomUsu + " já existe no sistema não será criado !",
                                error: nRetErr
                            });
                        }
                    };
                }).then(response => {
                    if ((aRetUsu == null || aRetUsu == undefined || !aRetUsu) && (nRetErr == 0)) {
                        aQuery = "INSERT INTO APONTAMENTOS.USU_TCadUsu                 \
                                     (USU_NomUsu,USU_SenUsu,USU_NumCad,USU_UsuSta)     \
                              VALUES ('"+ aNomUsu + "',APONTAMENTOS.md5('" + aSenUsu + "')," + nNumCad + ",'A')";
                        fExecQuery(aQuery).then(response => {
                            data = response[0];
                            nRetErr = response[1]; // reterr = 1 significa algum erro no oracle

                            if (nRetErr == 1) {
                                return res.json({
                                    message: data.toString(),
                                    error: nRetErr
                                });
                            } else {
                                return res.json({
                                    message: "Usuário criado !",
                                    error: nRetErr
                                });
                            };

                        });
                    }
                });
            } catch (error) {
                return res.json({ message: error });
            }
        } else {
            nRetErr = 1;
            return res.json({
                message: "Nome ou Senha não informados",
                error: nRetErr
            });
        }
    } catch (error) {
        return res.json(error);
    }

});

routes.post("/deleteusuario", (req, res) => {

    /*
  #swagger.description = 'Remover usuário da base de logins.'
 

  #swagger.parameters['nomusu'] = {
    description: 'Usuário.',
    type: 'string',
    required: true,
    in: 'body',
    example: 'joao.silva',
  }
*/

    var aNomUsu = req.body.nomusu;
    var aRetUsu = "";
    var aRetErr = "";
    var nRetErr = 0;
    var data;

    try {
        if (aNomUsu != null && aNomUsu != undefined) {
            try {
                aQuery = "SELECT *                        \
                            FROM APONTAMENTOS.USU_TCadUsu \
                       WHERE USU_NomUsu ='" + aNomUsu + "'";
                fExecQuery(aQuery).then(response => {
                    data = response[0];
                    nRetErr = response[1]; // reterr = 1 significa algum erro no oracle

                    if (nRetErr == 1) {
                        return res.json({
                            message: data.toString(),
                            error: nRetErr
                        });
                    } else {
                        for (var i in data) { //vai passar por todos os objetos dentro do array                                       
                            aRetUsu = data[i]["USU_NOMUSU"];
                        }
                        if (aRetUsu == null || aRetUsu == undefined || !aRetUsu) {
                            return res.json({
                                message: aNomUsu + " não encontrado no sistema !",
                                error: nRetErr
                            });
                        }
                    };
                }).then(response => {
                    if ((aRetUsu != null && aRetUsu != undefined && !!aRetUsu) && (nRetErr == 0)) {
                        aQuery = "DELETE APONTAMENTOS.USU_TCadUsu     \
                                   WHERE USU_NomUsu = '"+ aNomUsu + "'";
                        fExecQuery(aQuery).then(response => {
                            data = response[0];
                            nRetErr = response[1]; // reterr = 1 significa algum erro no oracle                                                        
                            if (nRetErr == 1) {
                                return res.json({
                                    message: data.toString(),
                                    error: nRetErr
                                });
                            } else {
                                return res.json({
                                    message: "Usuário removido com sucesso !",
                                    error: nRetErr
                                });
                            };
                        });
                    }
                });
            } catch (error) {
                return res.json({ message: error });
            }
        } else {
            nRetErr = 1;
            return res.json({ message: "Nome não informado", error: nRetErr });
        }
    } catch (error) {
        return res.json(error);
    }

});

routes.post("/inserirgrupo", (req, res) => {

    /*
  #swagger.description = 'Inserir usuário em grupo/app para autorizar seu uso.'
 

  #swagger.parameters['nomusu'] = {
    description: 'Usuário.',
    type: 'string',
    required: true,
    in: 'body',
    example: 'joao.silva',
  }

 #swagger.parameters['nomgru'] = {
   description: 'Grupo.',
   type: 'string',
   required: true,
   in: 'body',
   example: 'INVENTARIO',
  }  
*/
    var aNomUsu = req.body.nomusu;
    var aNomGru = req.body.nomgru;
    var aRetUsu = "";
    var aRetGru = "";
    var aRetErr = "";
    var data;
    var nRetErr = 0;

    try {
        if (aNomUsu != null && aNomUsu != undefined && aNomGru != null && aNomGru != undefined) {
            aQuery = "SELECT USU_NomGru NomEnt, 1 TipEnt   \
                        FROM APONTAMENTOS.USU_TCadGru      \
                       WHERE USU_NomGru = '"+ aNomGru + "' \
                      UNION ALL                            \
                      SELECT USU_NomUsu NomEnt, 2 TipEnt   \
                        FROM APONTAMENTOS.USU_TCadUsu      \
                       WHERE USU_NomUsu = '"+ aNomUsu + "' \
                      UNION ALL                            \
                      SELECT USU_NomUsu NomEnt, 3 TipEnt   \
                        FROM APONTAMENTOS.USU_TUsuGru      \
                       WHERE USU_NomUsu = '"+ aNomUsu + "'    \
                         AND USU_NomGru = '"+ aNomGru + "'";
            fExecQuery(aQuery).then(response => {
                data = response[0];
                nRetErr = response[1];
                aRetGru = "";
                aRetUsu = "";
                if (nRetErr == 1) {
                    return res.json({
                        message: data.toString(),
                        error: nRetErr
                    });
                } else {
                    for (var i in data) { //vai passar por todos os objetos dentro do array                                   
                        if (data[i]["TIPENT"] == 2) {
                            aRetGru = data[i]["NOMENT"];
                        }
                        if (data[i]["TIPENT"] == 1) {
                            aRetUsu = data[i]["NOMENT"];
                        }
                        if (data[i]["TIPENT"] == 3) {
                            nRetErr = 1; //significa que encontrou já a ligação usuário x grupo
                        }
                    }

                    if (nRetErr == 0) {
                        if (aRetUsu == null || aRetUsu == undefined || !aRetUsu || aRetGru == null || aRetGru == undefined || !aRetGru) {
                            nRetErr = 1;
                            return res.json({
                                message: "Usuário ou grupo não encontrados !",
                                error: nRetErr
                            });
                        }
                    } else {
                        return res.json({
                            message: "Usuário e grupo já ligados !",
                            error: nRetErr
                        });
                    };

                };

            }).then(response => {
                if (nRetErr == 0) {
                    aQuery = "INSERT INTO                \
                              APONTAMENTOS.USU_TUsuGru   \
                              (USU_NomGru,USU_NomUsu)    \
                              VALUES                     \
                              ('"+ aNomGru + "','" + aNomUsu + "')";
                    fExecQuery(aQuery).then(response => {
                        data = response[0];
                        nRetErr = response[1]; // reterr = 1 significa algum erro no oracle
                        if (nRetErr == 1) {
                            return res.json({
                                message: data.toString(),
                                error: nRetErr
                            });
                        } else {
                            return res.json({
                                message: "Usuário adicionado ao grupo !",
                                error: nRetErr
                            });
                        };
                    });
                }
            });
        } else {
            nRetErr = 1;
            return res.json({
                message: "Usuário ou grupo não informados",
                error: nRetErr
            });
        }
    } catch (error) {

    }
});

routes.post("/deletegrupo", (req, res) => {

    /*
  #swagger.description = 'Remover usuário em grupo/app para bloquear seu uso.'
 

  #swagger.parameters['nomusu'] = {
    description: 'Usuário.',
    type: 'string',
    required: true,
    in: 'body',
    example: 'joao.silva',
  }

 #swagger.parameters['nomgru'] = {
   description: 'Grupo.',
   type: 'string',
   required: true,
   in: 'body',
   example: 'INVENTARIO',
  }  
*/
    var aNomUsu = req.body.nomusu;
    var aNomGru = req.body.nomgru;
    var aRetUsu = "";
    var aRetGru = "";
    var aRetErr = "";
    var data;
    var nRetErr = 0;

    try {
        if (aNomUsu != null && aNomUsu != undefined && aNomGru != null && aNomGru != undefined) {
            aQuery = "SELECT USU_NomUsu,USU_NomGru         \
                        FROM APONTAMENTOS.USU_TUsuGru      \
                       WHERE USU_NomUsu = '"+ aNomUsu + "' \
                         AND USU_NomGru = '"+ aNomGru + "'";
            fExecQuery(aQuery).then(response => {
                data = response[0];
                nRetErr = response[1];
                aRetGru = "";
                aRetUsu = "";
                if (nRetErr == 1) {
                    return res.json({
                        message: data.toString(),
                        error: nRetErr
                    });
                } else {
                    for (var i in data) { //vai passar por todos os objetos dentro do array                                                           
                        aRetGru = data[i]["USU_NOMGRU"];
                        aRetUsu = data[i]["USU_NOMUSU"];
                    }

                    if (nRetErr == 0) {
                        if (aRetUsu == null || aRetUsu == undefined || !aRetUsu || aRetGru == null || aRetGru == undefined || !aRetGru) {
                            nRetErr = 1;
                            return res.json({
                                message: "Ligação não encontrada!",
                                error: nRetErr
                            });
                        }
                    }

                };

            }).then(response => {
                if (nRetErr == 0) {
                    aQuery = "DELETE APONTAMENTOS.USU_TUsuGru   \
                               WHERE USU_NomUsu = '"+ aNomUsu + "' \
                                 AND USU_NomGru = '"+ aNomGru + "'";
                    fExecQuery(aQuery).then(response => {
                        data = response[0];
                        nRetErr = response[1]; // reterr = 1 significa algum erro no oracle
                        if (nRetErr == 1) {
                            return res.json({
                                message: data.toString(),
                                error: nRetErr
                            });
                        } else {
                            return res.json({
                                message: "Usuário removido do grupo !",
                                error: nRetErr
                            });
                        };
                    });
                }
            });
        } else {
            nRetErr = 1;
            return res.json({
                message: "Usuário ou grupo não informados",
                error: nRetErr
            });
        }
    } catch (error) {

    }
});

routes.post("/consultargrupo", (req, res) => {

    /*
  #swagger.description = 'Consultar usuário possui liberação em determinado grupo.'
 

  #swagger.parameters['nomusu'] = {
    description: 'Usuário.',
    type: 'string',
    required: true,
    in: 'body',
    example: 'joao.silva',
  }

 #swagger.parameters['nomgru'] = {
   description: 'Grupo.',
   type: 'string',
   required: true,
   in: 'body',
   example: 'INVENTARIO',
  }  
*/
    var aNomUsu = req.body.nomusu;
    var aNomGru = req.body.nomgru;
    var aRetUsu = "";
    var aRetGru = "";
    var aRetErr = "";
    var data;
    var nRetErr = 0;

    try {
        if (aNomUsu != null && aNomUsu != undefined && aNomGru != null && aNomGru != undefined) {
            aQuery = "SELECT USU_NomUsu,USU_NomGru         \
                        FROM APONTAMENTOS.USU_TUsuGru      \
                       WHERE USU_NomUsu = '"+ aNomUsu + "' \
                         AND USU_NomGru = '"+ aNomGru + "'";
            fExecQuery(aQuery).then(response => {
                data = response[0];
                nRetErr = response[1];
                aRetGru = "";
                aRetUsu = "";
                if (nRetErr == 1) {
                    return res.json({
                        message: data.toString(),
                        error: nRetErr
                    });
                } else {
                    for (var i in data) { //vai passar por todos os objetos dentro do array                                                           
                        aRetGru = data[i]["USU_NOMGRU"];
                        aRetUsu = data[i]["USU_NOMUSU"];
                    }

                    if (nRetErr == 0) {
                        if (aRetUsu == null || aRetUsu == undefined || !aRetUsu || aRetGru == null || aRetGru == undefined || !aRetGru) {
                            nRetErr = 1;
                            return res.json({
                                message: "Usuário não permitido para o grupo!",
                                error: nRetErr
                            });
                        } else {
                            return res.json({
                                message: "Usuário permitido!",
                                error: nRetErr
                            });
                        };
                    }
                };
            });
        } else {
            nRetErr = 1;
            return res.json({
                message: "Usuário ou grupo não informados",
                error: nRetErr
            });
        }
    } catch (error) {

    }
});

routes.post("/gruposusuario", (req, res) => {

    /*
  #swagger.description = 'Retorna todos os grupos que o usuário possui acesso.'
 

  #swagger.parameters['nomusu'] = {
    description: 'Usuário.',
    type: 'string',
    required: true,
    in: 'body',
    example: 'joao.silva',
  } 
*/
    var aNomUsu = req.body.nomusu;
    var data;
    var aRetGru = "";
    var aRetUsu = "";
    var nRetErr = 0;
    var aUsuSta = "";

    try {
        if (aNomUsu != null && aNomUsu != undefined) {
            aQuery = "SELECT USU_NomUsu, USU_UsuSta        \
                        FROM APONTAMENTOS.USU_TCadUsu      \
                       WHERE USU_NomUsu = '"+ aNomUsu + "'";
            fExecQuery(aQuery).then(response => {
                data = response[0];
                nRetErr = response[1];
                if (nRetErr == 0) {
                    for (var i in data) { //vai passar por todos os objetos dentro do array                                                           
                        aRetUsu = data[i]["USU_NOMUSU"];
                        aUsuSta = data[i]["USU_USUSTA"];
                    }
                    if (aRetUsu == null || aRetUsu == undefined || !aRetUsu) {
                        nRetErr = 1;
                        return res.json({
                            message: "Usuário não existe na base!",
                            error: nRetErr
                        });
                    } else {
                        if (aUsuSta != "A") {
                            nRetErr = 1;
                            return res.json({
                                message: "Usuário não está ativo, verifique!",
                                error: nRetErr
                            });
                        } else {
                            aQuery = "SELECT USU_NomGru                    \
                                FROM APONTAMENTOS.USU_TUsuGru      \
                               WHERE USU_NomUsu = '"+ aNomUsu + "'";
                            fExecQuery(aQuery).then(response => {
                                data = response[0];
                                nRetErr = response[1];
                                if (nRetErr == 1) {
                                    return res.json({
                                        message: data.toString(),
                                        error: nRetErr
                                    });
                                } else {
                                    for (var i in data) { //vai passar por todos os objetos dentro do array                                                           
                                        aRetGru = data[i]["USU_NOMGRU"];
                                    }

                                    if (nRetErr == 0) {
                                        if (aRetGru == null || aRetGru == undefined || !aRetGru) {
                                            nRetErr = 1;
                                            return res.json({
                                                message: "Usuário em nenhum grupo!",
                                                error: nRetErr
                                            });
                                        } else {
                                            return res.json({
                                                message: data,
                                                error: nRetErr
                                            });
                                        };
                                    }
                                };
                            });
                        };
                    };
                } else {
                    return res.json({
                        message: data,
                        error: nRetErr
                    });
                };
            });
        } else {
            nRetErr = 1;
            return res.json({
                message: "Usuário não informado !",
                error: nRetErr
            });
        };
    } catch (error) {

    }
});

routes.post("/alterastatus", (req, res) => {

    /*
  #swagger.description = 'Ativar ou inativar usuário.'
 

  #swagger.parameters['nomusu'] = {
    description: 'Usuário.',
    type: 'string',
    required: true,
    in: 'body',
    example: 'joao.silva',
  }

 #swagger.parameters['ususta'] = {
   description: 'Status do usuário A - Ativo ou I - Inativo.',
   type: 'string',
   required: true,
   in: 'body',
   example: 'A',
  }  
*/

    var aNomUsu = req.body.nomusu;
    var aUsuSta = req.body.ususta;
    var aRetUsu = "";
    var aRetErr = "";
    var nRetErr = 0;
    var data;
    try {
        if ((aNomUsu != null && aNomUsu != undefined) && (aUsuSta == "A" || aUsuSta == "I")) {
            try {
                aQuery = "SELECT *                        \
                            FROM APONTAMENTOS.USU_TCadUsu \
                       WHERE USU_NomUsu ='" + aNomUsu + "'";
                fExecQuery(aQuery).then(response => {
                    data = response[0];
                    nRetErr = response[1]; // reterr = 1 significa algum erro no oracle

                    if (nRetErr == 1) {
                        return res.json({
                            message: data.toString(),
                            error: nRetErr
                        });
                    } else {
                        for (var i in data) { //vai passar por todos os objetos dentro do array                                       
                            aRetUsu = data[i]["USU_NOMUSU"];
                        }
                        if (aRetUsu == null || aRetUsu == undefined || !aRetUsu) {
                            return res.json({
                                message: aNomUsu + " não encontrado no sistema !",
                                error: nRetErr
                            });
                        }
                    };
                }).then(response => {
                    if ((aRetUsu != null && aRetUsu != undefined && !!aRetUsu) && (nRetErr == 0)) {
                        aQuery = "UPDATE APONTAMENTOS.USU_TCadUsu     \
                                     SET USU_UsuSta = '"+ aUsuSta + "'   \
                                   WHERE USU_NomUsu = '"+ aNomUsu + "'";
                        fExecQuery(aQuery).then(response => {
                            data = response[0];
                            nRetErr = response[1]; // reterr = 1 significa algum erro no oracle                                                        
                            if (nRetErr == 1) {
                                return res.json({
                                    message: data.toString(),
                                    error: nRetErr
                                });
                            } else {
                                return res.json({
                                    message: "Usuário atualizado !",
                                    error: nRetErr
                                });
                            };
                        });
                    }
                });
            } catch (error) {
                return res.json({ message: error });
            }
        } else {
            nRetErr = 1;
            return res.json({ message: "Nome ou status não informados", error: nRetErr });
        }
    } catch (error) {
        return res.json(error);
    }

});

async function fExecQuery(aQuery) {
    var RetQue;
    var RetErr = 0;
    try {
        RetQue = await database.raw(aQuery);
    } catch (error) {
        RetQue = error;
        RetErr = 1;
    }
    return [RetQue, RetErr];
}

export default routes;