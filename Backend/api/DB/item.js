const mongoose = require('mongoose');

const COLLECTION_NAME = 'item';

const Schema = new mongoose.Schema({}, { strict: false });

const Model = mongoose.model(
    COLLECTION_NAME,
    Schema,
    COLLECTION_NAME
);

module.exports = Model;