const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');

dotenv.config();
app.use(cors({
    origin:'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));



const port = process.env.PORT;
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }  
    console.log('Connected to the database');
    connection.release();
});



app.use(bodyParser.json());

const createQuery = `INSERT INTO customer (customerName, email, phone) VALUES (?, ?, ?)`;
const readQuery = `SELECT * FROM customer`;
const updateQuery = `UPDATE customer SET customerName = ?, email = ?, phone = ? WHERE id = ?`;
const deleteQuery = `DELETE FROM customer WHERE id = ?`;

app.get('/', (req, res) => {
    res.send('Welcome to the Customer Management API');
    // console.log('Dotenv variables:', {
    //     DB_HOST: process.env.DB_HOST,
    //     DB_USER: process.env.DB_USER,
    //     DB_PASSWORD: process.env.DB_PASSWORD,
    //     DB_NAME: process.env.DB_NAME,
    //     PORT: process.env.PORT,}
    // )   
    console.log('Database connection pool created successfully');
});

app.get('/customers', (req, res) => {
    pool.query(readQuery, (error, results) => {
        if (error) {
            console.error('Error fetching users:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(results)
    });
});

app.post('/customers/add', (req, res) => {
    const { customerName, email, phone } = req.body;
    pool.query(createQuery, [customerName, email, phone], (error, results) => {
        if (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(201).json({ message: 'Customer created successfully', id: results.insertId });
    });
});

app.put('/customers/update/:id', (req, res) => {
    const { id } = req.params;
    const { customerName, email, phone } = req.body;
    console.log('Updating customer with ID:', id);
    console.log('New data:', { customerName, email, phone });
    pool.query(updateQuery, [customerName, email, phone, id], (error, results) => {
        if (error) {
            console.error('Error updating user:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json({ message: 'Customer updated successfully' }).send();
    });
});

app.delete('/customers/delete/:id', (req, res) => {
    const { id } = req.params;
    pool.query(deleteQuery, [id], (error, results) => {
        if (error) {
            console.error('Error deleting user:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json({ message: 'Customer deleted successfully' });
    });
});

app.get('/download-report', (req, res) => {
 
   pool.query('SELECT * FROM customer ORDER BY id', (error, results) => {
        if (error) {
            console.error('Erro ao buscar os dados para o relatório:', error);
            return res.status(500).json({ error: 'Erro interno ao gerar relatório' });
        }

        const doc = new PDFDocument();

        const filePath = path.join(__dirname, 'report.pdf');
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Cabeçalho
        doc.fontSize(20).text('RELATÓRIO', { align: 'center' }).moveDown();

        // Total de clientes
        doc.fontSize(12).text(`Nº de Clientes: ${results.length}`);

        // Registro do primeiro cliente
        if (results.length > 0) {
            const first = results[0];
            const last = results[results.length - 1];
            doc.moveDown().text(`Primeiro Cliente: ${first.customerName} (ID: ${first.id})`);
            doc.text(`Último Cliente: ${last.customerName} (ID: ${last.id})`);
        }

        doc.moveDown().text('Tabela de Clientes:').moveDown();

        // Tabela
        doc.font('Courier').fontSize(8);
        doc.text('ID          | Nome                           | Email                          | Telefone      ');
        doc.text('------------|--------------------------------|--------------------------------|---------------');

        results.forEach((c) => {
            const linha = `${c.id.toString().padEnd(11)} | ${c.customerName.padEnd(30)} | ${c.email.padEnd(30)} | ${c.phone}\n\n`;
            doc.text(linha);
        });

        doc.end();

        stream.on('finish', () => {
            const file = path.join(__dirname, 'report.pdf');
            res.download(file, 'relatorio.pdf');
        });
    });

    

});

app.listen(port, () => {  
    console.log(`Server is running on port ${port}`);
});



