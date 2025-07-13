import express from 'express';
import sequelize from './db/connection';
import Fee from './models/Fee';

const app = express();
app.use(express.json());

app.get('/fees', async (req, res) => {
    const fees = await Fee.findAll();
    res.json(fees);
});

app.post('/fees', async (req, res) => {
    try {
        const fee = await Fee.create(req.body);
        res.status(201).json(fee);
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ error: error.message });
    }
});

sequelize.sync().then(() => {
    app.listen(3000, () => {
        console.log('Server started');
    });
});