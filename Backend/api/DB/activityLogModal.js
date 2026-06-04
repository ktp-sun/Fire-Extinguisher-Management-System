const mongoose = require('mongoose');

const COLLECTION_NAME = 'activity_log';

const Schema = new mongoose.Schema({}, { strict: false });

const Model = mongoose.model(
    COLLECTION_NAME,
    Schema,
    COLLECTION_NAME
);

module.exports = Model;