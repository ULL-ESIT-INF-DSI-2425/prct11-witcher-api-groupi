import request from 'supertest';
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { app } from '../../src/api.js';
import { Good } from '../../src/models/good.js';
import { Hunter } from '../../src/models/hunter.js';
import { Merchant } from '../../src/models/merchant.js';
import { Transaction } from '../../src/models/transactions.js';
import { Types } from 'mongoose';


describe('Transaction Tests', () => {
  let goodId: Types.ObjectId;

  beforeAll(async () => {
    // Limpiar las colecciones antes de los tests
    await Good.deleteMany();
    await Hunter.deleteMany();
    await Merchant.deleteMany();
    await Transaction.deleteMany();

    // Crear un bien para usar en las transacciones
    const good = new Good({
      name: 'Espada de Estela',
      description: 'Es una espadita de plata',
      material: 'Acero de Mahakam',
      weight: 34,
      value_in_crowns: 140,
      stock: 3,
    });
    await good.save();
    goodId = good._id as Types.ObjectId;

    // Crear un cazador para usar en las transacciones
    const hunter = new Hunter({
      name: 'Geralt',
      age: 30,
      location: 'Kaer Morhen',
    });
    await hunter.save();
  });

  afterAll(async () => {
    // Limpiar las colecciones después de los tests
    await Good.deleteMany();
    await Hunter.deleteMany();
    await Merchant.deleteMany();
    await Transaction.deleteMany();
  });

  test('POST /transactions - should create a transaction', async () => {
    const response = await request(app)
      .post('/transactions')
      .send({
        date: new Date(),
        type: 'buy',
        amount: 1,
        personType: 'Hunter',
        personName: 'Geralt',
        goods: [
          {
            good: goodId,
            quantity: 1,
          },
        ],
        totalImport: 140,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.type).toBe('buy');
    expect(response.body.personName).toBe('Geralt');
    expect(response.body.goods[0].good).toBe(goodId);
    expect(response.body.totalImport).toBe(140);
  });

  test('GET /transactions - should retrieve all transactions', async () => {
    const response = await request(app).get('/transactions');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('GET /transactions/:id - should retrieve a transaction by ID', async () => {
    const transaction = await Transaction.findOne({ personName: 'Geralt' });
    const response = await request(app).get(`/transactions/${transaction?._id}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_id', transaction?._id as Types.ObjectId);
    expect(response.body.personName).toBe('Geralt');
  });

  test('PATCH /transactions/:id - should update a transaction', async () => {
    const transaction = await Transaction.findOne({ personName: 'Geralt' });
    const response = await request(app)
      .patch(`/transactions/${transaction?._id}`)
      .send({
        type: 'sell',
        totalImport: 200,
      });

    expect(response.status).toBe(200);
    expect(response.body.type).toBe('sell');
    expect(response.body.totalImport).toBe(200);
  });

  test('DELETE /transactions/:id - should delete a transaction', async () => {
    const transaction = await Transaction.findOne({ personName: 'Geralt' });
    const response = await request(app).delete(`/transactions/${transaction?._id}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_id', transaction?._id as Types.ObjectId);

    const deletedTransaction = await Transaction.findById(transaction?._id);
    expect(deletedTransaction).toBeNull();
  });

  test('POST /transactions - should fail with invalid data', async () => {
    const response = await request(app)
      .post('/transactions')
      .send({
        type: 'invalid_type', // Tipo no válido
        amount: -1, // Cantidad negativa
        personType: 'Hunter',
        personName: 'Geralt',
        goods: [
          {
            good: goodId,
            quantity: 1,
          },
        ],
        totalImport: 140,
      });

    expect(response.status).toBe(400);
  });
});