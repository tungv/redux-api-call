// describe('FETCH_START action', () => {
//   it('should have type of FETCH_START', () => {
//     expect(actions[0]).to.have.property('type', ACTION_FETCH_START);
//   });
//
//   it('should not have property error', () => {
//     expect(actions[0]).to.not.have.property('error');
//   });
//
//   it('should have payload that includes the original API config', () => {
//     expect(actions[0]).to.have.property('payload');
//     const { payload } = actions[0];
//     expect(payload).to.have.property('name', 'USERS');
//     expect(payload).to.have.property('endpoint', 'http://localhost:9000/api/users');
//   });
// });
//
// describe('FETCH_COMPLETE action', () => {
//   it('should have type of FETCH_COMPLETE', () => {
//     expect(actions[1]).to.have.property('type', ACTION_FETCH_COMPLETE);
//   });
//
//   it('should not have property error', () => {
//     expect(actions[1]).to.not.have.property('error');
//   });
//
//   it('should include the original API config in payload', () => {
//     expect(actions[1]).to.have.property('payload');
//     const { payload } = actions[1];
//     expect(payload).to.have.property('name', 'USERS');
//     expect(payload).to.have.property('endpoint', 'http://localhost:9000/api/users');
//   });
//
//   it('should include the json response in payload', () => {
//     const { payload: { json } } = actions[1];
//     expect(json).to.eql({ key: 'value' });
//   });
//
//   it('should include the timestamp response in payload', () => {
//     const { payload: { timestamp } } = actions[1];
//     expect(timestamp).to.equal(Date.now());
//   });
// });
//
// describe('FETCH_FAILURE action', () => {
//   it('should have type of FETCH_FAILURE', () => {
//     expect(actions[1]).to.have.property('type', ACTION_FETCH_FAILURE);
//   });
//
//   it('should not have property error', () => {
//     expect(actions[1]).to.not.have.property('error');
//   });
//
//   it('should include the original API config in payload', () => {
//     expect(actions[1]).to.have.property('payload');
//     const { payload } = actions[1];
//     expect(payload).to.have.property('name', 'USERS');
//     expect(payload).to.have.property('endpoint', 'http://localhost:9000/api/users');
//   });
//
//   it('should include the json response in payload', () => {
//     const { payload: { json } } = actions[1];
//     expect(json).to.eql({ error: 'value' });
//   });
//
//   it('should include the timestamp response in payload', () => {
//     const { payload: { timestamp } } = actions[1];
//     expect(timestamp).to.equal(Date.now());
//   });
// });
