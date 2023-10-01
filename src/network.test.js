const network = require('./network');
const dotenv = require('dotenv');
dotenv.config();

const couchdbUrl = process.env.COUCHDB_URL;
const dbname = '/wa-rp-integration-logs';

xdescribe('saving logs to couchdb', () => {
  test('saveLog', async () => {
    const resp = await network.saveLog({
      message: 'test-message',
      type: 'status-log',
      code: 'test-code',
      description: 'test-description',
      reported_date: 'test-reported-date',
      status: 'error',
      phone: 'test-phone'
    });

    expect(resp.data.ok).toBe(true);
    expect(resp.data.id).toBe('test-id');
  });
});
