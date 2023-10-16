const express = require('express');
const oracledb = require('oracledb');

const app = express();
const port = 3003;

oracledb.initOracleClient({ libDir: 'F:/instantclient-basic-windows.x64-21.11.0.0.0dbru/instantclient_21_11' });



app.get('/getProductInfo/:productId', (req, res) => {
    const selectedProductId = req.params.productId;

    oracledb.getConnection({
        user: 'ADMIN',
        password: 'GroupK123456',
        connectString: '(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.eu-paris-1.oraclecloud.com))(connect_data=(service_name=gbbf3e64fad7831_groupk_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))'
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database connection error' });
        }

        const sql = `
            SELECT p.name, p.description, i.quantity, p.price
            FROM products p
            JOIN inventory i ON p.product_id = i.product_id
            WHERE i.product_id = :productId
        `;

        connection.execute(sql, [selectedProductId], function(err, result) {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: 'Database query error' });
            } else {
                const productInfo = result.rows[0];
                res.json({
                    name: productInfo[0],
                    description: productInfo[1],
                    quantity: productInfo[2],
                    price: productInfo[3]
                });
            }

            connection.close(function(err) {
                if (err) {
                    console.error(err.message);
                }
            });
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
app.use(express.static('public'));