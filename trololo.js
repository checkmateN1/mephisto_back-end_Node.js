var express = require("express");

var app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
    next();
});

app.post("/", function(req, res){
    const testJsonObj = {
        hand: {
            lm: 0.25,
            c1: "Ac",
            c2: "6h",
            c3: "Kd",
            c4: "Js"
        }
    };
    res.send(JSON.stringify(testJsonObj));
});

app.get("/random", function(req, res){

    //прокидываем рандомную руку с постфлопом и заполняем массив сырых строк действий из БД

    // массив для хранения сырых строк действий
    var rawActionList = [];

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

    // (street, player, balance, action, pot, amount, position, isGTO, isHero)
    rawActionList[0] = new ActionString(0, "mammoth", 25.15, 3, 0, 0.10, 9, false, true); // post SB
    rawActionList[1] = new ActionString(0, "checkmateN1", 37.25, 1, 0.10, 0.25, 8, false, false); // post BB
    rawActionList[2] = new ActionString(0, "gulyaka", 27, 5, 0.35, 0, 3, false, false);  // MP1
    rawActionList[3] = new ActionString(0, "zlo-Mishka", 32, 5, 0.35, 0, 2, false, false); // MP2
    rawActionList[4] = new ActionString(0, "3D action", 45.37, 5, 0.35, 0, 1, false, false); // CO
    rawActionList[5] = new ActionString(0, "joooe84", 60, 2, 0.35, 0.75, 0, false, false); // bet 0.75 BTN
    rawActionList[6] = new ActionString(0, "mammoth", 25.05, 3, 1.10, 0.75, 9, false, true);
    rawActionList[7] = new ActionString(0, "checkmateN1", 37, 3, 1.75, 0.75, 8, false, false); // call BB

    rawActionList[8] = new ActionString(1, "mammoth", 24.40, 4, 2.25, 0.00, 9, false, true);
    rawActionList[9] = new ActionString(1, "checkmateN1", 36.5, 4, 2.25, 0.00, 8, false, false);
    rawActionList[10] = new ActionString(1, "joooe84", 59.25, 1, 2.25, 1.6, 0, false, false);
    rawActionList[11] = new ActionString(1, "mammoth", 24.40, 3, 3.85, 1.6, 9, false, true);

    function Player(nickname, vpip) {
        this.nickname = nickname;
        this.vpip = vpip;
    }

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
                `Select * from ee_hands where rownum = 1`,
                function(err, result) {
                    if (err) {
                        console.error(err.message);
                        doRelease(connection);
                        return;
                    }
                    console.log(result.rows);
                    doRelease(connection);
                });
        });

    let player1 = new Player('joe', 32);

    let randomHand = {
        hand: {
            h1: "7c",
            h2: "7h", // 6h не работает когда занята симулятором в текущий момент - починить
        },
        board: {
            c1: "2c",
            c2: "2h",
            c3: "2s",
            c4: "2d",
            c5: null
        },
        actions: rawActionList,
        //players: [],

    };
    res.send(JSON.stringify(randomHand));
});

app.listen(27990, "192.168.1.20", function(){
    console.log("Сервер ожидает подключения...");
});