const express = require("express");
const app = express();
//const PokerEngine = require('./pokerEngine');
//const testExpoFunc = require('./engineMiddleware');
//const testExpoFunc = require('./engineMiddleware_test');
//const getAllHandsStrategy = require('./engineMiddleware_work');
const sessionsHandler = require('./sessionsHandler');

const oracledb = require('oracledb');
const bodyParser = require('body-parser');

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(express.json());       // to support JSON-encoded bodies

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
    next();
});

// Класс строка действий
class ActionString {
    constructor(street, player, balance, action, pot, amount, position, gto, isHero) {
        this.street = street;
        this.player = player;
        this.balance = balance;
        this.action = action;
        this.pot = pot;
        this.amount = amount;
        this.position = position;
        this.gto = gto;
        this.isHero = isHero;
    }
};

function Player(nickname, id, position, vpip) {
    this.nickname = nickname;
    this.id = id;
    this.position = position;
    this.vpip = vpip;
}


app.post("/upload", function(req, res){
    if (req.body.hand.length < 11 || typeof parseInt(req.body.hand) === 'number') {
        let handNumber = parseInt(req.body.hand);

        // массив для хранения сырых строк действий
        let rawActionList = [];

        let heroID;
        let playersInHand = {}; //индекс в массиве = позиция игрока в данной раздаче

        let randomHand = {
            hand: {
                h1: "7c",
                h2: "7h",
            },
            board: {
                c1: "2c",
                c2: "2h",
                c3: "2s",
                c4: "2d",
                c5: null
            },
            actions: rawActionList,
            actions_test: null,
            randomHandNumber: parseInt(req.body.hand),
            players: {},
            success: true,

        };

        oracledb.getConnection(
            {
                user          : "VERTER",
                password      : "1ZHo2lZfT10Q5",
                connectString : "Localhost/vert"
            },
            function(err, connection) {
                if (err) {
                    console.error(err.message);
                    return;
                }
                connection.execute(
                    `SELECT * FROM EE_HANDS WHERE ID = ${handNumber}`,
                    function(err, result) {
                        if (err) {
                            console.error(err.message);
                            doRelease(connection);
                            return;
                        }
                        if(result.rows.length === 0) {
                            randomHand.success = false;
                            res.send(JSON.stringify(randomHand));
                            doRelease(connection);
                            return;
                        }
                        //console.log(result.rows);
                        let tmp = result.rows;
                        randomHand.board.c1 = tmp[0][5];
                        randomHand.board.c2 = tmp[0][6];
                        randomHand.board.c3 = tmp[0][7];
                        randomHand.board.c4 = tmp[0][8];
                        randomHand.board.c5 = tmp[0][9];

                        let players_count = tmp[0][10]; //количество игроков в раздаче - может понадобиться

                        connection.execute(
                            `SELECT * FROM EE_RAW_SHOWDOWNS WHERE ID_HAND = ${handNumber}`,
                            function(err, result) {
                                if (err) {
                                    console.error(err.message);
                                    doRelease(connection);
                                    return;
                                }
                                console.log(result.rows);
                                let players = result.rows.filter((player) => player[3] !== 'Mu');
                                let hero = Math.floor(Math.random()*players.length);

                                heroID = players[hero][1];
                                randomHand.hand.h1 = players[hero][2];
                                randomHand.hand.h2 = players[hero][3];

                                connection.execute(
                                    `SELECT * FROM ee_raw_init INNER JOIN ee_players ON ee_raw_init.ID_PLAYER = ee_players.ID WHERE ee_raw_init.ID_HAND = ${handNumber}`,
                                    function(err, result) {
                                        if (err) {
                                            console.error(err.message);
                                            doRelease(connection);
                                            return;
                                        }
                                        //console.log(result.rows);
                                        //function Player(nickname, id, position, vpip, ...)
                                        for (let i = 0; i < result.rows.length; i++) {
                                            playersInHand[result.rows[i][1]] = new Player(result.rows[i][5], result.rows[i][1], result.rows[i][3]);
                                        }
                                        randomHand.players = playersInHand;

                                        connection.execute(
                                            `SELECT * FROM EE_RAW_ACTIONS WHERE ID_HAND = ${handNumber} ORDER BY STREET, ACT_NUM`,
                                            function(err, result) {
                                                if (err) {
                                                    console.error(err.message);
                                                    doRelease(connection);
                                                    return;
                                                }
                                                //console.log(result.rows);
                                                randomHand.actions_test = result.rows;

                                                // (street, player, balance, action, pot, amount, position, isGTO, isHero)
                                                //rawActionList[0] = new ActionString(0, "mammoth", 25.15, 3, 0, 0.10, 9, false, true); // post SB
                                                for (let i = 0; i < result.rows.length; i++) {
                                                    rawActionList[i] = new ActionString(
                                                        result.rows[i][2] <= 1 ? 0 : result.rows[i][2] - 1,
                                                        playersInHand[result.rows[i][3]].nickname,
                                                        result.rows[i][8],
                                                        result.rows[i][4] == 6 ? 2 : result.rows[i][4],
                                                        result.rows[i][6],
                                                        result.rows[i][5],
                                                        playersInHand[result.rows[i][3]].position,
                                                        false,
                                                        result.rows[i][3] == heroID ? true : false);
                                                }
                                                res.send(JSON.stringify(randomHand));
                                            });
                                    });
                            });
                    });
            });

        function doRelease(connection) {
            connection.close(
                function(err) {
                    if (err)
                        console.error(err.message);
                });
        }
    }
});


