const express = require('express');
const responseHandler = require('./middleware/responseHandler');
const cors = require('cors');
const connectDB = require('./api/DB/DB');
const app = express();
const port = 3000;
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

connectDB();
const swaggerDocument = YAML.load(path.join(__dirname, './api/Swaggak.yaml'));

const log = require('./api/itemLogAPI');
const item = require('./api/itemAPI');
const company = require('./api/companyAPI');
const report = require('./api/reportAPI');
const activityLog = require('./api/activityLogAPI');
const users = require('./api/usersAPI');
const getImg = require('./api/getImg');
// const Test = require('./api/DB/companyModal');

app.use(cors());
app.use(express.json());
app.use(responseHandler);
app.use('/users', users);
app.use('/company', company);
app.use('/item', item);
app.use('/report', report);
app.use('/itemlog', log);
app.use('/activitylog', activityLog);
app.use('/getImage', getImg);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}/`);
  console.log('Swagger UI available on http://localhost:3000/api-docs');
});