const oracledb = require('oracledb');

const enumPoker = require('./enum');

class Oracle {
  constructor() {
    this.connection = null;
    this.connect();
  }

  async connect() {
    await oracledb.getConnection({
        user          : "VERTER",
        password      : "1ZHo2lZfT10Q5",
        connectString : "192.168.1.30:1521/VERTER"
      },
      async (err, connection) => {
        if (err) {
          console.error(err.message);
          return;
        }
        if (connection) {
          this.connection = connection;
        }

      }
    );
  }

  async testSelect() {
    if (this.connection) {
      const sql = `SELECT * FROM EE_BRAK`;
      const binds = {};

      // For a complete list of options see the documentation.
      const options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
        // extendedMetaData: true,   // get extra metadata
        // fetchArraySize: 100       // internal buffer allocation size for tuning
      };

      const result = await this.connection.execute(sql, binds, options);

      console.log("Column metadata: ", result.metaData);
      console.log("Query results: ");
      console.log(result.rows);
    }
  }

  async addHandHandler(options) {
    if (this.connection) {
      const {
        rawActions,
        initPlayers,
        heroChair,
        id_room,
        limit,
        board,
        plCount,
        cash,
        token,      // вычисляем по токену и id_room - player_id
      } = options;

      const newHandId = await this.insertHand(id_room, limit, board, plCount);    // tt_hands
      console.log('newHandId in addHandHandler');
      console.log(newHandId);

      // raw actions
      // Amount = invest if call or превышение над максимальной если агро
      // тип действия 6 если агро оллын
      // блайнды это улица 0, префлоп это улица 1
      // ACT_NUM начинается всегда с 1
      // PRE_BET - предыдущий амаунт игрока в пределах одной улицы. Улица 0 и 1 это одна улица
      // MAX_BET - макс ставка на текущей улице до данного мува(если текущий рейз бета, то макс бет - амаунт бета)



      await this.connection.commit();
    }
  }

  createDbRawActions(rawActions, initPlayers, newHandId) {

  }

  async insertHand(id_room, limit, board, plCount) {      // tt_hands
    if (this.connection) {
      try {
        const {
          C1 = '',
          C2 = '',
          C3 = '',
          C4 = '',
          C5 = '',
        } = board;
        const sql = `INSERT INTO tt_hands (ID, ID_ROOM, HANDNUM, LM, DT, C1, C2, C3, C4, C5, PL_COUNT) VALUES (handnumberid_seq.nextval, :id_room, handnumberid_seq.nextval, :limit, CURRENT_DATE, :C1, :C2, :C3, :C4, :C5, :plCount) RETURN ID INTO :id`;

        const result = await this.connection.execute(
          sql,
          {
            id: {type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
            id_room,         // party 2
            limit,
            C1,
            C2,
            C3,
            C4,
            C5,
            plCount,
          }
        );

        if (result) {
          return result.outBinds.id[0];
        }
      } catch (e) {
        console.error(e.message);
      }
    }
  }

//   class InitPlayer {
//   constructor(player, initBalance, enumPosition, isDealer, cards) {
//     this.player = player;
//     this.initBalance = initBalance;
//     this.enumPosition = enumPosition;
//     this.isDealer = isDealer;
//     this.cards = cards;
//   }
// }

  async insertRawInit(newHandId, initPlayers, token, heroChair) {
    // ID_HAND, ID_PLAYER, STACK, ID_POSITION
    if (this.connection) {
      const players = this.initPlayers.map((player, i) => {

        if (player !== undefined) {
          return [newHandId, ];

          // if (player.cards && i === heroChair) {
          //
          // }
          // heroCards = player.cards;
        }

        return {
          nickname: player.player,
          balance: this.getLastValidMoveBalance(i)/100,
          bet: (curStreet !== currentStreet && isTerminal) ? 0 : this.getLastMoveAmount(i)/100,
          isDealer: player.isDealer,
          agroClass: i === agroChair ? 'bet-raise' : 'check-call',
        };
      });

      player.enumPosition
      try {
        const sql = `INSERT INTO tt_hands (ID, ID_ROOM, HANDNUM, LM, DT, C1, C2, C3, C4, C5, PL_COUNT) VALUES (handnumberid_seq.nextval, :id_room, handnumberid_seq.nextval, :limit, CURRENT_DATE, :C1, :C2, :C3, :C4, :C5, :plCount) RETURN ID INTO :id`;

        const result = await this.connection.execute(
          sql,
          {
            id: {type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
            id_room,         // party 2
            limit,
            C1,
            C2,
            C3,
            C4,
            C5,
            plCount,
          }
        );

        if (result) {
          return result.outBinds.id[0];
        }
      } catch (e) {
        console.error(e.message);
      }
    }
  }

  async insertRawActions() {

  }

  doRelease() {
    if (this.connection) {
      this.connection.close(
        function(err) {
          if (err)
            console.error(err.message);
        });
    }
  }

  getPlayerId(token, room, gameType, nickname) {
    if (token) {                                      // hero
      return enumPoker.tokens[token][room][gameType];
    } else if (nickname) {
      // db query
      // return id
    } else {
      return 0;
    }
  }

  getRoomId(room) {
    return enumPoker.rooms[room];
  }
}



module.exports.oracle = Oracle;