// (token, sessionID, request)
//console.log(sessionsHandler.sessionsListener('uidfksicnm730pdemg662oermfyf75jdf9djf', '123', 'req'));

app.post("/strategy", function(req, res){
    let obj = req.body;
    //console.log(obj);
    let result = sessionsHandler.sessionsListener('uidfksicnm730pdemg662oermfyf75jdf9djf', '123', obj);
    //res.send(JSON.stringify(sessionsHandler.sessionsListener('uidfksicnm730pdemg662oermfyf75jdf9djf', '123', obj)));
    res.send(JSON.stringify(result));

});

app.get("/random", function(req, res){

    // массив для хранения сырых строк действий
    let rawActionList = [];

    let randomHandNumber;
    let heroID;
    let playersInHand = {}; //индекс в массиве = позиция игрока в данной раздаче

    let randomHand = {
        hand: {
            h1: "7c",
            h2: "7h",
        },
        board: {
            c1: "2c",
            c2: "2h",
            c3: "2s",
            c4: "2d",
            c5: null
        },
        actions: rawActionList,
        actions_test: null,
        randomHandNumber: randomHandNumber,
        players: {},
        success: true,

    };

    oracledb.getConnection(
        {
            user          : "VERTER",
            password      : "1ZHo2lZfT10Q5",
            connectString : "Localhost/vert"
        },
        function(err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }
            connection.execute(
                `SELECT ID FROM
( SELECT ID FROM EE_HANDS SAMPLE(0.0003) WHERE C1 IS NOT NULL AND LM = 0.3 
ORDER BY dbms_random.value )
WHERE rownum = 1 AND id in(select id_hand from ee_raw_showdowns) AND id in(select id_hand from EE_RAW_ACTIONS WHERE street > 1) `,
                function(err, result) {
                    if (err) {
                        //console.error(err.message);
                        doRelease(connection);
                        return;
                    }
                    console.log(result.rows);
                    if(result.rows.length === 0) {
                        randomHand.success = false;
                        res.send(JSON.stringify(randomHand));
                        doRelease(connection);
                        return;
                    }
                    randomHandNumber = result.rows;
                    randomHand.randomHandNumber = randomHandNumber[0][0];

                    connection.execute(
                        `SELECT * FROM EE_HANDS WHERE ID = ${randomHandNumber[0][0]}`,
                        function(err, result) {
                            if (err) {
                                console.error(err.message);
                                doRelease(connection);
                                return;
                            }
                            //console.log(result.rows);
                            let tmp = result.rows;
                            randomHand.board.c1 = tmp[0][5];
                            randomHand.board.c2 = tmp[0][6];
                            randomHand.board.c3 = tmp[0][7];
                            randomHand.board.c4 = tmp[0][8];
                            randomHand.board.c5 = tmp[0][9];

                            let players_count = tmp[0][10]; //количество игроков в раздаче - может понадобиться

                            connection.execute(
                                `SELECT * FROM EE_RAW_SHOWDOWNS WHERE ID_HAND = ${randomHandNumber[0][0]}`,
                                function(err, result) {
                                    if (err) {
                                        console.error(err.message);
                                        doRelease(connection);
                                        return;
                                    }
                                    console.log(result.rows);
                                    let players = result.rows.filter((player) => player[3] !== 'Mu');
                                    let hero = Math.floor(Math.random()*players.length);

                                    heroID = players[hero][1];
                                    randomHand.hand.h1 = players[hero][2];
                                    randomHand.hand.h2 = players[hero][3];

                                    connection.execute(
                                        `SELECT * FROM ee_raw_init INNER JOIN ee_players ON ee_raw_init.ID_PLAYER = ee_players.ID WHERE ee_raw_init.ID_HAND = ${randomHandNumber[0][0]}`,
                                        function(err, result) {
                                            if (err) {
                                                console.error(err.message);
                                                doRelease(connection);
                                                return;
                                            }
                                            //console.log(result.rows);
                                            //function Player(nickname, id, position, vpip, ...)
                                            for (let i = 0; i < result.rows.length; i++) {
                                                playersInHand[result.rows[i][1]] = new Player(result.rows[i][5], result.rows[i][1], result.rows[i][3]);
                                            }
                                            randomHand.players = playersInHand;

                                            connection.execute(
                                                `SELECT * FROM EE_RAW_ACTIONS WHERE ID_HAND = ${randomHandNumber[0][0]} ORDER BY STREET, ACT_NUM`,
                                                function(err, result) {
                                                    if (err) {
                                                        console.error(err.message);
                                                        doRelease(connection);
                                                        return;
                                                    }
                                                    //console.log(result.rows);
                                                    randomHand.actions_test = result.rows;

                                                    // (street, player, balance, action, pot, amount, position, isGTO, isHero)
                                                    //rawActionList[0] = new ActionString(0, "mammoth", 25.15, 3, 0, 0.10, 9, false, true); // post SB
                                                    for (let i = 0; i < result.rows.length; i++) {
                                                        rawActionList[i] = new ActionString(
                                                            result.rows[i][2] <= 1 ? 0 : result.rows[i][2] - 1,
                                                            playersInHand[result.rows[i][3]].nickname,
                                                            result.rows[i][8],
                                                            result.rows[i][4] == 6 ? 2 : result.rows[i][4],
                                                            result.rows[i][6],
                                                            result.rows[i][5],
                                                            playersInHand[result.rows[i][3]].position,
                                                            false,
                                                            result.rows[i][3] == heroID ? true : false);
                                                    }
                                                    res.send(JSON.stringify(randomHand));
                                                });
                                        });
                                });
                        });
                });
        });

    function doRelease(connection) {
        connection.close(
            function(err) {
                if (err)
                    console.error(err.message);
            });
    }

    //res.send(JSON.stringify(randomHand));
});

app.listen(3001, "localhost", function(){
    console.log("Сервер ожидает подключения...");
});

//console.log(testExpoFunc.sessionsListener('uidfksicnm730pdemg662oermfyf75jdf9djf', '123', 'yo!'));
// app.listen(27990, "192.168.1.20", function(){
//     console.log("Сервер ожидает подключения...");
// });