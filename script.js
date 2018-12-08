// myscript.js

var oracledb = require('oracledb');

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

function doRelease(connection) {
    connection.close(
        function(err) {
            if (err)
                console.error(err.message);
        });
}