import * as dotenv from 'dotenv';

dotenv.config({
    path: `${__dirname}/.env`
});

import('./app').then((app) => {
    return app.bootstrap();
});
